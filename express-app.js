'use strict';

var express 		= require('express');
var bodyParser 		= require('body-parser');
var errorHandler 	= require('errorhandler');
var util 			= require('util');
var middle 			= require('./middle');

var app = express();

var auth = middle.authenticate;
var authApp = middle.authenticateApp;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware

process.on('uncaughtException', function(err){
    console.log(err);
    process.exit(0);
});

app.use(errorHandler({ showStack: true }));

app.get('/status', function (req, res, next) {
	res.json({
		status : 'success',
	}, 200);
});

var user = require('./user');

/*
 * New user account registration
 * @Public: true with params
 * @params: user,password,email,rsakey
 * @raw:  curl -X POST -d "user=ziyadparekh&password=123456&email=ziyad.parekh@gmail.com&rsakey=abcd" http://localhost:3010/user
 *        curl -X POST -d "user=me&password=123" http://localhost:4001/user
 */
app.post('/user', user.post);

/*
 * Edit your user account
 * @Public: false, only with authentication
 * @raw: curl -X PUT -u "ziyadparekh:123456" -d "password=test&rsakey=1234567" http://localhost:3010/user
 */
app.put('/user', auth, user.put);

/*
 * Delete your user account
 * @Public: false, only with authentication
 * @raw: curl -X DELETE -u "ziyadparekh:123456" http://localhost:3010/user
*/
app.delete('/user', auth, user.delete);

var _app_ = require('./appController');

app.get('/apps/restart', _app_.restart);
app.post('/apps/stop', auth, authApp, _app_.stop);
app.post('/apps/start', auth, authApp, _app_.start);


app.post('/apps/:appname', auth, _app_.post);
app.post('/apps', auth, _app_.post);

// app.put('/apps/:appname', auth, authApp, _app_.put);
// app.put('/apps', auth, authApp, _app_.put);

app.delete('/apps/:appname', auth, authApp, _app_.delete);
app.delete('/apps', auth, authApp, _app_.delete);


app.listen(3010);

util.puts("Protobox started on port 3010");