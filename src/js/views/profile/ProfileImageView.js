'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var Templates = require("@templates/ProfileWrapperTemplate");

var ProfileImageView;

ProfileImageView = Backbone.BaseView.extend({

    defaults: {
        template: Templates['profile-image-view']
    },

    defaultKeys: ['model', 'template', 'className'],

    initialize: function (options) {
        options = _.extend({}, this.defaults, options);

        _.each(this.defaultKeys, function (key) {
            if (!_.isUndefined(options[key])) {
                this[key] = options[key];
            };
        }, this);

        this.templateVars = this.generateTemplateVars(options);

        ProfileImageView.__super__.initialize.call(this, options);
    },

    generateTemplateVars: function (options) {
        var templateVars = {};
        _.each(options, function (val, key) {
            templateVars[key] = val;
        });
        templateVars['src'] = this.model.get('user_image');
        return templateVars;
    },

    render: function () {

        this.$el.html(this.template(this.templateVars));

        return this;
    }
});

module.exports = ProfileImageView;
