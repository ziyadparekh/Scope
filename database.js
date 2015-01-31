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
    if (err || !result) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.getUserPortfolio = function (user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find({ appuser : user.username }).toArray(function (err, result) {
    if (err || !result) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.saveAppIdToUserPortfolio = function (app, user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({_id : user._id},
    { $push: { userapps : app._id }}, function (err, result) {
      if (err) { 
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });

  return deferred.getPromise();
};

exports.updateObjectInCollection = function (object, attribute, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ username : object.username},
    {$set : attribute}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.updateApp = function (object, attribute, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ appname : object.appname },
    {$set : attribute}, function (err, result) {
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
    if (err || !result) {
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
    } 
    if (!result.length) {
      deferred.resolve({port : 1025});
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
  collection.findOne({appname : repoID}, function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      console.log(result);
      deferred.resolve(result);
    }
  });
  return deferred.getPromise();
};

exports.findLatestApps = function (limit, offset, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find().sort({ appcreated : -1})
    .limit(limit)
    .skip(offset)
    .toArray(function (err, result) {
      if (err || !result) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.getPromise();
};

exports.findLatestUpdatedApps = function (limit, offset, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find().sort({ appupdated : -1})
    .limit(limit)
    .skip(offset)
    .toArray(function (err, result) {
      if (err || !result) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.getPromise();
};

exports.findTrendingApps = function (limit, offset, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.find().sort({ appcreated : -1})
    .limit(limit)
    .skip(offset)
    .sort({ appstars : -1})
    .toArray(function (err, result) {
      if (err || !result) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.getPromise();
};

exports.addUserToAppStars = function (appname, user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ appname : appname},
    { $push : { appstars : user.username }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.addAppToUserStars = function (user, appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ _id : user._id}, 
    { $push : { userstarred : appname }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.removeUserFromAppStars = function (appname, user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ appname : appname}, 
    { $pullAll : { appstars : [user.username] }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        console.log(result);
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.removeAppFromUserStars = function (user, appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ _id : user._id}, 
    { $pullAll : { userstarred : [appname] }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};