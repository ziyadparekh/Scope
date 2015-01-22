'use strict';

var database = require("./database");
var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var helpers = require('./helpers');
var config = require('./config');
var url = config.db_url;

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


module.exports.authenticate       = authenticate;