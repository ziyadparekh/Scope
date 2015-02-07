'use strict';

exports.defaultAppModel = {
	app_name 		: "",
	app_start 		: "",
	app_port		: "",
	app_repo		: "",
	app_user		: "",
	app_container	: "",
	app_image		: "",
	app_created		: "",
	app_updated		: "",
	app_stars		: [],
	app_running		: false
};

exports.defaultUserModel = {
	user_name: "",
	user_email: "",
	user_apps: [],
	user_rsakey: false,
	user_starred: [],
	user_followers: [],
	user_following: [],
};