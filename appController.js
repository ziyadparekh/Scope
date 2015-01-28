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
        database.updateApp(app, {running : true }, 'apps', db).then(function (result) {
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
        database.updateApp(app, {running : false}, 'apps', db).then(function (result) {
            shellHelpers.stopApp(app).then(function () {
                db.close();
                resHelper.sendSuccess(res, 'App successfully stopped');
            }).fail(function (err) { resHelper.send500(res, err.message )});
        }).fail(function (err) { resHelper.send500(res, err.message )});
    }).fail(function (err) { resHelper.send500(res, err.message )});
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

AppController.delete = function (req, res, next) {
    var appname = req.body.appname;
    if (!appname) {
        appname = req.query.appname;
    };
    appname = appname.toLowerCase();
    MongoClient.connect(url, function (err, db) {
        if (err) {
            util.puts(err.message);
            res.json({
                status : 'Internal Server Error'
            }, 500);
        };
        database.findNodeAppByName(appname, 'apps', db)
            .then(function (app) {
                if (app) {
                    database.removeNodeAppByName(appname, 'apps', db)
                        .then(function () {
                            var appUserHome = path.join(config.apps_home_dir, app.username, app.repoID.toString());
                            var appGitHome = path.join(config.git_home_dir, app.username, app.repoID.toString());
                            //NEED TO STOP THE APP AS WELL WILL DO THAT WHEN I FIGURE OUT HOW TO START THE APP HAHA
                            exec(config.app_dir + '/scripts/removeapp.js ' + appUserHome + ' ' + appGitHome);
                            database.removeNodeRepoFromRepos(appname, 'repos', db)
                                .then(function () {
                                    res.json({
                                        status: 'success',
                                        message: 'successfully removed your app ' + appname
                                    }, 200);        
                                }).fail(function (err) {
                                    res.json({
                                        status: 'failure',
                                        message: err.message
                                    }, 500);        
                                }).done(function () {
                                    db.close();
                                });
                        }).fail(function (err) {
                            res.json({
                                status: 'failure',
                                message: err.message
                            }, 500);
                        });
                } else {
                    res.json({
                        status: 'failure',
                        message: 'No app with that name found'
                    }, 400);
                    return;
                }
            }).fail(function (err) {
                res.json({
                    status: 'failure',
                    message: err.message
                }, 500);
            });
    });
};

AppController.post = function (req, res, next) {
    var appname = req.body.appname;
    var start = req.body.start;

    if (!appname) {
        appname = req.query.appname;
    };

    if (!appname) {
        res.json({
            status: 'failure',
            message: 'Appname required'
        }, 400);
        return;
    }
    if (!/^[A-Z0-9_\-\.]*$/gi.test(appname)) {
        res.json({
            status: 'failure',
            message: 'Invalid appname, must be alphanumeric'
        }, 400);
        return;
    }
    if (!start) {
        res.json({
            status: 'failure',
            message: 'Start File Required'
        }, 400);
        return;
    }
    var user = req.user;
    appname = appname.toLowerCase();
    MongoClient.connect(url, function (err, db) {
        if (err) {
            util.puts(err.message);
            res.json({
                status : 'Internal Server Error'
            }, 500);
        };
        database.findNodeAppByName(appname, 'apps', db)
            .then(function (app) {
                if (!app) {
                    database.getNextAvailablePort('ports', db)
                        .then(function (port) {
                            var appPort = port.portNumber + 1;
                            var appObject = {
                                appname : appname,
                                start : start,
                                port : appPort,
                                userID : user._id,
                                username : user.username,
                                repoID : port._id,
                                pid : 'unknown',
                                running : false,
                                env : {}
                            };
                            database.saveNextPort({portNumber : appPort}, 'ports', db)
                                .done(function () {
                                  util.puts('success, new port created at %i', appPort);
                                });
                            database.saveAppToNextPort(appObject, 'apps', db)
                                .then(function () {
                                    var newRepoObject = {
                                        repoID: port._id,
                                        username: user.username,
                                        appname: appname
                                    };
                                    database.saveNewRepoToCollection(newRepoObject, 'repos', db)
                                        .then(function () {
                                            var params = [config.app_dir, config.git_home_dir, user.username,
                                                        port._id, start, config.userid, config.gituser, config.apps_home_dir];
                                            var cmd = config.app_dir + '/scripts/gitreposetup.sh ' + params.join(" ");

                                            util.puts("gitsetup cmd %s", cmd);
                                            exec(cmd, function (err, stdout, stderr) {
                                                if (err) util.puts('git setup err %s', err);
                                                if (stdout.length > 0) util.puts('gitsetup stdout %s', stdout);
                                                if (stderr.length > 0) util.puts('gitsetup stderr %s', stderr);
                                            });
                                            //Respond to API
                                            var gitRepo = config.gituser + "@" + config.git_dom + ":" + path.join(config.git_home_dir, user.username, port._id + '.git');
                                            res.json({
                                                status: 'success',
                                                port: appPort,
                                                gitrepo: gitRepo,
                                                start : start,
                                                running: false,
                                                pid: 'unknown',
                                                appname: appname
                                            }, 200);
                                        }).fail(function (err) {
                                            res.json({
                                                status: 'failure',
                                                message: err.message
                                            }, 500);
                                        }).done(function () {
                                            db.close();
                                        });
                                }).fail(function (err) {
                                    res.json({
                                        status: 'failure',
                                        message: err.message
                                    }, 500);
                                });
                        }).fail(function (err) {
                            res.json({
                                status: 'failure',
                                message: err.message
                            }, 500);
                        });
                } else {
                    res.json({
                        status: 'failure',
                        message: 'appname already exists'
                    }, 400);
                }
            }).fail(function (err) {
                res.json({
                    status: 'failure',
                    message: err.message
                }, 500);
            });
    });
};