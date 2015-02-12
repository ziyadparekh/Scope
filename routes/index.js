'use strict';

var topnav = require('./configs/schema').topnav;

exports.login = function(req, res){
    res.render('login', topnav);
};

exports.index = function(req, res){
    if(req)
        var user = JSON.stringify(req.user);
    var url = "http://localhost:3010";
    res.json({url:url, user: user});
};

exports.logout = function(req, res){
    if(req && req.user && req.user.id){
        req.session.destroy();
        res.redirect('/login');
    }else
    res.redirect('/login');
};

exports.create = function (req, res) {
  var js_vars = {};
  if (req && req.user) {
    var user = req.user;
    js_vars.user = user
  }
  res.render('create', {js_vars: js_vars});
};
