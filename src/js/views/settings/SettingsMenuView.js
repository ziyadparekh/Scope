"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require("@templates/SettingsWrapperTemplate");
var SettingsMenuView;

SettingsMenuView = Backbone.BaseView.extend({
    initialize: function (options) {
        options = options || {};
        this.menuHeader = options.menuHeader || "Settings";
        this.items = options.items || [];
        this.template = options.template || Templates["settings-menu-view"];
        this.generateTemplateVars();
    },

    events: {
        "click .menu-item": "switchActiveMenu"
    },

    generateTemplateVars: function () {
        this.templateVars = {
            menuHeader: this.menuHeader,
            items: this.items
        };
    },

    switchActiveMenu: function (e) {
        var tab = $(e.currentTarget);
        var name = $(tab).attr("data-name");
        if ($(tab).hasClass("active")) {
            return;
        }
        _.each(this.$(".menu-item"), function (item) {
            $(item).removeClass('active teal');
        });
        $(tab).addClass("active teal");
        this.triggerBubble("settingsMenu::changed", name);
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));
        return this;
    }
});

module.exports = SettingsMenuView;
