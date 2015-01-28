'use strict';

var _ = require('underscore');
var cnfg = require("./config");
var fs = require('fs');
var path = require('path');

var Docker = function (options) {
	_.each(options, function (val, key) {
		this[key] = val;
	}, this);

	this.templateVars = options;
}

Docker.prototype.compileTemplate = function() {
	var file = fs.readFileSync('dockerfileTemplate.html',{encoding : 'ascii'});
	var renderedString = _.template(file);
	this.dockerfile = renderedString(this.templateVars);
};

Docker.prototype.writeDockerFile = function() {
	var self = this;
	var appDir = cnfg.apps_home_dir;
	var userDir = this.app.username;
	var repoDir = this.app.repoID.toString();
	var fullPath = path.join(appDir, userDir, repoDir);
	fs.writeFileSync(fullPath + '/Dockerfile', this.dockerfile);
};

module.exports = Docker;