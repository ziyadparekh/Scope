'use strict';

var util = require('util');
var mkDeferred = require('../helpers/deferred');

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
  collection.findOne({ user_name : username }, function (err, result) {
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
  collection.find({ app_user : user.user_name }).toArray(function (err, result) {
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
    { $push: { user_apps : app._id }}, function (err, result) {
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
  collection.update({ user_name : object.user_name},
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
  collection.update({ app_name : object.app_name },
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
  collection.findOne({ app_name : appname }, function (err, result) {
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
      deferred.resolve({port : result[0].app_port});
    }
  });
  return deferred.getPromise();
};


exports.removeNodeAppByName = function (appname, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.remove({ app_name : appname }, function (err, result) {
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
  collection.remove({ app_name : appname }, function (err, result) {
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
  collection.findOne({app_name : repoID}, function (err, result) {
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
  collection.find().sort({ app_created : -1})
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
  collection.find().sort({ app_updated : -1})
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
  collection.find().sort({ app_created : -1})
    .limit(limit)
    .skip(offset)
    .sort({ app_stars : -1})
    .toArray(function (err, result) {
      if (err || !result) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.getPromise();
};

exports.addFollowToUser = function (following, user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ _id : user._id },
    { $push : { user_following : following}}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.addUserToFollow = function (username, following, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ user_name : following},
    { $push : { user_followers : username }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.removeFollowFromUser = function (user, unfollow, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ _id : user._id },
    { $pullAll : { user_following : [unfollow]}}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};

exports.removeUserFromUnfollow = function (unfollow, user, collectionString, db) {
  var collection = db.collection(collectionString);
  var deferred = mkDeferred();
  collection.update({ user_name : unfollow }, 
    { $pullAll : { user_followers : [user.user_name]}}, function (err, result) {
      if (err) {
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
  collection.update({ app_name : appname},
    { $push : { app_stars : user.user_name }}, function (err, result) {
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
  collection.update({ user_name : user.user_name},
    { $push : { user_starred : appname }}, function (err, result) {
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
  collection.update({ app_name : appname},
    { $pullAll : { app_stars : [user.user_name] }}, function (err, result) {
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
  collection.update({ user_name : user.user_name},
    { $pullAll : { user_starred : [appname] }}, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result);
      }
    });
  return deferred.getPromise();
};
