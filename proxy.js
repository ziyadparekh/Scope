'use strict';

/**
 * This app runs on port 80 and forwards traffic to the appropriate node app
 *
 */

 var http = require('http');
 var url = require('url');
 var util = require('util');
 var _ = require('underscore');
 var httpProxy = require('http-proxy');
 var MongoClient = require('mongodb').MongoClient;
 var mkDeferred = require('./deferred');
 var database = require("./database");
 var url = 'mongodb://localhost:27017/scope';

 var proxy = httpProxy.createProxyServer({});

 var spawn = require('child_process').spawn;
 var app = spawn('node', ['app.js']);

//startup a couple of apps for testing
// var child1 = spawn('node', ['hello8124.js']);
// var child2 = spawn('node', ['hello8125.js']);

//Launch all hosted dummy apps
MongoClient.connect(url, function (err, db) {
  if (err) {
    util.puts(err);
  }
  database.findAllAppsInCollection('apps', db)
    .then(function (apps) {
      _.each(apps, function (app) {
        util.puts('launching: subdomain ' + app.appname + ' on port ' + app.port);
        process.chdir('apps/' + app._id);
        spawn('node', [app.start]);
        process.chdir('../..')
      });
    })
    .fail(function (err) {
      util.puts(err);
    })
    .done(function () {
      db.close();
    });
});


http.createServer(function (req, res) {

  var hostname = req.headers.host;
  var subdomain = hostname.substring(0, hostname.indexOf("."));

  //show headers for testing
  //util.puts(JSON.stringify(req.headers.authorization));

  if (subdomain === 'api') {
    //send browser request for user credentials
    if (typeof req.headers.authorization === 'undefined') {
      res.writeHead(401, {'Content-Type': 'text/plain', 'WWW-Authenticate': 'Basic'});
      res.end('password?\n');
    } else {
      //Redirect to Scopes homepage
      proxy.web(req, res, { target: 'http://localhost:3010' });
    }
  } else if (subdomain) {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        util.puts(err)
      }
      database.findNodeAppByName(subdomain, 'apps', db)
        .then(function (app) {
          proxy.web(req, res, { target : 'http://localhost:' + app.port });
        })
        .fail(function (err) {
          proxy.web(req, res, { target : 'http://localhost:3010' });
        })
        .done(function () {
          db.close();
        });
    });
  } else {
    //Redirect to Scopes homepage
    proxy.web(req, res, { target: 'http://localhost:3010' });
  }
}).listen(4000);

util.puts('Scope started on port 4000');

process.on('uncaughtException', function(err){
  console.log(err);
  process.exit(0);
});
