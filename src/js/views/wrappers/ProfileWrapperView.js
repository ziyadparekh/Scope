'use strict';

var $ = require('jquery');
var _ = require('underscore');
var CreateAppWrapperView = require('views/wrappers/CreateAppWrapperView');

var ProfileWrapperView = CreateAppWrapperView.extend({
    defaultKeys: ['subViewConfig', 'template', "collectionViews"],
    initialize: function (options) {

        ProfileWrapperView.__super__.initialize.call(this, options);
    },
    viewEvents: {
        "menu::changed" : "switchCollectionView"
    },
    addCollectionViewConfigs: function () {
        _.each(this.collectionViews, function (view, key) {
            this.subs.addConfig(key, view);
            this.subs.add(key, {model : this.model});
        }, this);
    },
    render: function () {
        var templateVars = this.templateVars;
        this.$el.html(this.template(templateVars));
        this.subs.renderAppend();
        this.addCollectionViewConfigs();
        this.subs.get("userApps").render().place("#profile-collection");
        return this;
    },
    switchCollectionView: function (tab) {
        this.$("#profile-collection").empty();
        this.subs.get(tab).render().place("#profile-collection");
    }
});

module.exports = ProfileWrapperView;
