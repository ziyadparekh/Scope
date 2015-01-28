'use strict';

var crypto = require('crypto');
var mkDeffered = require('./deferred');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config');
var url = config.db_url;


exports.md5 = function (string) {
	return crypto.createHash('md5').update(string).digest('hex');
};

exports.getDb = function () {
	var def = mkDeffered();
	MongoClient.connect(url, function (err, db){
		if (err) {
			def.reject(err);
		} else {
			def.resolve(db);
		}
	});
	return def.getPromise();
};