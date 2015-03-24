"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIBaseAppInfoTemplate');
var UIBaseAppInfoView;

UIBaseAppInfoView = Backbone.BaseView.extend({

    initialize: function (options) {
        options = options || {};
        this.template = Templates["app-info-view-template"];
        UIBaseAppInfoView.__super__.initialize.call(this, options);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    }
});

module.exports = UIBaseAppInfoView;
