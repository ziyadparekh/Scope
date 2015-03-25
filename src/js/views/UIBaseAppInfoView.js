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

    generateTemplateVars: function () {
        var app_running = this.model.appRunning();
        var type = this.model.appType();
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
            appstatus: appstatus
        });
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));
        this.$(".icon").popup();

        return this;
    }
});

module.exports = UIBaseAppInfoView;
