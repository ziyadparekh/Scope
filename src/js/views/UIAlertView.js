"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIAlertViewTemplate');
var AlertView;

AlertView = Backbone.BaseView.extend({

    initialize: function (options) {
        options = options || {};
        options.header = options.header || "There were some errors with your submission";
        options.message = options.message || "An error was encountered while processing your request";
        options.color = options.color || "warning";
        options.size = options.size || "large";

        this.template = Templates['alert-view-template'];
        this.generateTemplateVars(options);

        AlertView.__super__.initialize.call(this, options);
    },

    events: {
        "click .close" : "closeMessage"
    },

    generateTemplateVars: function (options) {
        this.templateVars = {};
        _.each(options, function (val, key) {
            this.templateVars[key] = val;
        }, this);
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));

        return this;
    },

    closeMessage: function (e) {
        this.$('.message').remove();
    }
});

module.exports = AlertView;
