'use strict';

var MongoClient   = require('mongodb').MongoClient;
var ObjectID      = require('mongodb').ObjectID;
var database      = require('../database/database');
var config        = require('../config');
var util          = require('util');
var path          = require('path');
var helpers       = require('../helpers/helpers');
var DockerFile    = require('../helpers/generateDockerfile');
var exec          = require('child_process').exec;
var execFile      = require('child_process').execFile;
var url           = config.db_url;
var resHelper     = require('../helpers/resHelper');
var shellHelpers  = require('../helpers/shellHelpers');
var AppController = module.exports;


AppController.logs = function (req, res, next) {
    var app = req.app;
    var user = req.user;

    shellHelpers.dockerLogs(app).then(function (logs) {
        resHelper.sendSuccess(res, "App logs for " + app.app_name, logs);
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.update = function (req, res, next) {
    var app = req.app;
    var start = req.start;
    helpers.getDb().then(function (db) {
        database.updateApp(app, { app_start : start}, 'apps', db).then(function (result) {
            db.close();
            resHelper.sendSuccess(res, "App start file successfully updated");
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.start = function (req, res, next) {
    var app = req.app;
    helpers.getDb().then(function (db) {
        database.updateApp(app, {app_running : true }, 'apps', db).then(function (result) {
            shellHelpers.startApp(app).then(function () {
                db.close();
                resHelper.sendSuccess(res, "App successfully restarted");
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function(err) { resHelper.send500(res, err.message) });
};

AppController.stop = function (req, res, next) {
    var app = req.app;
    helpers.getDb().then(function (db) {
        database.updateApp(app, {app_running : false}, 'apps', db).then(function (result) {
            shellHelpers.stopApp(app).then(function () {
                db.close();
                resHelper.sendSuccess(res, 'App successfully stopped');
            }).fail(function (err) { resHelper.send500(res, err.message ); })
        }).fail(function (err) { resHelper.send500(res, err.message ); })
    }).fail(function (err) { resHelper.send500(res, err.message ); });
};

AppController.reboot = function (req, res, next) {
  var app = req.app;
  helpers.getDb().then(function (db) {
    database.updateApp(app, { app_running : true }, 'apps', db).then(function (result) {
      helpers.writeDockerFile(app).then(function () {
        shellHelpers.buildDocker(app).then(function (logs) {
            database.updateApp(app, {
                app_container: app.app_name,
                app_image: app.app_user + "/" + app.app_name,
                app_updated: new Date()
            }, 'apps', db).then(function () {
                db.close();
                util.puts(logs);
                resHelper.sendSuccess(res, "App successfully restarted");
            }).fail(function (err) { resHelper.send500(res, err.message );})
        }).fail(function (err) { resHelper.send500(res, err.message );})
      }).fail(function (err) { resHelper.send500(res, err.message );})
    }).fail(function (err) { resHelper.send500(res, err.message );})
  }).fail(function (err) { resHelper.send500(res, err.message );});
};

AppController.post = function (req, res, next) {
    var user = req.user;
    var appname = req.app_name.toLowerCase();
    var start = req.start;

    helpers.getDb().then(function (db) {
        database.getNextAvailablePort('apps', db).then(function (lastSavedApp) {
            helpers.formatApp(appname, start, user, lastSavedApp.port).then(function (appObject) {
                database.saveAppToNextPort(appObject, 'apps', db).then(function (result) {
                    console.log(result);
                    database.saveAppIdToUserPortfolio(result[0], user, 'users', db).then(function () {
                        shellHelpers.setupGitRepo(appObject, user).then(function () {
                            helpers.writeNginxFile(appObject).then(function () {
                                db.close();
                                resHelper.sendSuccess(res, "App successfully created", appObject);
                            }).fail(function (err) { resHelper.send500(res, err ); })
                        }).fail(function (err) { resHelper.send500(res, err ); })
                    }).fail(function (err) { resHelper.send500(res, err.message ); })
                }).fail(function (err) { resHelper.send500(res, err.message); })
            }).fail(function (err) { resHelper.send500(res, err); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.delete = function (req, res, next) {
    var user = req.user;
    var appname = req.appname.toLowerCase();

    helpers.getDb().then(function (db) {
        database.findNodeAppByName(appname, 'apps', db).then(function (app) {
            database.removeNodeAppByName(appname, 'apps', db).then(function () {
                shellHelpers.stopApp(app).then(function () {
                    shellHelpers.removeAppDir(app, user).then(function () {
                        //Need to add method to remove the app container and app image
                        db.close();
                        resHelper.sendSuccess(res, "App successfully deleted");
                    }).fail(function (err) { resHelper.send500(res, err); })
                }).fail(function (err) { resHelper.send500(res, err); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.star = function (req, res, next) {
    var user = req.user;
    var appname = req.appname;
    var app = req.app;

    if (app.app_stars.indexOf(user.user_name) > -1) {
        return resHelper.send401(res, 'You have already starred this app');
    };

    helpers.getDb().then(function (db) {
        database.addUserToAppStars(appname, user, 'apps', db).then(function (app_res) {
            database.addAppToUserStars(user, appname, 'users', db).then(function (user_res) {
                db.close();
                resHelper.sendSuccess(res, 'success', app_res.length);
            }).fail(function (err) { resHelper.send500(res, err); })
        }).fail(function (err) { resHelper.send500(res, err); })
    }).fail(function (err) { resHelper.send500(res, err); });
};

AppController.unstar = function (req, res, next) {
    var user = req.user;
    var appname = req.appname;
    var app = req.app;

    if (app.app_stars.indexOf(user.user_name) === -1) {
        return resHelper.send401(res, 'You never starred this app');
    };

    helpers.getDb().then(function (db) {
        database.removeUserFromAppStars(appname, user, 'apps', db).then(function (app_res) {
            database.removeAppFromUserStars(user, appname, 'users', db).then(function (user_res) {
                db.close();
                resHelper.sendSuccess(res, 'success', app_res.length);
            }).fail(function (err) { resHelper.send500(res, err); })
        }).fail(function (err) { resHelper.send500(res, err); })
    }).fail(function (err) { resHelper.send500(res, err); });
};
