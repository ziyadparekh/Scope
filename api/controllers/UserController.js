'use strict';

var MongoClient   = require('mongodb').MongoClient;
var database      = require('../database/database');
var config        = require('../config');
var util          = require('util');
var helpers       = require('../helpers/helpers');
var _             = require('underscore');
var exec          = require('child_process').exec
var url           = config.db_url;
var resHelper     = require('../helpers/resHelper');
var shellHelpers  = require('../helpers/shellHelpers');
var deferred      = require("../helpers/deferred");

var User = {};
var UserController = module.exports;


UserController.listApps = function (req, res, next) {
    var user = req.user;

    helpers.getDb().then(function (db) {
        database.getUserPortfolio(user, 'apps', db).then(function (result) {
            var message = result.length + ' apps found';
            resHelper.sendSuccess(res, message, result);
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message);});
};

UserController.follow = function (req, res, next) {
    var user = req.user;
    var following = req.username;

    helpers.getDb().then(function (db) {
        database.findSingleObjectInCollection(user.user_name, 'users', db).then(function (userObject) {
            if (userObject.user_following.indexOf(following) > -1) {
                return resHelper.send401(res, "You are already following this person");
            }
            database.addFollowToUser(following, userObject, 'users', db).then(function (user_res) {
                database.addUserToFollow(userObject.user_name, following, 'users', db).then(function (follow_res) {
                    db.close();
                    resHelper.sendSuccess(res, 'success', user_res.length);
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController.unfollow = function (req, res, next) {
    var user = req.user;
    var unfollow = req.username;

    helpers.getDb().then(function (db) {
        database.findSingleObjectInCollection(user.user_name, 'users', db).then(function (userObject) {
            if (userObject.user_following.indexOf(unfollow) === -1) {
                return resHelper.send401(res, "You aren't following this person");
            }
            database.removeFollowFromUser(userObject, unfollow, 'users', db).then(function (user_res) {
                database.removeUserFromUnfollow(unfollow, userObject, 'users', db).then(function (unfollow_res) {
                    db.close();
                    resHelper.sendSuccess(res, 'success', user_res.length);
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};


UserController.post = function (req, res, next) {
    console.log('NEW USER');

    var user = req.user;

    if (user._id) return res.redirect('/');

    helpers.formatUser(user).then(function (userObject) {
        var userDirPromise = shellHelpers.createUserDir(userObject);
        //var rsakeyPromise = shellHelpers.updateAuthKeys(userObject, rsakey);
        deferred.all(userDirPromise).then(function () {
            helpers.getDb().then(function (db) {
                database.addObjectToCollection(userObject, 'users', db).then(function (result) {
                    db.close();
                    res.redirect('/');
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController.update = function (req, res, next) {
    var user = req.user;
    //var newpass = req.body.password;
    var rsakey = req.body.rsakey;

    if (!rsakey) {
        resHelper.send500(res, 'Need an rsa key');
    };

    if (rsakey) UserController._updateRsaKey(user, rsakey, res);
};

UserController._updatePassword = function (user, newpass, res) {
    console.log('UPDATE PASS');
    console.log(user);

    if(helpers.isValidPassword(newpass)) {
        helpers.getDb().then(function (db) {
            database.updateObjectInCollection(user, { userpassword : helpers.md5(newpass) }, 'users', db).then(function () {
                db.close();
                resHelper.sendSuccess(res, 'Password successfully updated');
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); });
    } else {
       resHelper.send500(res, 'Invalid Password');
    }
};

UserController._updateRsaKey = function (user, rsakey, res) {
    console.log('UPDATE RSA KEY');
    console.log(user);

    if (helpers.isValidKey(rsakey)) {
        var rsakeyPromise = shellHelpers.updateAuthKeys(user, rsakey);
        var userUpdateProcess = UserController._getRsaPromise(user);
        deferred.all([rsakeyPromise, userUpdateProcess]).then(function (result) {
            console.log('asdasd');
            resHelper.sendSuccess(res, "RSA key successfully updated");
        }).fail(function (err) { resHelper.send500(res, err.message); });
    } else {
        resHelper.send500(res, 'Invalid Key');
    }
};

UserController._getRsaPromise = function (user) {
    var def = deferred();
    helpers.getDb().then(function (db) {
        database.updateObjectInCollection(user, { user_rsakey : true }, 'users', db).then(function (result) {
            db.close();
            def.resolve(result);
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });

    return def.getPromise();
}

UserController.delete = function (req, res, next) {
    var user = req.user;
    console.log('DELETE');
    console.log(user);

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
            deferred.all(deleteAppPromises).then(function () {
                deferred.all(stopAppPromises).then(function () {
                    deferred.all(removeDirPromises).then(function () {
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
