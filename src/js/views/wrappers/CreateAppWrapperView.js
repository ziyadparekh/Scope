'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var BaseModel = require('models/BaseModel');
var UIBaseAppInfoView = require("views/UIBaseAppInfoView");
var AlertView = require('views/UIAlertView');

var CreateAppWrapperView;

var AppModel = BaseModel.extend({
    url: function () {
        return "/api/1/apps"
    }
});

var AlertViewConfig = {
    size: "small",
    color: "error"
};

CreateAppWrapperView = Backbone.BaseView.extend({

	defaults: {},

	defaultKeys: ['subViewConfig', 'template'],

	viewEvents: {
		'dropdown::changed' : 'onDropDownChanged',
        "ButtonClicked": "createApp"
	},

	initialize: function (options) {

		options = _.extend({}, this.defaults, options);

		_.each(this.defaultKeys, function (key) {
			if(!_.isUndefined(options[key])) {
				this[key] = options[key];
			}
		}, this);

        this.model = options.model || new AppModel();

		_.each(this.subViewConfig, function (config, key) {
			this.subs.add(key, {model : this.model});
		}, this);

		this.templateVars = this.generateTemplateVars();

		CreateAppWrapperView.__super__.initialize.call(this, options);
	},

	generateTemplateVars: function (options) {
		var templateVars = {};
		_.each(options, function (val, key) {
			templateVars[key] = val;
		});

		return templateVars;
	},

	render: function () {
		var templateVars = this.templateVars;

		this.$el.html(this.template(templateVars));

		this.subs.renderAppend();

		return this;
	},

    createApp: function () {
        var self = this;
        var obj = this.subs.get("form").getFormValue();
        this.model.set(obj)
        this.model.save().done(function (res) {
            self.showAppDetails();
        }).fail(function (err) {
            self.showError(err);
        });
    },

    showAppDetails: function () {
        console.log(this.model.toJSON());
        this.subs.addConfig("appInfo", {
            construct: UIBaseAppInfoView,
            location: "#app-info",
            singleton: true,
            options: {}
        });
        this.subs.add("appInfo", {model : this.model});
        this.subs.get("appInfo").render().place("#app-info");
    },

    showError: function (err) {
        var error = err.responseJSON;
        var cfg = _.extend(AlertViewConfig, {
            message: error.message
        });
        var alertView = new AlertView(cfg);
        this.$("#alertView").empty();
        alertView.render().place("#alertView");
    }

});

module.exports = CreateAppWrapperView;
