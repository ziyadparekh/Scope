'use strict';

var _ = require('underscore');
var config = require("../config");
var fs = require('fs');
var path = require('path');
var mkDeffered = require('../helpers/deferred');

var nginx = {};

nginx.readNginxFile = function () {
	var def = mkDeffered();
	var path = config.app_dir + '/templates/';
	fs.readFile(path + 'nginxTemplate.html',{encoding : 'ascii'}, function (err, data) {
		if (err) { def.reject(err) }
		else { def.resolve(data); }
	});
	return def.getPromise();
}

nginx.renderNginxFile = function (data, app) {
	var def = mkDeffered();
	var renderedString = _.template(data);
	var nginxfile = renderedString(app);
	def.resolve(nginxfile);
	return def.getPromise();
};

nginx.writeNginxFile = function (file, app) {
	var def = mkDeffered();
	fs.writeFile(config.nginxpath + app.app_name, file, function (err) {
		if (err) { def.reject(err) }
		else { def.resolve() };
	});
	return def.getPromise();
};

module.exports = nginx;