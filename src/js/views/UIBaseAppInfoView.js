"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIBaseAppInfoTemplate');
var SV = require("lib/serverVars");
var UIBaseAppInfoView;

UIBaseAppInfoView = Backbone.BaseView.extend({

    initialize: function (options) {
        options = options || {};
        this.template = Templates["app-card-view-template"];
        this.generateTemplateVars();
        UIBaseAppInfoView.__super__.initialize.call(this, options);
    },

    events: {
        'click .ui.button' : 'toggleStarState'
    },

    generateTemplateVars: function () {
        var app_running = this.model.appRunning();
        var type = this.model.appType();
        var isStarred = this.model.isStarredByCurrentUser();
        var color = app_running ? "green" : "yellow";
        var icon = type === "cli" ? "terminal icon" : "browser icon";
        var apptype = type === "cli" ? "Terminal" : "Browser";
        var appstatus = app_running ? "Running" : "Not Running";
        var date = this.model.getCreatedDate();
        this.templateVars = this.model.toJSON();
        _.extend(this.templateVars, {
            user: SV.user,
            color: color,
            icon: icon,
            date: date,
            apptype: apptype,
            appstatus: appstatus,
            isStarred: isStarred
        });
    },

    toggleStarState: function (e) {
        var button = $(e.currentTarget);
        if ($(button).hasClass("unstarred")) {
            $(button).removeClass("unstarred")
                     .addClass("starred")
                     .find(".text").text("Unstar");
            var number = Number($(button).find(".number").text());
            $(button).find(".number").text(number + 1);
            this.saveAppToUserPortfolio();
        } else {
            $(button).removeClass("starred")
                     .addClass("unstarred")
                     .find(".text").text("Star");
            var number = $(button).find(".number").text();
            $(button).find(".number").text(number - 1);
            this.removeAppFromUserPortfolio();
        }
    },

    saveAppToUserPortfolio: function () {
        $.post("/api/1/apps/star?appname=" + this.model.get("app_name"), function (err, res) {
            if (err) {
                console.log(err)
            };
        });
    },

    removeAppFromUserPortfolio: function () {
        $.post("/api/1/apps/unstar?appname=" + this.model.get("app_name"), function (err, res) {
            if (err) {
                console.log(err)
            };
        });
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));
        this.$(".icon").popup();

        return this;
    }
});

module.exports = UIBaseAppInfoView;
