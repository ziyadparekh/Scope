'use strict';

/**
 * This app runs on port 80 and forwards traffic to the appropriate node app
 *
 */

var http = require('http');
var url = require('url');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

var spawn = require('child_process').spawn;
var app = spawn('node', ['app.js']);

//startup a couple of apps for testing
var child1 = spawn('node', ['hello8124.js']);
var child2 = spawn('node', ['hello8125.js']);

http.createServer(function (req, res) {
  if (req.url === '/8124') {
    proxy.web(req, res, { target: 'http://localhost:8124' });
  } else if (req.url === '/8125') {
    proxy.web(req, res, { target: 'http://localhost:8125' });
  } else {
    proxy.web(req, res, { target: 'http://localhost:3000' });
  }
}).listen(4000);

process.on('uncaughtException', function(err){
    console.log(err);
    process.exit(0);
});
