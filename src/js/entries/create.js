'use strict';

var Loader = require('lib/loader');
var CreateApp = require('views/UICreateAppView');

Loader().onReady(function () {
  var createApp = new CreateApp();
  $("#create-app").html(createApp.render().el);
});
