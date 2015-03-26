"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require("@templates/UIAppRemoteTemplate");
var AppModel = require("models/AppModel");
var UIAppRemoteView;

UIAppRemoteView = Backbone.BaseView.extend({
    initialize: function (options) {
        options = options || {};
        this.template = options.template || Templates["app-info-view-template"];
        this.dividerMessage = options.dividerMessage || "Set up your remote";
        this.model = options.model || new AppModel();
        this.generateTemplateVars();
    },

    generateTemplateVars: function () {
        this.templateVars = this.model.toJSON();
        _.extend(this.templateVars, {
            dividerMessage: this.dividerMessage
        });
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));
        return this;
    }
});

module.exports = UIAppRemoteView;
