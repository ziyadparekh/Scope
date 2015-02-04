'use strict';

var _ = require('underscore');
var config = require("../config");
var fs = require('fs');
var path = require('path');
var mkDeffered = require('../helpers/deferred');

exports.readDockerFile = function () {
	var def = mkDeffered();
	fs.readFile('dockerfileTemplate.html',{encoding : 'ascii'}, function (err, data) {
		if (err) { def.reject(err) }
		else { def.resolve(data); }
	});
	return def.getPromise();
};

exports.renderDockerFile = function (data, app) {
	var def = mkDeffered();
	var renderedString = _.template(data);
	var dockerfile = renderedString(app);
	def.resolve(dockerfile);
	return def.getPromise();
};

exports.writeDockerFile = function (file, app) {
	var def = mkDeffered();
	var fullPath = path.join(config.apps_home_dir, app.appuser, app.appname);
	fs.writeFile(fullPath + '/Dockerfile', file, function (err) {
		if (err) { def.reject(err) }
		else { def.resolve() };
	});
	return def.getPromise();
};
