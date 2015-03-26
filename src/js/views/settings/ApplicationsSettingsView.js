"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require("@templates/SettingsWrapperTemplate");
var UserPortfolio = require("collections/UserPortfolio");
var ApplicationsSettingsView;

ApplicationsSettingsView = Backbone.BaseView.extend({
    initialize: function (options) {
        this.collection = options.collection || new UserPortfolio();
        this.template = options.template || Templates['applications-settings-view'];
    },

    generateTemplateVars: function () {
        this.templateVars = {
            apps: this.collection.toJSON()
        };
    },

    render: function () {
        var self = this;
        this.generateTemplateVars();
        this.$el.html(this.template(this.templateVars));
        return this;
    },
});

module.exports = ApplicationsSettingsView;
