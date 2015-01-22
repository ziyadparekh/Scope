'use strict';

var MongoClient = require('mongodb').MongoClient;
var database = require('./database');
var config = require('./config');
var util = require('util');
var helpers = require('./helpers');
var exec = require('child_process').exec
var url = config.db_url;
var User = module.exports;

var isValidKey = function (key) {
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

User.delete = function (req, res, next) {
	var user = req.user;
	console.log(user);

	MongoClient.connect(url, function (err, db) {
		if (err) {
			util.puts(err.message);
			res.json({
				status : 'Internal Server Error'
			}, 500);
		}
		database.removeObjectFromCollection(user, 'users', db)
			.then(function () {
				res.json({
					status : 'success'
				}, 200);
			}).fail(function (err) {
				res.json({
					status : 'failure',
					message : err.message
				}, 500);
			}).done(function () {
				db.close();
			});
	});
};

User.put = function (req, res, next) {
	var user = req.user;
	var newpass = req.body.password;
	var rsakey = req.body.rsakey;

	if (newpass) {
		if (newpass.length < 1) {
			res.json({
				status : 'failure - invalid password. must be atleast 1 character'
			}, 400);
			return true;
		};
		MongoClient.connect(url, function (err, db) {
			var newUserObject;
			if (err) {
				util.puts(err);
				res.json({
					status : 'Internal Server Error'
				}, 500);
				return;
			}
			newUserObject = {
				username : user.username,
				password : helpers.md5(newpass)
			};
			database.updateObjectInCollection(newUserObject, 'users', db)
				.then(function (result) {
					res.json({
						status : 'success',
						message : 'password updated'
					}, 200);
				}).fail(function (err) {
					res.json({
						status : 'failure',
						message : err.message
					});
				}).done(function () {
					db.close();
				});
		});
	} else if (rsakey) {
		if (!isValidKey(rsakey)) {
			res.json({
				status : 'Failure',
				message : 'Invalid rsa key'
			});
		} else {
			exec(config.app_dir + '/scripts/updateAuthKeys.js ' + config.git_home_dir + '/' + user.username + ' "' + rsakey + '"');
			res.json({
				status : 'success',
				message : "rsa key added"
			});
		}
	};
};

User.post = function (req, res, next) {
	
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	var rsakey = req.body.rsakey;

	if (password && password.length < 1) {
		res.json({
			status : 'failure - invalid password. must be atleast 1 character'
		}, 400);
		return true;
	} else if (username.match(/^[a-z0-9]+$/i) === null) {
		res.json({
			status : 'failure - invalid username. must be alphanumeric'
		}, 400);
		return true;
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				util.puts(err);
				res.json({
					status : 'Internal Server Error'
				}, 500);
				return;
			}
			database.findSingleObjectInCollection(username, 'users', db)
				.then(function (user) {
					var newUserObject;
					if (!user) {
						if (typeof rsakey === 'undefined' || !isValidKey(rsakey)) {
							res.json({
								status : 'failure - rsakey is invalid'
							}, 400);
						} else {
							exec(config.app_dir + '/scripts/updateAuthKeys.js ' + config.git_home_dir + '/' + username + ' "' + rsakey + '"');
							exec(config.app_dir + '/scripts/createUserDir.js ' + username, function (err, stdout, stderr) {
								console.log('stdout: ' + stdout);
    							console.log('stderr: ' + stderr);
							    if (err !== null) {
							      console.log('exec error: ' + err);
							    }
							});
							newUserObject = {
								username : username,
								password : helpers.md5(password),
								email : email
							};
					   		database.addObjectToCollection(newUserObject, 'users', db)
					   			.then(function () {
					   				res.json({
					   					status: 'success'
					   				}, 200);
					   			}).fail(function (err) {
					   				res.json({
					   					status : 'failed',
					   					message : err.message
					   				}, 500);
					   			}).done(function () {
									db.close();
								});
						}
					} else {
						res.json({
							status: 'failure',
							message: 'account exists'
						}, 401);
					}
				});
		});
	}
};