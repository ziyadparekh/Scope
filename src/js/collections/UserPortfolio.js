"use strict";

var Backbone = require('backbone-associations');
var _ = require('underscore');
var AppModel = require("models/AppModel");
var UserPortfolioCollection;

UserPortfolioCollection = Backbone.Collection.extend({
    url: function () {
        return "/api/1/user/apps"
    },
    model: AppModel,
    parse: function (data) {
        data = data || {};
        data = data.result;

        return data;
    }
});

module.exports = UserPortfolioCollection;
