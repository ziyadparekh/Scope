'use strict';

//module dependencies
var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var passport        = require('passport');
var toobusy         = require('toobusy');
var morgan          = require('morgan');

var express 		  = require('express');
var bodyParser 		= require('body-parser');
var errorHandler 	= require('errorhandler');
var util 			    = require('util');
var middle 			  = require('./api/middleware/middle');

var app = module.exports = express();

var auth = middle.authenticate;
var authApp = middle.authenticateApp;
var findAppByRepoId = middle.findAppByRepoId;
var validateAppRequest = middle.validateAppRequest;
var doesAppExist = middle.doesAppExist;
var doesStartExist = middle.doesStartExist;
var ensureAppExists = middle.ensureAppExists;

var validateUserRequest = middle.validateUserRequest;
var doesUserExist = middle.doesUserExist;


//dont crash on overload
app.use(function(req, res, next) {
    if (toobusy()) {
        res.send(503, "We have too much traffic try again in a few seconds, sorry.");
    } else {
        next();
    }
});

//Middleware

process.on('uncaughtException', function(err){
    console.log(err);
    process.exit(0);
});

app.use(errorHandler({ showStack: true }));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


if (process.env.PORT) {
    app.use(morgan('combined'));
} else {
    app.use(morgan('combined'));
    app.use(errorHandler({ dumpExceptions: false, showStack: false }));
    app.use(session({
        secret: 'tobo2obo',
        cookie: { maxAge: 60 * 60 * 10008 }
    }));
}

app.use(passport.initialize());
app.use(passport.session());

app.get('/status', function (req, res, next) {
	res.json({
		status : 'success',
	}, 200);
});

// Github authentication
// require('./auth');
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: middle.denied }, auth.callback));
// Need to implement middle.denied (routes ?)
// Need to implement


var user = require('./api/controllers/UserController');

/*
 * New user account registration
 * @Public: true with params
 * @params: user,password,email,rsakey
 * @raw:  curl -X POST -d "user=ziyadparekh&password=123456&email=ziyad.parekh@gmail.com&rsakey=abcd" http://localhost:3010/user
 *        curl -X POST -d "user=me&password=123" http://localhost:4001/user
 */
app.post('/user', validateUserRequest, doesUserExist, user.post);

app.get('/user/apps', auth, user.listApps);

/*
 * Edit your user account
 * @Public: false, only with authentication
 * @raw: curl -X PUT -u "ziyadparekh:123456" -d "password=test&rsakey=1234567" http://localhost:3010/user
 */
app.put('/user', auth, user.update);

/*
 * Delete your user account
 * @Public: false, only with authentication
 * @raw: curl -X DELETE -u "ziyadparekh:123456" http://localhost:3010/user
*/
app.delete('/user', auth, user.delete);

var _app_ = require('./api/controllers/AppController');

app.get('/apps/reboot', findAppByRepoId, _app_.reboot);
app.post('/apps/stop', auth, authApp, _app_.stop);
app.post('/apps/start', auth, authApp, _app_.start);

app.post('/apps/star', auth, ensureAppExists, _app_.star);
app.post('/apps/unstar', auth, ensureAppExists, _app_.unstar);


app.post('/apps/:appname', auth, validateAppRequest, doesAppExist, _app_.post);
app.post('/apps', auth, validateAppRequest, doesAppExist, _app_.post);

app.put('/apps', auth, authApp, doesStartExist, _app_.update);

app.get('/apps/logs', auth, authApp, _app_.logs);


// app.put('/apps/:appname', auth, authApp, _app_.put);
// app.put('/apps', auth, authApp, _app_.put);

app.delete('/apps/:appname', auth, authApp, _app_.delete);
app.delete('/apps', auth, authApp, _app_.delete);


var feed = require('./api/controllers/FeedController');

app.get('/list/latest', feed.latestApps);
app.get('/list/updated', feed.latestUpdatedApps);
app.get('/list/trending', feed.trendingApps);
