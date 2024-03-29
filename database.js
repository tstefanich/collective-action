/************************************

 DATABASE STUFF (mongodb)

************************************/

//ensureIndex!!!
//http://stackoverflow.com/questions/21417711/search-multiple-fields-for-multiple-values-in-mongodb

// NOTES: probably make this into a singleton-like thing (don't want multiple database inits)
// also potentially switch to a constructor thing and add the init stuff to that

require('shelljs/global');
var mongoose = require('mongoose');
var fs = require('fs');
var mime = require('mime');
var swearjar = require('swearjar');



// This is needed for email schema ... definitly a better way to do this...
function toLower (str) {
    return str.toLowerCase();
}

function handleError(err){
  console.error(err)
}

var database = {

  Users : null,
  userSchema : null,

  myTest: function(){console.log("this is a test")},
  init : function(){
    var self = this;
    return new Promise(function(resolve, reject){


      mongoose.connect('mongodb://localhost/test',function(err){
        if (err) return handleError(err);
        // Drop the DB at start to clear for testing
        //mongoose.connection.db.dropDatabase(function(){
        //   database.fakeData();
        // });
      });

      console.log("connecting to database...");

      // connect to database
      // mongoose.connect('mongodb://localhost/test');

      var db = mongoose.connection;

      db.on('error', function(){reject({message: "db connection error"})});

      // once connected, do stuff
      db.once('open', function(){
        // we're connected!
        console.log('database connection successful');


        self.userSchema = mongoose.Schema({
          //uid: Number, // may not need this, autoIndex is true by default..
          userName: String,
          email: { type: String, set: toLower },
          avatar: String, // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
          team: Number,
          // waitTime: Number,
          // tasksPlayed: Array,
          score: Number,
          locationsVisited: Array, // location + timespent
          tracking:Array //tracking
        });

        // Very Important! Make the title and text parameters "text" indices
        //self.userSchema.index({text:'text'});

        // make sure to add any methods b4 defining the model
        self.userSchema.methods.test = function () {
          // code that might do something, can reference self with 'this.title' etc.
          console.log(this.title + " page: " + this.page + " complete");
        }

        // define document model
        self.Users = mongoose.model('Users', self.userSchema);

        //self.deleteAllUsers();
        // self.fakeData();

        //self.updateFields();
        // self.getUsers(self.Users);
        // self.findUser('sara@sara.com')
        //searchDocs(Document, 'blade runner', function(results){
        //  console.log('first search')
        //});

        // create a dummy Doc and save it

        // var testDoc = new Document({title: 'My Second Document'});
        // console.log(testDoc.title);
        // saveDocument(testDoc);
        resolve(self);
      });

    });
  }
}


/************************************

DATABASE FUNCTIONS

************************************/

database.getUsers = function ()
{

  this.Users.find(function (err, docs)
  {
    if (err) return console.error(err);
    console.log(docs);
  });
}

database.getUserByEmail = function(req, callback){
  var email = req.body.email;
  console.log(email)
  this.Users.findOne({ email : email }, function(error, docs) {
    console.error('getUserByEmail');
    return callback(null, docs);
  });
}

database.getUserByUsername = function(req, callback){
  var username = req.body.username;
  username = '^'+username+'$';
  console.log(username)
  this.Users.findOne({ userName : {'$regex': username, $options:'i'}}, function(error, docs) {
    console.error('getUserByUsername');
    return callback(null, docs);
  });
}

database.checkIfEmailExists = function (req,callback)
{
  var email = req.body.email;
  this.Users.find({email : email}, function (err, docs) {
       if(email == ''){
        console.error('blank');
        return callback(null, 'blank');
   } else if (docs.length){
        console.error('Name exists already');
        return callback(null, true);
     }else{
        console.error('Go ahead!! No Name Found. ');
        return callback(null, false);
     }
  })
}

database.checkIfUserExists = function (req,callback)
{
  var userName = req.body.userName;
  userName2 = '^'+userName+'$';
  var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/); //unacceptable chars

  this.Users.find({userName : {'$regex': userName2,$options:'i'}}, function (err, docs) {
    if(userName == ''){
         console.error('blank');
         return callback(null, 'blank');
    } else if(swearjar.profane(userName)){
        console.error('Name exists already');
        return callback(null, 'profane');
     } else if(pattern.test(userName)) {
      return callback(null, 'specialCharacters');
     } else if(userName.indexOf(' ') >= 0) {
      return callback(null, 'spaces');
     } else if (docs.length){
        console.error('Name exists already');
        return callback(null, true);

     }else{
        console.error('Go ahead!! No Name Found. ');
        return callback(null, false);
     }
  })
}

database.getSortedUsers = function(limitNum, sortBy, callback){
  // sortby ex: '-score' to sort score decending
  this.Users.find({}).sort(sortBy).limit(limitNum).exec(function(err, results) {
    if (err) return handleError(err);
    // console.log(results);
    callback(results)
   });

}

Array.prototype.hasMin = function(attrib) {
    return this.reduce(function(prev, curr){
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
 }

database.checkTeamsAndSetTeam = function(callback){
  this.Users.aggregate(
    { $group:
      { _id: '$team', total: { $sum: 1 } }
    },
    function (err, results) {
      if (err) return handleError(err);
      console.log(results);

      var temp = results.hasMin('total');
      console.log(temp);
      return callback(null, temp);
      //callback(JSON.stringify(results));
    });
}



/* THIS NEEDS STRESS TESTING! */
database.calculateTeamScores = function(callback){
  var scores = []
  // {
  //   'team1': 0,
  //   'team2': 0,
  //   'team3': 0,
  //   'team4': 0,
  // }

  database.calculateSingleTeamScore(1,function(scoreOut){
    // scores.team1 = score
    scores.push({'team':1,'score':scoreOut})
    database.calculateSingleTeamScore(2,function(scoreOut){
      // scores.team2 = score
      scores.push({'team':2,'score':scoreOut})
      database.calculateSingleTeamScore(3,function(scoreOut){
        // scores.team3 = score
        scores.push({'team':3,'score':scoreOut})
        database.calculateSingleTeamScore(4,function(scoreOut){
          // scores.team4 = score
          scores.push({'team':4,'score':scoreOut})
            // console.log(scores);
            callback(scores)
        })
      })
    })
  })

}

database.calculateSingleTeamScore = function(teamNumber,callback){
  var score  = 0;
  this.Users.find({'team':teamNumber}).exec(function(err, results) {
    if (err) return console.error(err);
    results.forEach(function(result){
      score += result.score; //add this users score to the total
    })
    // console.log(scores);
    // console.log('teamScore',results);
    callback(score)
  })

}

/************************************

 DATABASE Save Functions (mongodb)

************************************/
//used for Fake Data
database.saveFakeUser = function (doc){

  doc.save(function (err, doc) {
    if (err) return console.error(err);
    // doc.test(); // maybe run the function if you feel like it
  });
}

database.saveUser = function (req,callback){
  var data = new this.Users({
      userName: req.body.userName,
      email: req.body.email,
      avatar: req.body.avatar,
      team: req.body.team,
      // tasksPlayed: [rand(30),rand(30),rand(30)],
      // waitTime: rand(1000),

      // METRICS
      score: 0 ,
      locationsVisited: [], // location + timespent
    });

    // SAVE USER


  data.save(function (err, doc) {
    return callback(null, 'saved user');
    if (err) return console.error(err);
    // doc.test(); // maybe run the function if you feel like it
  });
}





database.updatePoints = function (searchEmail, newScore){
  var query = { email: searchEmail };
  this.Users.findOneAndUpdate(query, { score: newScore }, function(err){
      if (err) return handleError(err);
  })
}

database.updateTracking = function (searchEmail, appendTracking){
  var query = { email: searchEmail };
  this.Users.collection.findOneAndUpdate(
    query,
    {$push: {tracking: appendTracking}},
    {safe: true, upsert: true},
    function(err, model) {
      if (err) return handleError(err);
    });


}

database.updateLocations = function (searchEmail, newLocations){
  console.log(newLocations);
  var query = { email: searchEmail };
  this.Users.findOneAndUpdate(query, { locationsVisited: newLocations }, function(err){
      if (err) return handleError(err);
  })
}

/************************************

 DATABASE Delete Functions (mongodb)

************************************/

database.deleteUser = function (searchTerm, callback) {
  var query = searchTerm;
  this.Document.remove({ userName: query }, function (err) {
    if (err) return handleError(err);
    // removed!
  });

};

database.deleteAllUsers = function (db, callback) {
   this.Users.remove({}, function (err) {
     if (err) return handleError(err);
     // removed!
   });
};



/************************************

 DATABASE Backups

************************************/

database.backup = function (searchTerm, newTitle){
  //sudo mongodump --db newdb --out /var/backups/mongobackups/`date +"%m-%d-%y"`
  //3 3 * * * mongodump --out /var/backups/mongobackups/`date +"%m-%d-%y"`
  //find /var/backups/mongobackups/ -mtime +7 -exec rm -rf {} \;
}


/************************************

 DATABASE FAKE DATA (mongodb)

************************************/

 var userNames = ['TallFlower', 'FastBeeFriend', 'WavyMooseTask', 'KookyBoatHug','TallFlower']
// var emails = ['Ben@benmoren.com', 'Tyler@tylerstefanich.com', 'sara@sara.com']

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function rand(max) {
  min = Math.ceil(1);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

database.fakeData = function(){

  for (var i = 1; i <=4;i++) {

    var data = new this.Users({
      userName: userNames[i],
      email: 'dbinituser'+i + '@dbinituser.com',
      avatar: i+'.png',
      team: i,
      // METRICS
      score: Math.ceil(Math.random() * 5),
      locationsVisited: [{location:'dbinit', time:Date.now()}], // location + timespent
    });

    // SAVE USER
    this.saveFakeUser(data, function(){})
  }

}




/************************************

 Mostly Unused but maybe useful later

************************************/


database.searchDocs = function (keyword, callback)
{
  console.time('searchTime');
  var items = [];

  this.Users.find(
        { $text : { $search : keyword } },
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, results) {
      // console.log(results);
    if(results.length > 0) {
      for (var nextResult of results){
        items.push(nextResult);
        console.log(nextResult.title + ' : ' + nextResult.page + ' : ' + nextResult.text);
      }
    } else {
      console.log('no results');
    }
    console.timeEnd('searchTime');
    callback(items);
    });

}

database.searchDocsTitle = function (title, callback)
{


this.Users.aggregate(
    { $group:
      { _id: '$title',
        totalPages: { $sum: 1 },
        pdf: { $addToSet: "$pdf"  },
        title: { $addToSet: "$title"  },
        author: { $addToSet: "$author"  },
        year: { $addToSet: "$year"  }
      }
    },{
        $match: {
          $or: [
          { title:
            {
              $in: title
            }
          }
          ]
        }
    },
    function (err, results) {
      if (err) return console.log(err);
      console.log(results);
      callback(results);
    }
  );
}




/************************************

 Misc

************************************/


/**
userName:'Marcus',
email: 'email',
avatar: 'Array', // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
team: 'Number',
tasksPlayed: 'Array',

// PING
loggedIn: 'Boolean',
currentLocation: 'String',

// METRICS
score: 'Number',
locationsVisited: 'Array', // location + timespent
totalTasks: 'Number', // this may not be needed scores = totalPlays
totalTaskTime: 'Number',
totalWaitTime: 'Number',
priority: 1, // 1-5, lower is lower for the queueing system (MIGHT NEED THIS IN THE DB TOO?)
**/

database.updateFields = function(req, callback){
  var email = req.body.email;
  var data = req.body;
  database.Users.findOneAndUpdate({ email: email },{ "$set":
      {
      userName: data.userName,
      avatar: data.avatar,
      team: data.team ,
      // tasksPlayed: data.tasksPlayed, //Delete
      // waitTime: data.waitTime  , //Delete?
      score:  data.score  ,
      locationsVisited: data.locationsVisited

     }
   }, function(err, user) {
    if (err) throw err;
    return callback(null, user);
    // we have the updated user returned to us
  });

};



database.dbInfo = function (callback) {
 database.Users.aggregate(
   { $group:
     { _id: '$userName',
      userName: { $addToSet: "$userName"  },
      email: { $addToSet: "$email"  },
      avatar: { $addToSet: "$avatar"  },
      team: { $addToSet: "$team"  },
      // tasksPlayed: { $addToSet: "$tasksPlayed"  },
      // waitTime: { $addToSet: "$waitTime"  },
      score: { $addToSet: "$score"  },
      locationsVisited: { $addToSet: "$locationsVisited"  },
     }
   },
   function (err, results) {
     if (err) return handleError(err);
    //  console.log(results);
     callback(results);
   }
 );
}


// export my database module
module.exports = database;
