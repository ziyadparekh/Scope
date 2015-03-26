"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var AlertView = require('views/UIAlertView');
var SettingsWrapperView;
var AlertViewConfig = {
    size: "small",
    color: "info"
};

SettingsWrapperView = Backbone.BaseView.extend({
    defaultKeys: ['subViewConfig', 'template', 'model'],
    viewEvents: {

    },
    initialize: function (options) {
        _.each(this.defaultKeys, function (key) {
            if(!_.isUndefined(options[key])) {
                this[key] = options[key];
            }
        }, this);

        _.each(this.subViewConfig, function (config, key) {
            this.subs.add(key, {model : this.model});
        }, this);

        SettingsWrapperView.__super__.initialize.call(this, options);
    },

    render: function () {
        this.$el.html(this.template());
        this.subs.renderAppend();
        return this;
    }
});

module.exports = SettingsWrapperView;
