'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');

var ProfileMenuView;

ProfileMenuView = Backbone.BaseView.extend({

    defaults: {},

    defaultKeys: ['template', 'model', 'className'],

    events: {
        'click .menu-item' : 'switchActiveTab'
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

        this.templateVars = this.generateTemplateVars(options);

        ProfileMenuView.__super__.initialize.call(this, options);
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));

        return this;
    },

    switchActiveTab: function (e) {
        var tab = $(e.currentTarget);
        var tabName = $(tab).attr('data-name') || "";
        if (!tabName) {
            return false;
        }
        _.each(this.$(".menu-item"), function (item) {
            $(item).removeClass('active');
        });

        $(tab).addClass('active');
        this.triggerBubble("menu::changed", tabName);
    },

    generateTemplateVars: function (options) {
        var templateVars = {};
        _.each(options, function (val, key) {
            templateVars[key] = val;
        });
        return templateVars;
    },
});

module.exports = ProfileMenuView;
