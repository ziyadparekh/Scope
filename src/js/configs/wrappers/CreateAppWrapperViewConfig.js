'use strict';

var Templates = require("@templates/UIWrapperViewTemplate");
var UIBaseFormView = require('views/UIBaseFormView');
var UIBaseAppInfoView = require("views/UIBaseAppInfoView");

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
    }
};
