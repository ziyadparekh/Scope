'use strict';

var BASE_PATH = '/Users/ziyadparekh/';

module.exports = {
	server: '192.168.59.103',
	nginxpath: '/usr/local/etc/nginx/sites-enabled/',
	db_url : 'mongodb://localhost:27017/scope',
	app_dir:  BASE_PATH + 'Scope/api',
	git_home_dir: BASE_PATH + 'Scope/git',
	apps_home_dir: BASE_PATH + 'Scope/app',
	userid: 'ziyadparekh',
	gituser: 'ziyadparekh',
	git_dom: 'localhost',
  	app_names: ['web', 'www', 'admin', 'api'],
  	access_token: 'superSecretAccessToken',
  	api: '/api/1',
  	github_secret: '11434c7d3fb34f03048d2cb68d99d8a23724f33e',
  	github_client: 'e89a024d36b0e463711b'
};
