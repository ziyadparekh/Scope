'use strict';

var Loader = require('lib/loader');
var CreateApp = require('views/UICreateAppView');

Loader().onReady(function () {
  console.log('ready');
  var createApp = new CreateApp();
  $("#create-app").html(createApp.render().el);
});
