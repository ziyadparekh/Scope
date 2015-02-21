'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UICreateAppTemplate');
var UITwoInputView = require('views/UITwoInputView');
var UIBaseGroupInputView;

UIBaseGroupInputView = Backbone.BaseView.extend({

	defaultKeys: ['collection', 'template', 'maxNumRows'],

	defaults: {
		template: Templates['ui-group-input-view']
	},

	numRows: 0,

	inputConfig: {
		construct: UITwoInputView,
		location: '.',
		options: {
			className: 'right floated six wide column',
			label: 'Enter key-value pair',
			keyColumnClass: 'six wide field',
			valColumnClass: 'six wide field'
		}
	},

	events: {
		'click .ui.addRow' : 'addNewRow'
	},

	viewEvents: {
		'delete::row' : 'deleteRow'
	},

	initialize: function (options) {
		options = _.extend({}, this.defaults, options);

		_.each(this.defaultKeys, function (key) {
			if (!_.isUndefined(options[key])) {
				this[key] = options[key];
			}
		}, this);

		this.templateVars = this.generateTemplateVars(options);
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

	addNewRow: function () {
		if (this.numRows === this.maxNumRows) {
			return false;
		}
		var subView;
		this.subs.addConfig('input-' + this.numRows, this.inputConfig);
		this.subs.add('input-' + this.numRows);
		subView = this.subs.get('input-' + this.numRows).shift();
		this.$('.rows').append(subView.render().el);

		this.numRows++;
		this.checkDisableAddButton();
	},

	deleteRow: function (e) {
		this.numRows--;
		this.checkDisableAddButton();
	},


	checkDisableAddButton: function () {
		if (this.numRows === this.maxNumRows) {
			//this.$('.ui.addRow').disable();
		} else {
			//this.$('.ui.addRow').enable();
		}
	},
});

module.exports = UIBaseGroupInputView;