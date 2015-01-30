'use strict';

var deferred = require("./deferred");
var _ = require('underscore');
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var shellCommands = require('./shellCommands');
var config = require('./config');
var path = require('path');
var util = require('util');

var ShellHelper = {};

ShellHelper.stopApp = function (app) {
	var def = deferred();
	if (!app.apprunning) {
		def.resolve('App is already stopped');
		return def.getPromise();
	}
	var cmd = ShellHelper.returnRenderedCmd(shellCommands.stop, app);
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
	});
	return def.getPromise();
};

ShellHelper.startApp = function (app) {
	var def = deferred();
	if (app.apprunning) {
		def.resolve('App is already running');
		return def.getPromise();
	}
	var cmd = ShellHelper.returnRenderedCmd(shellCommands.start, app);
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
		else { def.resolve(stdout); };
	});
	return def.getPromise();
};

ShellHelper.returnRenderedCmd = function (string, app) {
	var cmdFunc = _.template(string);
	return cmdFunc({appname : app.appname});
};

ShellHelper.buildDocker = function (app) {
	var def = deferred();
	var appUserHome = path.join(config.apps_home_dir, app.appuser, app.appname);
	var args = [appUserHome, app.appuser, app.appname, app.appport];
	execFile(config.app_dir + '/startdocker.sh', args, function (err, stdout, stderr) {
        if (err) { def.reject(err); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });
    return def.getPromise();
};

ShellHelper.dockerLogs = function (app) {
	var def = deferred();
	if (!app.apprunning) {
		def.resolve('App is not running');
		return def.getPromise();
	}
	var cmd = ShellHelper.returnRenderedCmd(shellCommands.logs, app);
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
		if (stdout.length) { def.resolve(stdout); }
		if (stderr.length) { def.resolve(stderr); }
	});
	return def.getPromise();
};

ShellHelper.setupGitRepo = function (app, user) {
	var def = deferred();
	var args = [config.app_dir,
				config.git_home_dir,
				user.username,
				app.appname,
				app.appstart,
				config.userid,
				config.gituser,
				config.apps_home_dir];

    var cmd = shellCommands.gitsetup + args.join(" ");

    util.format("gitsetup cmd %s", cmd);
    exec(cmd, function (err, stdout, stderr) {
        if (err) { def.reject(err); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });

    return def.getPromise();
};

ShellHelper.removeAppDir = function (app, user) {
	  var def = deferred();
	  var appUserHome = path.join(config.apps_home_dir, app.appuser, app.appname);
    var appGitHome = path.join(config.git_home_dir, app.appuser, app.appname);
    var cmd = shellCommands.removeapp + appUserHome + ' ' + appGitHome + ' ' + app.appcontainer + ' ' + app.appimage;
    util.format("remove app dir cmd %s", cmd);
    exec(cmd, function (err, stdout, stderr) {
        if (err) { def.reject(err.message); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });

    return def.getPromise();
};

module.exports = ShellHelper;
