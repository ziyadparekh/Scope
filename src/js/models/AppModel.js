"use strict";

var BaseModel = require('models/BaseModel');
var moment = require("moment");

var AppModel = BaseModel.extend({
    url: function () {
        return "/api/1/apps"
    },

    appRunning: function () {
        return this.get("app_running");
    },

    appType: function () {
        return this.get("app_type");
    },

    getCreatedDate: function () {
        var date = moment(this.get("app_created"));
        return date.fromNow();
    },

    isStarredByCurrentUser: function () {
        return this.get("isStarred") || false;
    }
});

module.exports = AppModel;
