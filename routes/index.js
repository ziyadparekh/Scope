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