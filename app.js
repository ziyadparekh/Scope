'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var base64_decode = require('base64').decode;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var util = require('util');
var crypto = require('crypto');
var mkDeferred = require('./deferred');
var database = require("./database");
var url = 'mongodb://localhost:27017/scope';

var app = express();



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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

// Register User Account
app.post('/register', function(req, res, next) {
  res.set({ 'Content-Type' : 'application/json' });

  var newUserObject = {
    username : req.body.username,
    password : md5(req.body.password)
  };

  MongoClient.connect(url, function (err, db) {
    if (err) {
      util.puts(err);
    }
    //Check to see if username already exists
    database.findSingleObjectInCollection(newUserObject.username, 'users', db)
      .then(function (result) {
        if (result) {
          res.status(400);
          res.send({ status : 'Username Taken' });
        } else {
          // Add new user
          database.addObjectToCollection(newUserObject, 'users', db)
            .then(function (result) {
              util.puts(result);
              res.status(200);
              res.send({ status : 'Success' });
            })
            .fail(function (err) {
              res.status(500);
              res.send({ status : 'Internal Server Error' });
              util.puts(err);
            });
        }
      })
      .done(function () {
        db.close();
        res.end();
      });
  });
});

// Delete User Account
app.delete('/destroy', function (req, res, next) {
  authenticate(req.headers.authorization)
    .then(function (result) {
      MongoClient.connect(url, function (err, db) {
        if (err) {
          util.puts(err);
        }
        database.removeObjectFromCollection(result._id, 'users', db)
          .then(function (result) {
            res.status(200);
            res.set({ 'Content-Type' : 'application/json' });
            res.send({ status : 'success' });
          })
          .fail(function (err) {
            res.set({ 'Content-Type' : 'application/json' });
            res.status(400);
            res.send({ status : 'failure' });
          })
          .done(function () {
            db.close();
            res.end();
          });
      });
    })
    .fail(function (err) {
      res.set({ 'Content-Type' : 'application/json' });
      util.puts(err);
      res.send({ status : 'auth-failed' });
    })
    .done(function () {
      res.end();
    });
});

// Create node app
// curl -X POST -u "testuser:123" -d "appname=test&start=hello.js" http://api.localhost:4000/apps
app.post('/apps', function (req, res, next) {
  res.set({ 'Content-Type' : 'application/json' });
  authenticate(req.headers.authorization)
    .then(function (user) {
      var appname = req.body.appname;
      var start = req.body.start;
      MongoClient.connect(url, function (err, db) {
        if (err) {
          util.puts(err);
        };
        database.findNodeAppByName(appname, 'apps', db)
          .then(function (app) {
            if (app) {
              res.status(400);
              res.send({ status : 'App Subdomain already exists' });
            } else {
              database.getNextAvailablePort('ports', db)
                .then(function (port) {
                  var appPort = port.portNumber + 1;
                  var appObject = {
                    appname : appname,
                    start : start,
                    port : appPort,
                    userID : user._id,
                    username : user.username
                  };
                  database.saveNextPort({portNumber : appPort}, 'ports', db)
                    .done(function () {
                      util.puts({ status : 'success', message : 'new port created', port : appPort });
                    });
                  database.saveAppToNextPort(appObject, 'apps', db)
                    .then(function (result) {
                      res.status(200);
                      res.send(result);
                    })
                    .fail(function (err) {
                      res.status(500)
                      res.send({ status : 'failure' });
                    })
                    .done(function () {
                      res.end();
                      db.close();
                    });
                });
            }
          });
      });
    })
    .fail(function () {
      res.status(400);
      res.send({status : 'failure', message : 'auth failed' });
    });
});

// Delete node app
// curl -X DELETE -u "testuser:123" -d "appname=test" http://api.localhost:4000/apps
app.delete('/apps', function (req, res, next) {
  res.set({'Content-Type' : 'application/json' });
  var appname = req.body.appname;
  authenticate(req.headers.authorization)
    .then(function (user) {
      MongoClient.connect(url, function (err, db) {
        if (err) {
          util.puts(err);
        }
        database.findNodeAppByName(appname, 'apps', db)
          .then(function (app) {
            if (app && (app.username === user.username)) {
              database.removeNodeAppByName(appname, 'apps', db)
                .then(function (result) {
                  res.status(200);
                  res.send({ status : 'deleted' });
                })
                .fail(function (err) {
                  res.status(500)
                  res.send({ status : 'internal failure' });
                })
                .done(function () {
                  res.end();
                  db.close();
                })
            } else {
              res.status(400)
              res.send({status : 'failure'});
              db.close();
            }
          })
          .fail(function (err) {
            res.status(400)
            res.send({status : 'app not found'});
          });
      });
    })
    .fail(function (err) {
      res.status(400)
      res.send({status : 'auth failed'});
    });
});

app.get('/status', function (req, res, next) {
  res.status(200);
  res.set({ 'Content-Type' : 'application/json' });

  authenticate(req.headers.authorization)
    .then(function (result) {
      util.puts(result);
      console.log('success');
      res.send({ status : "sucess", user : result._id, username : result.username });
    })
    .fail(function (err) {
      util.puts(err);
      res.send({ status : "failure" });
    })
    .done(function () {
      res.end();
    });
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
  var deferred = mkDeferred();

  if (typeof basicauth === 'undefined') {
    deferred.reject();
    return deferred.getPromise();
  };

  var creds = base64_decode(basicauth.substring(basicauth.indexOf(" ") + 1));
  var username = creds.substring(0, creds.indexOf(":"));
  var password = creds.substring(creds.indexOf(":") + 1);

  MongoClient.connect(url, function (err, db) {
    if (err) {
      util.puts(err);
    }
    database.findSingleObjectInCollection(username, 'users', db)
      .then(function (result) {
        if (result.password === md5(password) && result.username === username) {
          deferred.resolve(result);
        } else {
          deferred.reject()
        }
      })
      .fail(function (err) {
        deferred.reject(err);
      })
      .done(function () {
        db.close();
      });
  });
  return deferred.getPromise();
};

function md5 (str) {
  return crypto.createHash('md5').update(str).digest('hex');
};

