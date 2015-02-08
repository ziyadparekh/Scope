'use strict';

//The Globals
var BaseConfig = require('configs/BaseButtonConfig');
var BaseView = require('views/UIBaseButtonView');
var BaseCard = require('views/UIBaseCardView');

var Loader = require('lib/loader');

Loader().onReady(function () {
	var baseView = new BaseView(BaseConfig);
	var baseCard = new BaseCard(BaseConfig);
	$("#canvas").html(baseCard.render().el);
});