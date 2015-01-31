'use strict';

exports.defaultAppModel = {
	appname 		: "",
	appstart 		: "",
	appport			: "",
	apprepo			: "",
	appuser			: "",
	appcontainer	: "",
	appimage		: "",
	appcreated		: "",
	appupdated		: "",
	appstars		: [],
	apprunning		: false
};

exports.defaultUserModel = {
	username: "",
	userpassword: "",
	useremail: "",
	userapps: [],
	userstarred: []
};