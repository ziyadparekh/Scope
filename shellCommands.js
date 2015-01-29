'use strict';

var config = require('./config');

module.exports = {
	stop : 'docker stop <%= obj.appname %>',
	start: 'docker start <%= obj.appname %>',
	restart: 'docker restart <%= obj.appname %>',
	gitsetup: config.app_dir + '/scripts/gitreposetup.sh ',
	removeapp: config.app_dir + '/scripts/removeapp.js ',
};