'use strict';

var MongoClient = require('mongodb').MongoClient;
var database = require('./database');
var config = require('./config');
var util = require('util');
var helpers = require('./helpers');
var _ = require('underscore');
var exec = require('child_process').exec
var url = config.db_url;
var resHelper = require('./resHelper');
var shellHelpers = require('./shellHelpers');
var deferred = require("./deferred");

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


UserController.post = function (req, res, next) {
    console.log('NEW USER');

    var username = req.username;
    var email = req.email;
    var password = helpers.md5(req.password);
    var rsakey = req.rsaKey;

    helpers.formatUser(username, email, password).then(function (userObject) {
        var userDirPromise = shellHelpers.createUserDir(userObject);
        var rsakeyPromise = shellHelpers.updateAuthKeys(userObject, rsakey);
        deferred.all(userDirPromise, rsakeyPromise).then(function () {
            helpers.getDb().then(function (db) {
                database.addObjectToCollection(userObject, 'users', db).then(function (result) {
                    db.close();
                    resHelper.sendSuccess(res, 'User account successfully created', _.omit(userObject, 'userpassword'));
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

UserController.update = function (req, res, next) {
    var user = req.user;
    var newpass = req.body.password;
    var rsakey = req.body.rsakey;

    if (!newpass && !rsakey) {
        resHelper.send500(res, 'Need either a new password or rsa key');
    };

    if (newpass) UserController._updatePassword(user, newpass, res);
    else if (rsakey) UserController._updateRsaKey(user, rsakey, res);
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
        deferred.all([rsakeyPromise]).then(function (result) {
            console.log('asdasd');
            resHelper.sendSuccess(res, "RSA key successfully updated");
        }).fail(function (err) { resHelper.send500(res, err.message); });
    } else {
        resHelper.send500(res, 'Invalid Key');
    }
};

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