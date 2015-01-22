'use strict';

var crypto = require('crypto');

exports.md5 = function (string) {
	return crypto.createHash('md5').update(string).digest('hex');
};