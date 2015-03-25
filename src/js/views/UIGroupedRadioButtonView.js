"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require('@templates/UIGroupedRadioButtonTemplate');
var UIGroupedRadioButtonView;

UIGroupedRadioButtonView = Backbone.BaseView.extend({

    initialize: function (options) {
        options = options || {};
        this.possibleVals = options.possibleVals || {};
        this.label = options.label || "";
        this.for = options.for || "";
        this.template = options.template || Templates["ui-grouped-radio-button"];
        this.generateTemplateVars();
    },

    generateTemplateVars: function () {
        this.templateVars = {
            label: this.label,
            for: this.for,
            possibleVals: this.possibleVals
        };
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));
        this.$(".ui.radio.checkbox").checkbox();

        return this
    },

    getCheckedValue: function () {
        var checkedVal;
        _.each(this.$(".ui.radio.checkbox"), function (box) {
            if ($(box).hasClass("checked")) {
                checkedVal = $(box).children().val();
            };
        });
        return checkedVal;
    }
});

module.exports = UIGroupedRadioButtonView;
