'use strict';

/**
 * This app runs on port 80 and forwards traffic to the appropriate node app
 *
 */

// Fake DB items - TODO:: Implement Mongo
 var nodeapps = {
   'a' : { appname: 'hello8124.js', port: '8124', userid: '1' },
   'b' : { appname: 'hello8125.js', port: '8125', userid: '2' },
   'c' : { appname: 'hello8126.js', port: '8126', userid: '3' }
 };

 var http = require('http');
 var url = require('url');
 var util = require('util');
 var httpProxy = require('http-proxy');
 var proxy = httpProxy.createProxyServer({});

 var spawn = require('child_process').spawn;
 var app = spawn('node', ['app.js']);

//startup a couple of apps for testing
// var child1 = spawn('node', ['hello8124.js']);
// var child2 = spawn('node', ['hello8125.js']);

//Launch all hosted dummy apps
for (var key in nodeapps) {
  var obj = nodeapps[key];
  util.puts('launching: subdomain ' + key + ' on port ' + obj['port']);
  spawn('node', [obj['appname']]);
}


http.createServer(function (req, res) {

  var hostname = req.headers.host;
  var subdomain = hostname.substring(0, hostname.indexOf("."));

  //show headers for testing
  util.puts(JSON.stringify(req.headers.authorization));

  if (subdomain === 'api') {
    //send browser request for user credentials
    if (typeof req.headers.authorization === 'undefined') {
      res.writeHead(401, {'Content-Type': 'text/plain', 'WWW-Authenticate': 'Basic'});
      res.end('password?\n');
    } else {
      //Redirect to Scopes homepage
      proxy.web(req, res, { target: 'http://localhost:3010' });
    }
  } else if (nodeapps[subdomain]) {
    console.log('http://localhost:' + nodeapps[subdomain].port);
    proxy.web(req, res, { target: 'http://localhost:' + nodeapps[subdomain].port});
  } else {
    //Redirect to Scopes homepage
    proxy.web(req, res, { target: 'http://localhost:3010' });
  }
}).listen(4000);

console.log('Scope started on port 4000');

process.on('uncaughtException', function(err){
  console.log(err);
  process.exit(0);
});
