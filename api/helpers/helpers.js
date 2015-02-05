'use strict';

var _           = require('underscore');
var crypto      = require('crypto');
var fs          = require('fs');
var path        = require('path');
var docker      = require('./generateDockerfile');
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
	 var truth = password && password.length < 1 ? false : true;
	 return truth;
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
		appname  	: appname,
		appstart 	: start,
		appuser  	: user.username,
		appport  	: port + 1,
		apprepo  	: gitRepo,
		appupdated	: new Date(),
		appcreated	: new Date()
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


