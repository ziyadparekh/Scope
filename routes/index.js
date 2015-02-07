'use strict';

exports.login = function(req, res){
    res.render('login');
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