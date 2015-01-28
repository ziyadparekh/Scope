'use strict';

var deferred = require("./deferred");
var _ = require('underscore');
var exec = require('child_process').exec;
var shellCommands = require('./shellCommands');

var ShellHelper = {};

ShellHelper.stopApp = function (app) {
	var def = deferred();
	var cmd = ShellHelper.returnRenderedCmd(shellCommands.stop, app);
	exec(cmd, function (err, stdout, stderr) {
		if (err && err.length) { def.reject(err); }
		else { def.resolve(stdout); };
	});
	return def.getPromise();
};

ShellHelper.startApp = function (app) {
	var def = deferred();
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

module.exports = ShellHelper;