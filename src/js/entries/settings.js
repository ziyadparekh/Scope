'use strict';

var Loader = require('lib/loader');
var SettingsWrapperView = require('views/wrappers/SettingsWrapperView');
var SettingsWrapperViewConfig = require('configs/wrappers/SettingsWrapperViewConfig');
var UserModel = require('models/UserModel');
var SV = require('lib/serverVars');

var currentUser = SV.user || {};

Loader().onReady(function () {
    var userModel = new UserModel(currentUser);
    _.extend(SettingsWrapperViewConfig, {model : userModel});
    var settingsWrapperView = new SettingsWrapperView(SettingsWrapperViewConfig);
    $("#settings").html(settingsWrapperView.render().el);
});
