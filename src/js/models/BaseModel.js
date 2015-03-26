'use strict';

var Backbone = require('backbone-associations');
var _ = require('underscore');
var BaseModel;

BaseModel = Backbone.AssociatedModel.extend({

    parse: function (data) {
        data = data || {};
        if (data.result) {
            return data.result;
        } else {
            return data
        }
    }

});

module.exports = BaseModel;
