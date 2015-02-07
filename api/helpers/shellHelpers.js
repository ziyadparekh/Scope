'use strict';

var deferred      = require("../helpers/deferred");
var _             = require('underscore');
var exec          = require('child_process').exec;
var execFile      = require('child_process').execFile;
var shellCommands = require('./shellCommands');
var config        = require('../config');
var path          = require('path');
var util          = require('util');

var ShellHelper = {};

ShellHelper.createUserDir = function (user) {
	var def = deferred();
	var cmd = config.app_dir + '/scripts/createUserDir.js ' + user.user_name;
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
	});
	return def.getPromise();
};

ShellHelper.updateAuthKeys = function (user, key) {
	var def = deferred();
	var username = user.user_name;
	var cmd = config.app_dir + '/scripts/updateAuthKeys.js ' + config.git_home_dir + '/' + username + ' "' + key + '"';
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
		else { def.resolve(); }
	});
	return def.getPromise();
};

ShellHelper.stopApp = function (app) {
	var def = deferred();
	if (!app.app_running) {
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
	if (app.app_running) {
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
	return cmdFunc({appname : app.app_name});
};

ShellHelper.buildDocker = function (app) {
	var def = deferred();
	var appUserHome = path.join(config.apps_home_dir, app.app_user, app.app_name);
	var args = [appUserHome, app.app_user, app.app_name, app.app_port];
	execFile(config.app_dir + '/scripts/startdocker.sh', args, function (err, stdout, stderr) {
        if (err) { def.reject(err); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });
    return def.getPromise();
};

ShellHelper.dockerLogs = function (app) {
	var def = deferred();
	if (!app.app_running) {
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
				user.user_name,
				app.app_name,
				app.app_start,
				config.userid,
				config.gituser,
				config.apps_home_dir];

  console.log(args);

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
	var appUserHome = path.join(config.apps_home_dir, app.app_user, app.app_name);
    var appGitHome = path.join(config.git_home_dir, app.app_user, app.app_name);
    var cmd = shellCommands.removeapp + appUserHome + ' ' + appGitHome;
    util.puts("remove app dir cmd ->" + cmd);
    exec(cmd, function (err, stdout, stderr) {
        if (err) { def.reject(err.message); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });

    return def.getPromise();
};

ShellHelper.removeUserDir = function (user) {
	var def = deferred();
	var userAppDir = path.join(config.apps_home_dir, user.user_name);
	var appGitHome = path.join(config.git_home_dir, user.user_name);
	var cmd = shellCommands.removeuser + userAppDir + ' ' + appGitHome;
	util.format("remove user dir cmd %s", cmd);
	exec(cmd, function (err, stdout, stderr) {
        if (err) { def.reject(err.message); }
        if (stdout.length) { def.resolve(stdout); }
        if (stderr.length) { def.resolve(stderr); }
    });
    return def.getPromise();
};

module.exports = ShellHelper;
