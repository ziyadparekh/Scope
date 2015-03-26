'use strict';

var Templates = require("@templates/UIWrapperViewTemplate");
var UIBaseFormView = require('views/UIBaseFormView');
var UIBaseAppInfoView = require("views/UIBaseAppInfoView");
var UIAppRemoteView = require("views/UIAppRemoteView");

module.exports = {
	template: Templates['wrapper-view-template'],
	subViewConfig: {
		form: {
			construct: UIBaseFormView,
			location: "#create-form",
			singleton: true,
			options: {}
		}
	},
    AppInfoConfig: {
        construct: UIBaseAppInfoView,
        location: "#create-form",
        singleton: true,
        options: {}
    },
    AppRemoteConfig: {
        construct: UIAppRemoteView,
        location: "#app-info",
        singleton: true,
        options: {}
    },
};
