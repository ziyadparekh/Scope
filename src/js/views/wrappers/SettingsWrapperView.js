"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var AlertView = require('views/UIAlertView');
var UserPortfolio = require("collections/UserPortfolio");
var SettingsWrapperView;
var AlertViewConfig = {
    size: "small",
    color: "info"
};

SettingsWrapperView = Backbone.BaseView.extend({
    defaultKeys: ['subViewConfig', 'template', 'model'],
    activePage: "applications",
    viewEvents: {
        "settingsMenu::changed": "swapActivePage"
    },
    initialize: function (options) {
        _.each(this.defaultKeys, function (key) {
            if(!_.isUndefined(options[key])) {
                this[key] = options[key];
            }
        }, this);

        this.userPortfolio = new UserPortfolio();

        _.each(this.subViewConfig, function (config, key) {
            this.subs.add(key, {model : this.model, collection: this.userPortfolio});
        }, this);

        this.fetchUserPortfolio();

        SettingsWrapperView.__super__.initialize.call(this, options);
    },

    swapActivePage: function (tab) {
        this.activePage = tab;
        this.renderSubs();
    },

    fetchUserPortfolio: function () {
        var self = this;
        this.userPortfolio.fetch().success(function () {
            console.log(self.userPortfolio.toJSON());
            self.renderSubs();
        }).fail(function (err) {
            // show alert
        }).always(function () {
            //stop loader
        });
    },

    renderSubs: function () {
        var activePage = this.activePage;
        this.$("#settings-item").empty();
        this.subs.get(activePage).render().place("#settings-item");
    },

    render: function () {
        this.$el.html(this.template());
        this.subs.get("settingsMenu").render().place("#settings-menu");
        // this.subs.get("applications").render().place("#settings-item");
        return this;
    }
});

module.exports = SettingsWrapperView;
