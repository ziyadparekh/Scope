'use strict';

var Backbone = require('backbone-associations');
var _ = require('underscore');
var BaseModel;

BaseModel = Backbone.AssociatedModel.extend({

    parse: function (data) {
        data = data || {};
        data = data.result;

        return data;
    }

});

module.exports = BaseModel;