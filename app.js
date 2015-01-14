'use strict';

var express = require('express');
var errorHandler = require('errorhandler');
var app = express();


//Fake db items - TODO:: Implement MongoDB
var items = [
  { username: 'ziyad', password: '123456', subdomain: 'a', port: '8001' },
  { username: 'chris', password: '123456', subdomain: 'b', port: '8002' },
  { username: 'augusto', password: '123456', subdomain: 'c', port: '8003' }
];

//Routes

app.get('/', function(req, res, next) {
  res.status(200);
  res.set({ 'Content-Type' : 'text/html' });
  res.send('<h1>Scope says hi! / Node.js app hosting</h1>');
  res.send('<p>Visit /api/2</p>');
  res.send('<p>Visit /api/2.json</p>');
  res.end();
});

app.get('/api/:id.:format?', function(req, res, next) {
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
        res.send('<h1>' + item.username + '<h1>');
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

app.listen(3000);

console.log('Scope started on port 3000');


