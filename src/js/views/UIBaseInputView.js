'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIBaseButtonTemplate');
var UIBaseInputView;

UIBaseInputView = Backbone.BaseView.extend({

	defaults: {
		template: Templates['ui-base-input-view'],
		className: 'field'
	},

	defualtKeys: ['model', 'template', 'className', 'validator'],

	viewEvents: {
		'validate' : 'validate'
	},

	initialize: function (options) {

		options = _.extend({}, this.defaults, options);

		_.each(this.defualtKeys, function (val) {
			if (!_.isUndefined(options[val])) {
				this[val] = options[val];
			};
		}, this);

		this.templateVars = this.generateTemplateVars(options);

		console.log(this);

		UIBaseInputView.__super__.initialize.call(this);

	},

	generateTemplateVars: function (options) {
		
		var templateVars = {};
		
		_.each(options, function (val, key) {
			templateVars[key] = val;
		});

		return templateVars;
	},

	validate: function () {
		var val = this.$('input').val();

		if (!this.validator.match(val)) {
			this.triggerBubble('invalid');
			return false;
		} else {
			return true;
		}
	},

	render: function () {

		console.log(this.templateVars);

		this.$el.html(this.template(this.templateVars));

		return this;
	}
});

module.exports = UIBaseInputView;

