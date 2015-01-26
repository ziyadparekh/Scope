'use strict';

var util = require('util');
var mkDeferred = require('./deferred');

exports.addObjectToCollection = function (object, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.insert(object, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.findSingleObjectInCollection = function (username, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.findOne({ username : username }, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.updateObjectInCollection = function (object, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ username : object.username},
    {$set : { password : object.password }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.removeObjectFromCollection = function (object, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.remove({ _id : object._id }, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.findNodeAppByName = function (appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.findOne({ appname : appname }, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.saveAppToNextPort = function (appObject, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.insert(appObject, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.saveNextPort = function (portObject, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.insert(portObject, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.getNextAvailablePort = function (collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find().sort({ $natural : -1 }).limit(1).toArray(function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result[0]);
    }
  });
  return deferred.getPromise();
};


exports.removeNodeAppByName = function (appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.remove({ appname : appname }, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.findAllAppsInCollection = function (collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find({}).toArray(function (err, docs) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(docs)
    }
  });
  return deferred.getPromise();
};

exports.saveNewRepoToCollection = function (newRepo, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.insert(newRepo, function (err, result){
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(err);
    }
  });
  return deferred.getPromise();
};

exports.removeNodeRepoFromRepos = function (appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.remove({ appname : appname }, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.findNodeAppByRepoId = function (repoID, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.findOne({repoID : repoID}, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      console.log(result);
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};