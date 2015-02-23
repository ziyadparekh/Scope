'use strict';

var Loader = require('lib/loader');
var ProfileWrapperView = require('views/wrappers/ProfileWrapperView');
var ProfileWrapperViewConfig = require('configs/wrappers/ProfileWrapperViewConfig');
var UserModel = require('models/UserModel');
var SV = require('lib/serverVars');

var currentUser = SV.user || {};

Loader().onReady(function () {
    var userModel = new UserModel(currentUser);
    _.extend(ProfileWrapperViewConfig, {model : userModel});
    var profileWrapperView = new ProfileWrapperView(ProfileWrapperViewConfig);
    $("#profile").html(profileWrapperView.render().el);
});
