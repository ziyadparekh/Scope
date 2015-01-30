'use strict';

var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var docker = require('./generateDockerfile');
var mkDeffered = require('./deferred');
var database = require('./database');
var AppModel = require('./models').defualtAppModel;
var MongoClient = require('mongodb').MongoClient;
var config = require('./config');
var url = config.db_url;

exports.md5 = function (string) {
	return crypto.createHash('md5').update(string).digest('hex');
};

exports.getDb = function () {
	var def = mkDeffered();
	MongoClient.connect(url, function (err, db){
		if (err) {
			def.reject(err);
		} else {
			def.resolve(db);
		}
	});
	return def.getPromise();
};

exports.writeDockerFile = function (app) {
	var def = mkDeffered();
	docker.readDockerFile().then(function (data) {
		docker.renderDockerFile(data, app).then(function (file) {
			docker.writeDockerFile(file, app).then(function () {
				def.resolve();
			}).fail(function (err) { def.reject(err); });
		}).fail(function (err) { def.reject(err); });
	}).fail(function (err) { def.reject(err); });

	return def.getPromise();
};

exports.formatApp = function (appname, start, user, port) {
	var def = mkDeffered();
	var dir = path.join(config.git_home_dir, user.username, appname + '.git');
	var gitRepo = config.gituser + "@" + config.git_dom + ":" + dir;
	var app = _.extend(AppModel, {
		appname  : appname,
		appstart : start,
		appuser  : user.username,
		appport  : port + 1,
		apprepo  : gitRepo
	});

	def.resolve(app);
	return def.getPromise();
};


