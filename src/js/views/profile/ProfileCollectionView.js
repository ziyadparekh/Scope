"use strict";

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('lib/ZPBackbone');
var UserPortfolio = require("collections/UserPortfolio");
var Templates = require("@templates/ProfileWrapperTemplate");
var ProfileCollectionView;

ProfileCollectionView = Backbone.BaseView.extend({
    offset: 0,
    pageLength: 10,
    itemLength: 0,
    initialize: function (options) {
        options = options || {};
        this.pageLength = options.pageLength || 10;
        this.collection = options.collection || new UserPortfolio();
        this.collectionUrl = options.collectionUrl || "/api/1/user/apps";
        if (typeof this.collectionUrl === "function") {
            this.collectionUrl = this.collectionUrl.call(this);
        };
        this.collection.url = this.collectionUrl;
        this.rowView = options.rowView;
        this.subViewOptions = options.subViewOptions || {};
        this.template = Templates["profile-collection-template"];
        if (!this.rowView) {
            throw Error("You need a row view to use this collection view");
        }
        this.generateTemplateVars();
        ProfileCollectionView.__super__.initialize.call(this, options);
    },
    events: {
        'click .load-more' : 'fetchNextBatch'
    },
    generateTemplateVars: function () {
        this.templateVars = {};
    },
    fetchNextBatch: function () {
        var self = this;
        this.firstRender = true;
        self.$(".ui.dimmer").addClass("active");
        this.collection.fetch({
            remove: false,
            data: {
                limit: self.pageLength,
                offset: self.offset
            }
        }).success(function () {
            console.log(self.collection.toJSON());
            self.renderRowViews();
        }).fail(function (err) {
            console.log(err);
        }).always(function () {
            self.$(".ui.dimmer").removeClass("active");
        });
    },
    removeLoadMoreButton: function () {
        this.$(".load-more").remove();
    },
    renderRowViews: function () {
        var model;
        var viewOptions;
        var newView;
        if (this.offset === this.collection.length) {
            return this.removeLoadMoreButton();
        };
        for (var i = this.offset; i < this.collection.length; i++) {
            if (this.collection.at(i)) {
                model = this.collection.at(i);
                viewOptions = _.extend({}, this.subViewOptions, {model : model});
                newView = new this.rowView(viewOptions);
                this.subs.add(newView);
                this.$itemContainer.append(newView.$el);
                newView.render();
            };
        };
        this.offset = this.collection.length;
    },
    render: function () {
        this.$el.html(this.template(this.templateVars));
        this.itemLength = this.collection.length;
        this.offset = 0;
        this.collection.reset();
        this.$itemContainer = this.$(".collection-container");
        this.fetchNextBatch();
        this.delegateEvents();
        return this;
    }
});

module.exports = ProfileCollectionView;
