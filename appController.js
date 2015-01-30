'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var database = require('./database');
var config = require('./config');
var util = require('util');
var path = require('path');
var helpers = require('./helpers');
var DockerFile = require('./generateDockerfile');
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var url = config.db_url;
var resHelper = require('./resHelper');
var shellHelpers = require('./shellHelpers');
var AppController = module.exports;


AppController.logs = function (req, res, next) {
    var app = req.app;
    var user = req.user;

    shellHelpers.dockerLogs(app).then(function (logs) {
        resHelper.sendSuccess(res, "App logs for " + app.appname, logs);
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.update = function (req, res, next) {
    var app = req.app;
    var start = req.start;
    helpers.getDb().then(function (db) {
        database.updateApp(app, { appstart : start}, 'apps', db).then(function (result) {
            db.close();
            resHelper.sendSuccess(res, "App start file successfully updated");
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.start = function (req, res, next) {
    var app = req.app;
    helpers.getDb().then(function (db) {
        database.updateApp(app, {apprunning : true }, 'apps', db).then(function (result) {
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
        database.updateApp(app, {apprunning : false}, 'apps', db).then(function (result) {
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
    database.updateApp(app, { apprunning : true }, 'apps', db).then(function (result) {
      helpers.writeDockerFile(app).then(function () {
        shellHelpers.buildDocker(app).then(function (logs) {
            database.updateApp(app, {
                appcontainer: app.appname,
                appimage: app.appuser + "/" + app.appname,
                appupdated: new Date()
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
    var appname = req.appname.toLowerCase();
    var start = req.start;

    helpers.getDb().then(function (db) {
        database.getNextAvailablePort('apps', db).then(function (lastSavedApp) {
            helpers.formatApp(appname, start, user, lastSavedApp.port).then(function (appObject) {
                database.saveAppToNextPort(appObject, 'apps', db).then(function () {
                    shellHelpers.setupGitRepo(appObject, user).then(function () {
                        db.close();
                        resHelper.sendSuccess(res, "App successfully created", appObject);
                    }).fail(function (err) { resHelper.send500(res, err ); })
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
