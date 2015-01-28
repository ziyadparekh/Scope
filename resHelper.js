'use strict';

var ResHelper = {};

ResHelper.sendSuccess = function (res, message, result) {
	res.json({
		status: 'success',
		message: message,
		result: result || {}
	}, 200);
};

ResHelper.send500 = function (res, message) {
	res.json({
		status: 'Failure',
		message: message
	}, 500);
};

ResHelper.send400 = function (res, message) {
	res.json({
		status: 'Failure',
		message: message
	}, 400);
}

module.exports = ResHelper;