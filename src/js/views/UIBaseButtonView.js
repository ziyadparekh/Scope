'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIBaseButtonTemplate');
var UIBaseButtonView;

UIBaseButtonView = Backbone.BaseView.extend({

	template: Templates['ui-button'],

	defaults: {
		className: ''
	},

	defaultKeys: ['template'],

	events: {
		'click .ui.button' : 'clickEventHandler'
	},

	viewEvents: {
		'validationFailed' : 'disable',
		'validationPassed' : 'enable'
	},

	initialize: function (options) {

		options = _.extend({}, this.defaults, options);

		_.each(this.defaultKeys, function (key) {
			if (!_.isUndefined(options[key])) {
				this[key] = options[key];
			}
		}, this);

		this.templateVars = this.generateTemplateVars(options);

		UIBaseButtonView.__super__.initialize.call(this, options);

	},

	generateTemplateVars: function (options) {
		
		var templateVars = {};
		
		_.each(options, function (val, key) {
			templateVars[key] = val;
		});

		return templateVars;
	},

	render: function () {
		this.$el.html(this.template(this.templateVars));

		return this;
	},

	clickEventHandler: function (e) {
		console.log('click');
	},

	disable: function () {
		this.$('.ui.button').disable();
	},

	enable: function () {
		this.$('.ui.button').enable();
	}

});

module.exports = UIBaseButtonView;
