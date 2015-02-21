'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UICreateAppTemplate');
var UIBaseInputView = require('views/UIBaseInputView');
var UIBaseGroupInputView = require('views/UIBaseGroupInputView');
var UIBaseButtonView = require('views/UIBaseButtonView');
var UIBaseSelectDropdownView = require('views/UIBaseSelectDropdownView');
var UIBaseFormView;

var ZPBaseModel = Backbone.Model.extend({});

UIBaseFormView = Backbone.BaseView.extend({
	
	model: ZPBaseModel,

	template: Templates['ui-form'],

	subViewConfig: {
		language: {
			construct: UIBaseSelectDropdownView,
			location: "#runtime",
			singleton: true,
			options: {
				label: 'Language',
				placeholder: 'Select language',
				template: Templates['ui-base-dropdown'],
				possibleVals: {
					node: {
						displayName: 'Nodejs',
						icon: 'css3 icon'
					},
					python: {
						displayName: 'Python',
						icon: 'css3 icon'
					},
					ruby: {
						displayName: 'Ruby',
						icon: 'css3 icon'
					},
					go: {
						displayName: 'Go',
						icon: 'css3 icon'
					}
				}
			}
		},
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
		gitUrl: {
			construct: UIBaseInputView,
			location: "#giturl",
			singleton: true,
			options: {
				label: 'Github Url',
				placeholder: 'https://github.com/me/myawesomerepo'
			}
		},
		packages: {
			construct: UIBaseInputView,
			location: "#packages",
			singleton: true,
			options: {
				label: 'Libraries',
				placeholder: 'Comma separted list eg: git, gcc,'
			}
		},
		environment: {
			construct: UIBaseGroupInputView,
			location: "#environment",
			singleton: true,
			options: {
				maxNumRows: 6,
				rowsClassName: 'right floated right aligned fourteen wide column rows'
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
			this.subs.add(key);
		}, this);

		UIBaseFormView.__super__.initialize.call(this, options);
	},

	render: function () {

		var templateVars = {};

		this.$el.html(this.template(templateVars));

		this.subs.renderAppend();

		return this;

	}

});

module.exports = UIBaseFormView;