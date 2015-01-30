'use strict';

var MongoClient = require('mongodb').MongoClient;
var database = require('./database');
var config = require('./config');
var util = require('util');
var helpers = require('./helpers');
var _ = require('underscore');
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

UserController.post = function (req, res, next) {
    var username = req.username;
    var email = req.email;
    var password = req.password;
    var rsakey = req.rsakey;

    helpers.formatUser(username, email, password, rsakey).then(function (userObject) {
        var userDirPromise = shellHelpers.createUserDir(userObject);
        var rsakeyPromise = shellHelpers.updateAuthKeys(userObject, rsakey);
        deferred.when(userDirPromise, rsakeyPromise).then(function () {
            helpers.getDb().then(function (db) {
                database.addObjectToCollection(userObject, 'users', db).then(function (result) {
                    db.close();
                    resHelper.sendSuccess(res, 'User account successfully created', _.omit(userObject, 'password'));
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController.update = function (req, res, next) {
    var user = req.user;
    var newpass = req.password;
    var rsakey = req.rsakey;

    if (newpass) UserController._updatePassword(user, newpass);
    else if (rsakey) UserController._updateRsaKey(user, rsakey);
};

UserController._updatePassword = function (user, newpass) {

    helpers.validatePassword(newpass).then(function () {
        helpers.getDb().then(function (db) {
            database.updateObjectInCollection(user, { password : newpass }, 'users', db).then(function () {
                db.close();
                resHelper.sendSuccess(res, 'Password successfully updated');
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController._updateRsaKey = function (user, rsakey) {

    helpers.validateRsaKey(rsakey).then(function () {
        shellHelpers.updateAuthKeys(user, rsakey).then(function () {
            resHelper.sendSuccess(res, "RSA key successfully updated");
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController.delete = function (req, res, next) {
    var user = req.user;

    helpers.getDb().then(function (db) {
        database.getUserPortfolio(user, 'apps', db).then(function (result) {
            var deleteAppPromises = [];
            var stopAppPromises = [];
            var removeDirPromises = [];
            _.map(result, function (app) {
                deleteAppPromises.push(database.removeNodeAppByName(app.appname, 'apps', db));
                stopAppPromises.push(shellHelpers.stopApp(app));
                removeDirPromises.push(shellHelpers.removeAppDir(app));
                //Need to add method to remove the app container and app image
            });
            deferred.when(deleteAppPromises).then(function () {
                deferred.when(stopAppPromises).then(function () {
                    deferred.when(removeDirPromises).then(function () {
                        shellHelpers.removeUserDir(user).then(function () {
                            database.removeObjectFromCollection(user, 'users', db).then(function () {
                                db.close();
                                resHelper.sendSuccess(res, "Successfully deleted user account and all associated apps");
                            }).fail(function (err) { resHelper.send500(res, err.message); })
                        }).fail(function (err) { resHelper.send500(res, err.message); })
                    }).fail(function (err) { resHelper.send500(res, err.message); })
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
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
