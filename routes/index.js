'use strict';

var _ = require('underscore');
var topnav = require('./configs/schema').topnav;
var helpers = require("../api/helpers/helpers");
var database = require("../api/database/database");

var buildVars = function () {
    var js_vars = {
        title : '',
        user: '',
        navMenu: ''
    }
    return js_vars
};

exports.login = function(req, res){
    var js_vars = _.extend({}, buildVars(), {
        navMenu : topnav.navMenu,
        title: 'Welcome'
    });
    res.render('login', js_vars);
};

exports.index = function(req, res){
    var js_vars = _.extend({}, buildVars(), {
        navMenu : topnav.navMenu,
        title: 'Welcome'
    });
    if (req && req.user) {
        var user = req.user;
        js_vars.user = user
    }
    res.render('home', js_vars);
};

exports.logout = function(req, res){
    if(req && req.user && req.user.id){
        req.session.destroy();
        res.redirect('/login');
    }else
    res.redirect('/login');
};

exports.create = function (req, res) {
    var js_vars = _.extend({}, buildVars(), {
        navMenu : topnav.navMenu,
        title: 'Welcome'
    });
    if (req && req.user) {
        var user = req.user;
        js_vars.user = user
    }
    res.render('create', js_vars);
};

exports.profile = function (req, res) {
    var user = req.user;
    var username = req.user.user_name;
    var js_vars
    helpers.getDb().then(function (db) {
        database.findSingleObjectInCollection(username, "users", db).then(function (user) {
            js_vars = _.extend({}, buildVars(), {
                navMenu: topnav.navMenu,
                title: username,
                user: user
            });
            res.render('profile', js_vars);
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
};

exports.settings = function (req, res) {
    var username = req.user.user_name;
    var js_vars;
    helpers.getDb().then(function (db) {
        database.findSingleObjectInCollection(username, "users", db).then(function(user) {
            js_vars = _.extend({}, buildVars(), {
                navMenu: topnav.navMenu,
                title: username,
                user: user
            });
            res.render("settings", js_vars);
        }).fail(function (err) { resHelper.send500(res, err.message); })
    }).fail(function (err) { resHelper.send500(res, err.message); });
}
