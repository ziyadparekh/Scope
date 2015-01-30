'use strict';

var database = require("./database");
var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var helpers = require('./helpers');
var config = require('./config');
var resHelper = require('./resHelper');
var url = config.db_url;

var doesStartExist = function (req, res, next) {
	if (!req.body.start) {
		return resHelper.send401(res, "Path to start file required");
	};
	req.start = req.body.start;
	next();
};

var findAppByRepoId = function (req, res, next) {
  if (!req.query.restart_key || !req.query.repo_id) {
    return resHelper.send401(res, "Missing Params");
  }
  var repoId = req.query.repo_id;
  helpers.getDb().then(function (db) {
    database.findNodeAppByRepoId(repoId, 'apps', db).then(function (app) {
      req.app = app;
      db.close();
      next();
    }).fail(function (err) { return resHelper.send401(res, 'App not found'); });
  }).fail(function (er) { return resHelper.send500(res, err.message )});
};

var validateAppRequest = function (req, res, next) {
	if (!req.body.appname && !req.query.appname)
		return resHelper.send401(res, 'Appname required');
	if (!req.body.start && !req.query.start)
		return resHelper.send401(res, "Path to start file required");

	var appname = req.body.appname || req.query.appname;
	var start = req.body.start || req.query.start;

	if (!/^[A-Z0-9_\-\.]*$/gi.test(appname))
		return resHelper.send400(res, 'Invalid appname, must be alphanumeric');

	req.appname = appname;
	req.start = start;
	next();
};

var doesAppExist = function (req, res, next) {
	var appname = req.appname;
	helpers.getDb().then(function (db) {
		database.findNodeAppByName(appname, 'apps', db).then(function () {
			db.close();
			resHelper.send500(res, 'An App with that appname already exists');
		}).fail(function (err) { next(); });
	}).fail(function (err) { resHelper.send500(res, err.message )});
};


var authenticate = function (req, res, next) {
	var basicauth = req.headers.authorization;

	if (typeof basicauth !== 'undefined' && basicauth.length > 0) {
		var buff = new Buffer(basicauth.substring(basicauth.indexOf(" ") + 1), 'base64');
		var creds = buff.toString('ascii');

		var username = creds.substring(0, creds.indexOf(":"));
		var password = creds.substring(creds.indexOf(":") + 1);

		MongoClient.connect(url, function (err, db) {
			if (err) {
				util.puts(err);
				res.json({
					status : 'failure',
					message : 'Internal Error'
				}, 500);
				return;
			}
			database.findSingleObjectInCollection(username, 'users', db)
				.then(function (user) {
					if (user.password === helpers.md5(password) && user.username === username) {
						req.user = user;
						next();
					} else {
						res.json({
							status : 'failure',
							message : 'Invalid username or password'
						}, 401);
						return;
					}
				}).fail(function (err) {
					util.puts(err);
					res.json({
						status : 'failure',
						message : 'Internal Error'
					}, 500);
				}).done(function () {
					db.close();
				});
		});
	} else {
		res.json({
			status : 'No authentication data sent'
		}, 401);
		return;
	}
};

var authenticateApp = function (req, res, next) {
	var appname = req.body.appname;
	if (!appname) {
		appname = req.query.appname;
	};
	if (appname) {
		appname = appname.toLowerCase();
	};
	if (!appname || appname === '') {
		res.json({
			status: 'Must pass an application name (appname)'
		}, 400);
		return;
	};
	if (req.user) {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				util.puts(err);
				res.json({
					status: 'failure',
					message: 'Internal Server Error'
				}, 500);
			};
			database.findNodeAppByName(appname, 'apps', db)
				.then(function (app) {
					if (app.appuser === req.user.username) {
						req.appname = appname;
						req.repo = req.app = app;
						next();
					} else {
						res.json({
							status: 'failure - authentication for ' + appname + ' failed'
						}, 400);
						return;
					}
				}).fail(function (err) {
					res.json({
						status: 'failure',
						message: err.message
					}, 500);
				}).done(function () {
					db.close();
				});
		});
	} else {
		res.json({
			status: 'failure',
			message: 'user authentication failed'
		}, 400);
		return;
	}
};


module.exports.authenticate       = authenticate;
module.exports.authenticateApp	  = authenticateApp;
module.exports.findAppByRepoId	  = findAppByRepoId;
module.exports.validateAppRequest = validateAppRequest;
module.exports.doesAppExist	  	  = doesAppExist;
module.exports.doesStartExist	  = doesStartExist;
