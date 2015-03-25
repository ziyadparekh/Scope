'use strict';

var _           = require('underscore');
var crypto      = require('crypto');
var fs          = require('fs');
var path        = require('path');
var docker      = require('./generateDockerfile');
var nginx      	= require('./generateNginx');
var mkDeffered  = require('../helpers/deferred');
var database    = require('../database/database');
var AppModel    = require('../models/models').defaultAppModel;
var UserModel   = require('../models/models').defaultUserModel;
var MongoClient = require('mongodb').MongoClient;
var config      = require('../config');
var url         = config.db_url;

exports.md5 = function (string) {
	return crypto.createHash('md5').update(string).digest('hex');
};

exports.isValidKey = function (key) {
	var decoded, type, _ref;
  	_ref = key.split(' '), type = _ref[0], key = _ref[1];
  	if (!((type != null) && (key != null) && (type === 'ssh-rsa' || type === 'ssh-dss'))) {
    	return false;
  	}
  	decoded = new Buffer(key, 'base64').toString('ascii');
  	if (decoded.indexOf('ssh-rsa') === -1 && decoded.indexOf('ssh-dss') === -1) {
    	return false;
  	}
  	return true;
};

exports.isValidUsername = function (username) {
	if (username.match(/^[a-z0-9]+$/i) === null) {
		return false;
	} else {
		return true;
	}
};

exports.isValidPassword = function (password) {
	 return password && password.length < 1;
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
			}).fail(function (err) { def.reject(err); })
		}).fail(function (err) { def.reject(err); })
	}).fail(function (err) { def.reject(err); });

	return def.getPromise();
};

exports.writeNginxFile = function (app) {
	var def = mkDeffered();
	app = _.extend(app, {server : config.server});
	nginx.readNginxFile().then(function (data) {
		nginx.renderNginxFile(data, app).then(function (file) {
			nginx.writeNginxFile(file, app).then(function () {
				def.resolve();
			}).fail(function (err) { def.reject(err); })
		}).fail(function (err) { def.reject(err); })
	}).fail(function (err) { def.reject(err); });

	return def.getPromise();
};

exports.formatApp = function (appname, start, extra, user, port) {
	var def = mkDeffered();
	var dir = path.join(config.git_home_dir, user.user_name, appname + '.git');
	var gitRepo = config.gituser + "@" + config.git_dom + ":" + dir;
	var app = _.extend(AppModel, {
		app_name  	    : appname,
		app_start 	    : start,
		app_user  	    : user.user_name,
		app_port  	    : port + 1,
		app_repo  	    : gitRepo,
		app_updated	    : new Date(),
		app_created	    : new Date(),
        app_type        : extra.type,
        app_description : extra.description
	});

	def.resolve(app);
	return def.getPromise();
};

exports.formatUser = function (user) {
	var def = mkDeffered();
	var user = _.extend(UserModel, user);

	console.log(user);

	def.resolve(user);
	return def.getPromise();
};


