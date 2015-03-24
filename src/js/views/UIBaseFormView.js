'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var BaseModel = require('models/BaseModel');
var Templates = require('@templates/UICreateAppTemplate');
var UIBaseInputView = require('views/UIBaseInputView');
var UIBaseGroupInputView = require('views/UIBaseGroupInputView');
var UIBaseButtonView = require('views/UIBaseButtonView');
var UIBaseSelectDropdownView = require('views/UIBaseSelectDropdownView');
var UIBaseFormView;

UIBaseFormView = Backbone.BaseView.extend({

	template: Templates['ui-form'],

	subViewConfig: {
		appName: {
			construct: UIBaseInputView,
			location: "#appname",
			singleton: true,
			options: {
				label: 'App Name',
				placeholder: 'Awesome App',
				validator: /^[A-Za-z]*$/gi,
			}
		},
		appStart: {
			construct: UIBaseInputView,
			location: "#appstart",
			singleton: true,
			options: {
				label: 'Path to app start file',
				placeholder: 'eg app/index.js'
			}
		},
		submit: {
			construct: UIBaseButtonView,
			location: '#submit',
			singleton: true,
			options: {
				text: 'Submit',
				buttonClassName: 'ui green submit button'
			}
		}
	},

	initialize: function (options) {

		_.each(this.subViewConfig, function (val, key) {
			this.subs.add(key, {model: this.model});
		}, this);

		UIBaseFormView.__super__.initialize.call(this, options);
	},

	render: function () {

		var templateVars = {};

		this.$el.html(this.template(templateVars));

		this.subs.renderAppend();

		return this;

	},

    getFormValue: function () {
        var obj = {
            appname : this.subs.get("appName").getValue(),
            start: this.subs.get("appStart").getValue(),
        }

        return obj
    }

});

module.exports = UIBaseFormView;
