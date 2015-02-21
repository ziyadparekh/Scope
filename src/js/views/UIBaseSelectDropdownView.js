'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var UIBaseInputView = require('views/UIBaseInputView');
var Templates = require('@templates/UIBaseButtonTemplate');

var UIBaseSelectDropdownView;

UIBaseSelectDropdownView = UIBaseInputView.extend({

	generateTemplateVars: function (options) {
		var templateVars = {};
		_.each(options, function (val, key) {
			templateVars[key] = options[key]
		});

		return templateVars;
	},

	render: function () {
		var self = this;

		UIBaseSelectDropdownView.__super__.render.call(this);

		this.$('.dropdown').dropdown({
		    transition: 'drop',
		    onChange: function (value, text, $choice) {
		    	self.announceValue(value);
		    }
  		});

  		return this;
	},

	announceValue: function (val) {
		this.triggerBubble('dropdown::changed', val);
	}
});

module.exports = UIBaseSelectDropdownView;