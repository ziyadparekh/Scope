'use strict';

var Backbone = require('lib/ZPBackbone');
var _ = require('underscore');
var $ = require('jquery');
var Templates = require("@templates/ProfileWrapperTemplate");
var UITextView;

UITextView = Backbone.BaseView.extend({
    defaults: {
        template: Templates['ui-base-input-view'],
        className: 'field'
    },

    defualtKeys: ['model', 'template', 'className', 'tagName'],

    initialize: function (options) {

        options = _.extend({}, this.defaults, options);

        _.each(this.defualtKeys, function (val) {
            if (!_.isUndefined(options[val])) {
                this[val] = options[val];
            };
        }, this);

        this.templateVars = this.generateTemplateVars(options);

        UITextView.__super__.initialize.call(this);
    },

    generateTemplateVars: function (options) {
        var templateVars = {};
        _.each(options.vars, function (val, key) {
            if (_.isFunction(val)) {
                templateVars[key] = val.call(this);
            } else {
                templateVars[key] = val;
            }
        }, this);

        return templateVars;
    },

    render: function () {
        this.$el.html(this.template(this.templateVars));

        return this;
    }
});

module.exports = UITextView;