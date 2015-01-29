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


AppController.start = function (req, res, next) {
    var app = req.app;
    helpers.getDb().then(function (db) {
        database.updateApp(app, {apprunning : true }, 'apps', db).then(function (result) {
            shellHelpers.startApp(app).then(function () {
                db.close();
                resHelper.sendSuccess(res, "App successfully restarted");
            }).fail(function (err) { resHelper.send500(res, err.message) });
        }).fail(function (err) { resHelper.send500(res, err.message) });
    }).fail(function(err) { resHelper.send500(res, err.message) });
};

AppController.stop = function (req, res, next) {
    var app = req.app;
    helpers.getDb().then(function (db) {
        database.updateApp(app, {apprunning : false}, 'apps', db).then(function (result) {
            shellHelpers.stopApp(app).then(function () {
                db.close();
                resHelper.sendSuccess(res, 'App successfully stopped');
            }).fail(function (err) { resHelper.send500(res, err.message )});
        }).fail(function (err) { resHelper.send500(res, err.message )});
    }).fail(function (err) { resHelper.send500(res, err.message )});
};

AppController.reboot = function (req, res, next) {
  var app = req.app;
  helpers.getDb().then(function (db) {
    database.updateApp(app, { apprunning : true }, 'apps', db).then(function (result) {
      helpers.writeDockerFile(app).then(function () {
        shellHelpers.buildDocker(app).then(function (logs) {
          db.close();
          util.puts(logs);
          resHelper.sendSuccess(res, "App successfully restarted");
        }).fail(function (err) { resHelper.send500(res, err.message )});
      }).fail(function (err) { resHelper.send500(res, err.message )});
    }).fail(function (err) { resHelper.send500(res, err.message )});
  }).fail(function (err) { resHelper.send500(res, err.message )});
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
                        db.close();
                        resHelper.sendSuccess(res, "App successfully deleted");
                    }).fail(function (err) { resHelper.send500(res, err); })
                }).fail(function (err) { resHelper.send500(res, err); })
            }).fail(function (err) { resHelper.send500(res, err.message); })
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

AppController.restart = function (req, res, next) {
    var repoID = req.body.repo_id;
    if (!repoID) {
        repoID = req.query.repo_id;
    };
    console.log(repoID);
    var repoObjectId = ObjectID(repoID);
    MongoClient.connect(url, function (err, db) {
        if (err) {
            util.puts(err.message)
            res.json({
                status: 'Internal Server Error'
            }, 500);
        };
        database.findNodeAppByRepoId(repoObjectId, 'repos', db)
            .then(function (repoObject) {
                var appname = repoObject.appname;
                database.findNodeAppByName(appname, 'apps', db)
                    .then(function (appObject) {
                        var dockerObject = {
                            start: appObject.start,
                            port: appObject.port,
                            app: {
                                username: appObject.username,
                                repoID: appObject.repoID.toString()
                            }
                        };
                        var dockerFile = new DockerFile(dockerObject);
                        dockerFile.compileTemplate();
                        dockerFile.writeDockerFile();
                        var appUserHome = path.join(config.apps_home_dir, appObject.username, appObject.repoID.toString());
                        execFile(config.app_dir + '/startdocker.sh', [appUserHome, appObject.username, appObject.appname, appObject.port], function (err, stdout, stderr) {
                            if (err) util.puts('git setup err %s', err);
                            if (stdout.length > 0) util.puts('gitsetup stdout %s', stdout);
                            if (stderr.length > 0) util.puts('gitsetup stderr %s', stderr);
                        });

                        res.json({
                            status: 'success',
                            message: 'restarted your app'
                        }, 200);
                    });
            });
    });
}





