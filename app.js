'use strict';

var express = require('express');
var errorHandler = require('errorhandler');
var base64_decode = require('base64').decode;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var app = express();

var url = 'mongodb://localhost:27017/scope';

MongoClient.connect(url, function(err, db) {
  //assert.equal(null, err);
  console.log('connected correctly to server');

  db.close();
});

//Fake db items - TODO:: Implement MongoDB

var users = {
  'ziyad' : { username: 'ziyad', password: '123456', userid: '1' },
  'chris': { username: 'chris', password: '123456', userid: '2' },
  'augusto': { username: 'augusto', password: '123456', userid: '3'}
};

var nodeapps = {
  'a' : { appname: 'hello8124.js', port: '8124', userid: '1' },
  'b' : { appname: 'hello8125.js', port: '8125', userid: '2' },
  'c' : { appname: 'hello8126.js', port: '8126', userid: '3' }
};

var items = [
  { userid: 1, subdomain: 'a', port: '8001' },
  { userid: 2, subdomain: 'b', port: '8002' },
  { userid: 3, subdomain: 'c', port: '8003' }
];

//Routes

app.get('/', function(req, res, next) {
  res.status(200);
  res.set({ 'Content-Type' : 'text/html' });
  res.send('<h1>Scope says hi! / Node.js app hosting</h1>' +
           '<p>Visit <a href="http://ziyad:123@api.localhost:4000/status">http://ziyad:123@api.localhost:4000/status</a> Bad auth</p>' +
           '<p>Visit <a href="http://ziyad:123456@api.localhost:4000/status">http://ziyad:123456@api.localhost:4000/status</a> Good auth</p>' +
           '<p>Visit /list/2</p>' +
           '<p>Visit /list/2.json</p>');
  res.end();
});


app.get('/status', function (req, res, next) {
  res.status(200);
  res.set({ 'Content-Type' : 'text/html' });

  if (authenticate(req.headers.authorization)) {
    res.send('<h1>Goods auth - now to list apps </h1>');
  } else {
    res.send('<h1> auth failed </h1>');
  }

  res.end();
});


app.get('/list/:id.:format?', function(req, res, next) {
  var id = req.params.id;
  var format = req.params.format;
  var item = items[id];

  if (item) {
    switch (format) {
      case 'json':
        res.send(item);
        break;
      case 'html':
      default:
        //Send some html by default
        res.send('<h1>' + item.subdomain + '<h1>');
    }
  } else {
    // Need to do 404 checking with next() but for now this will work
    next(new Error('Item ' + id + 'does not exist'));
  }
});

//Middleware

process.on('uncaughtException', function(err){
    console.log(err);
    process.exit(0);
});

app.use(errorHandler({ showStack: true }));

app.listen(3010);

console.log('Scope started on port 3010');

function authenticate (basicauth) {
  if (typeof basicauth === 'undefined') {
    return false;
  };

  var creds = base64_decode(basicauth.substring(basicauth.indexOf(" ") + 1));
  var username = creds.substring(0, creds.indexOf(":"));
  var password = creds.substring(creds.indexOf(":") + 1);


  var user = users[username];

  if (user.username === username && user.password === password) {
    return true;
  } else {
    return false;
  }

};


