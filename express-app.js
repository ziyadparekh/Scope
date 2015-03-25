'use strict';

//module dependencies
var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var passport        = require('passport');
var toobusy         = require('toobusy');
var morgan          = require('morgan');
var path            = require('path');
var swig            = require('swig');

var express 		= require('express');
var config          = require('./api/config');
var bodyParser 		= require('body-parser');
var errorHandler 	= require('errorhandler');
var MongoStore      = require('connect-mongo')(session);
var util 			= require('util');
var middle 			= require('./api/middleware/middle');
var index           = require('./routes/index');
var version         = config.api;

var app = module.exports = express();

var auth = middle.authenticate;
var authApp = middle.authenticateApp;
var findAppByRepoId = middle.findAppByRepoId;
var validateAppRequest = middle.validateAppRequest;
var doesAppExist = middle.doesAppExist;
var doesStartExist = middle.doesStartExist;
var ensureAppExists = middle.ensureAppExists;
var differentUser = middle.differentUser;
var isUserRegistered = middle.isUserRegistered;

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

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler({ showStack: true }));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if(process.env.PORT){
    app.use(morgan('combined'));
} else {
    app.use(morgan('combined'));
    app.use(errorHandler({ dumpExceptions: false, showStack: false }));
    app.use(session({
        secret: 'tobo2obo',
        cookie: { maxAge: 60 * 60 * 10008 },
        store: new MongoStore({ url : config.db_url }),
        resave: true,
        saveUninitialized: true
    }));
}


app.use(passport.initialize());
app.use(passport.session());

app.get('/status', function (req, res, next) {
	res.json({
		status : 'success',
	}, 200);
});

var user = require('./api/controllers/UserController');

app.get('/login', index.login);

// Github authentication
require('./api/modules/auth');

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: middle.denied }), user.post);
// Need to implement middle.denied (routes ?)
// Need to implement


/**
 * Client side routes
 */

app.get('/app/create', ensureLoggedIn('/login'), index.create);

app.get('/user/profile', ensureLoggedIn('login'), index.profile);

/*
 * New user account registration
 * @Public: true with params
 * @params: user,password,email,rsakey
 * @raw:  curl -X POST -d "user=ziyadparekh&password=123456&email=ziyad.parekh@gmail.com&rsakey=abcd" http://localhost:3010/user
 *        curl -X POST -d "user=me&password=123" http://localhost:4001/user
 */
//app.post('/user', validateUserRequest, doesUserExist, user.post);

app.get(version + '/user/apps', ensureLoggedIn('/login'), user.listApps);

/*
 * Edit your user account
 * @Public: false, only with authentication
 * @raw: curl -X PUT -u "ziyadparekh:123456" -d "password=test&rsakey=1234567" http://localhost:3010/user
 */
app.put(version + '/user', ensureLoggedIn('/login'), user.update);

// Follow user
app.post(version + '/user/follow', ensureLoggedIn('/login'), differentUser, isUserRegistered, user.follow);
// Unfollow user
app.post(version + '/user/unfollow', ensureLoggedIn('/login'), differentUser, isUserRegistered, user.unfollow);


/*
 * Delete your user account
 * @Public: false, only with authentication
 * @raw: curl -X DELETE -u "ziyadparekh:123456" http://localhost:3010/user
*/
app.delete(version + '/user', ensureLoggedIn('/login'), user.delete);

var _app_ = require('./api/controllers/AppController');

app.get(version + '/apps/:appname', ensureAppExists, _app_.getAppByAppname);

app.get(version + '/apps/reboot', findAppByRepoId, _app_.reboot);
app.post(version + '/apps/stop', ensureLoggedIn('/login'), authApp, _app_.stop);
app.post(version + '/apps/start', ensureLoggedIn('/login'), authApp, _app_.start);

app.post(version + '/apps/star', ensureLoggedIn('/login'), ensureAppExists, _app_.star);
app.post(version + '/apps/unstar', ensureLoggedIn('/login'), ensureAppExists, _app_.unstar);


app.post(version + '/apps/:appname', ensureLoggedIn('/login'), validateAppRequest, doesAppExist, _app_.post);
app.post(version + '/apps', ensureLoggedIn('/login'), validateAppRequest, doesAppExist, _app_.post);

app.put(version + '/apps', ensureLoggedIn('/login'), authApp, doesStartExist, _app_.update);

app.get(version + '/apps/logs', ensureLoggedIn('/login'), authApp, _app_.logs);


// app.put('/apps/:appname', auth, authApp, _app_.put);
// app.put('/apps', auth, authApp, _app_.put);

app.delete(version + '/apps/:appname', ensureLoggedIn('/login'), authApp, _app_.delete);
app.delete(version + '/apps', ensureLoggedIn('/login'), authApp, _app_.delete);


var feed = require('./api/controllers/FeedController');

app.get(version + '/list/latest', feed.latestApps);
app.get(version + '/list/updated', feed.latestUpdatedApps);
app.get(version + '/list/trending', feed.trendingApps);

app.get('/logout', index.logout);

app.get('/', ensureLoggedIn('/login'), index.index);
