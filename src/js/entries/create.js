'use strict';

var Loader = require('lib/loader');
var CreateAppWrapperView = require('views/wrappers/CreateAppWrapperView');
var CreateAppWrapperViewConfig = require('configs/wrappers/CreateAppWrapperViewConfig');

Loader().onReady(function () {
  var createApp = new CreateAppWrapperView(CreateAppWrapperViewConfig);
  $("#create-app").html(createApp.render().el);
});
