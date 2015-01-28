'use strict';

module.exports = {
	stop : 'docker stop <%= obj.appname %>',
	start: 'docker start <%= obj.appname %>',
	restart: 'docker restart <%= obj.appname %>',
};