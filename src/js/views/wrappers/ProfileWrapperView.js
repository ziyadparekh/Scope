'use strict';

var $ = require('jquery');
var _ = require('underscore');
var CreateAppWrapperView = require('views/wrappers/CreateAppWrapperView');

var ProfileWrapperView = CreateAppWrapperView.extend({
    initialize: function (options) {

        ProfileWrapperView.__super__.initialize.call(this, options);
    }
});

module.exports = ProfileWrapperView;
