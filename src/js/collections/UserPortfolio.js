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
        if (data.result.result) {
            return data.result.result
        } else if (data.result) {
            return data.result
        } else {
            return data
        }
    }
});

module.exports = UserPortfolioCollection;
