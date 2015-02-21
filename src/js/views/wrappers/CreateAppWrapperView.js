'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');

var CreateAppWrapperView;

CreateAppWrapperView = Backbone.BaseView.extend({

	defaults: {},

	defaultKeys: ['subViewConfig', 'template'],

	viewEvents: {
		'dropdown::changed' : 'onDropDownChanged'
	},

	initialize: function (options) {

		options = _.extend({}, this.defaults, options);

		_.each(this.defaultKeys, function (key) {
			if(!_.isUndefined(options[key])) {
				this[key] = options[key];
			}
		}, this);

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

	onDropDownChanged: function (val) {
		// Do something with dropwdown val
		console.log(val);
	}
});

module.exports = CreateAppWrapperView;