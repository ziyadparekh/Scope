'use strict';

//Implement Github login over here

/**
 * Module dependencies.
 */
 var passport = require('passport');
 var GithubStrategy = require('passport-github').Strategy;

 var database = require('../database/database');
 var helpers = require('../helpers/helpers');
 var config = require('../config');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


passport.use(
new GithubStrategy({
    clientID: config.github_client,
    clientSecret: config.github_secret,
    callbackURL: process.env.LOCAL+"/auth/github/callback",
    passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
    profile = profile._json;
    var username = profile.login || "";
    return helpers.getDb().then(function (db) {
    	return database.findSingleObjectInCollection(username, 'users', db).then(function (result) {
    		return done(null, result);
    	}).fail(function (err) {
	    	var user = {
	    		user_name: username,
	    		user_image: "https://avatars.githubusercontent.com/u/4661481?v=3",
	    		user_email: profile.email,
	    		user_full_name: profile.name,
	    		user_created_at: new Date()
	    	};
	    	return done(null, user);
    	});
    });
}));
