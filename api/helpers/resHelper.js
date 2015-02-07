'use strict';

var ResHelper = {};

ResHelper.sendSuccess = function (res, message, result) {
	res.status(200).json({
		status: 'success',
		message: message,
		result: result || {}
	});
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

ResHelper.send401 = function (res, message) {
	res.json({
		status: 'Failure',
		message: message
	}, 401);
}

module.exports = ResHelper;