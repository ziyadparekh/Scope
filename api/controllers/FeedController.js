'use strict';

var MongoClient    = require('mongodb').MongoClient;
var database       = require('../database/database');
var config         = require('../config');
var util           = require('util');
var helpers        = require('../helpers/helpers');
var _              = require('underscore');
var exec           = require('child_process').exec
var url            = config.db_url;
var resHelper      = require('../helpers/resHelper');
var shellHelpers   = require('../helpers/shellHelpers');
var deferred       = require("../helpers/deferred");
var FeedController = module.exports;

FeedController.latestApps = function (req, res, next) {

    var limit = Number(req.body.limit) || Number(req.query.limit)|| 20;
    var offset = Number(req.body.offset) || Number(req.query.offset) || 0;

	helpers.getDb().then(function (db) {
		database.findLatestApps(limit, offset, 'apps', db).then(function (result) {
			var response = {
				limit: limit,
				offset: offset,
				result: result
			};
			resHelper.sendSuccess(res, 'success', response);
		}).fail(function (err) { resHelper.send500(res, err.message);})
	}).fail(function (err) { resHelperresHelper.send500(res, err.message);})
};

FeedController.latestUpdatedApps = function (req, res, next) {

	var limit = Number(req.body.limit) || Number(req.query.limit)|| 20;
	var offset = Number(req.body.offset) || Number(req.query.offset) || 0;

	helpers.getDb().then(function (db) {
		database.findLatestUpdatedApps(limit, offset, 'apps', db).then(function (result) {
			var response = {
				limit: limit,
				offset: offset,
				result: result
			};
			resHelper.sendSuccess(res, 'success', response);
		}).fail(function (err) { resHelper.send500(res, err.message); })
	}).fail(function (err) { resHelper.send500(res, err.message); })
};

FeedController.trendingApps = function (req, res, next) {

    var limit = Number(req.body.limit) || Number(req.query.limit) || 20;
    var offset = Number(req.body.offset) || Number(req.query.offset) || 0;

	helpers.getDb().then(function (db) {
		database.findTrendingApps(limit, offset, 'apps', db).then(function (result) {
			var response = {
				limit: limit,
				offset: offset,
				result: result
			};
			resHelper.sendSuccess(res, 'success', response);
		}).fail(function (err) { resHelper.send500(res, err.message); })
	}).fail(function (err) { resHelper.send500(res, err.message); })
};

FeedController.userApps = function (req, res, next) {
    var username = req.params.username || req.query.username || req.body.username;
    var limit = Number(req.body.limit) || Number(req.query.limit) || 20;
    var offset = Number(req.body.offset) || Number(req.query.offset) || 0;

    helpers.getDb().then(function (db) {
        database.findUsersApps(limit, offset, username, 'apps', db).then(function (result) {
            var response = {
                limit: limit,
                offset: offset,
                result: result
            };
            resHelper.sendSuccess(res, 'success', response);
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); })
}
