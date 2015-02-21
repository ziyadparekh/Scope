'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UICreateAppTemplate');
var UIBaseInputView = require('views/UIBaseInputView');
var UITwoInputView;

UITwoInputView = Backbone.BaseView.extend({
	
	subViewConfig: {
		key: {
			construct: UIBaseInputView,
			location: '#key',
			options: {
				placeholder: "env eg ENVIRONMENT"
			}
		},
		val: {
			construct: UIBaseInputView,
			location: "#val",
			options: {
				placeholder: "val eg PRODUCTION"
			}
		}
	},

	defaults: {
		template: Templates['ui-two-input-row']
	},

	events: {
		'click .ui.delete' : 'deleteRow'
	},

	defaultKeys: ['model', 'template', 'subViewConfig'],

	initialize: function (options) {
		options = _.extend({}, this.defaults, options);

		_.each(this.defaultKeys, function (key) {
			if (!_.isUndefined(options[key])) {
				this[key] = options[key];
			}
		}, this);

		this.templateVars = this.generateTemplateVars(options);

		_.each(this.subViewConfig, function (val, key) {
			this.subs.add(key);
		}, this);
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

		this.subs.renderAppend();

		return this;
	},

	deleteRow: function (e) {
		this.triggerBubble('delete::row');
		this.remove();
	},

});

module.exports = UITwoInputView;