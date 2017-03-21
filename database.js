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


var database = {

  Users : null,
  userSchema : null,

  myTest: function(){console.log("this is a test")},
  init : function(){
    var self = this;
    return new Promise(function(resolve, reject){

      mongoose.connect('mongodb://localhost/test',function(){
        /* Drop the DB at start to clear for testing, was getting flooded with fake data and I couldnt find where it was getting logged out... */
        mongoose.connection.db.dropDatabase();
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

          // STATIC
          //uid: Number, // may not need this, autoIndex is true by default..
          userName: String,
          email: { type: String, set: toLower },
          avatar: Array, // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
          team: Number,
          tasksPlayed: Array,

          // PING
          loggedIn: Boolean,
          currentLocation: String,
          priority: Number,
          waitTime: Number,

          // METRICS
          score: Number,
          locationsVisited: Array, // location + timespent
          totalTasks: Number, // this may not be needed scores = totalPlays
          totalTaskTime: Number,
          totalWaitTime: Number,

          //Aggragate Metrics
          //logs: String, // may not needed this
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
        self.fakeData();
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
  this.Users.find({userName : userName}, function (err, docs) {
       if(userName == ''){
         console.error('blank');
         return callback(null, 'blank');
    } else if(swearjar.profane(userName)){
        console.error('Name exists already');
        return callback(null, 'profane');
     } else if (docs.length){
        console.error('Name exists already');
        return callback(null, true);
     }else{
        console.error('Go ahead!! No Name Found. ');
        return callback(null, false);
     }
  })
}




/************************************

 DATABASE Getters / Setters

************************************/

/// USERS

//post // login & socket stuff
database.retrieveUserData = function(email){
  //return the users object via email lookup
}

//dont really need this if we are using local storage.
// //accessible via app.js
// database.retrieveConnectionTimeStamp = function(email){
//   //look up a users timestamp by email
// }
//
// //these are not in the schema yet, need to add above.
// database.updatePriority = function(){
//
// }
//
// database.updateConnectionTimeStamp = function(){
//
// }
//
// database.updateTasksPlayed = function(){
//
// }


// database.findUser = function(req,callback){
//   // var email = req.body.email;
//   // var thing = {email : findByEmail}
//   this.Users.find({email:email}, function (err, user) {
//
//     console.log(user);
//
//
//     if(err) console.error(err);
//   })
//
//
// }

/// LOCATION


database.getLocation = function ()
{

}

database.setLocation = function ()
{

}


/************************************

 DATABASE Save Functions (mongodb)

************************************/

database.saveUser = function (doc){

  doc.save(function (err, doc) {
    if (err) return console.error(err);
    // doc.test(); // maybe run the function if you feel like it
  });
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
var userNames = ['Ben', 'Tyler', 'Sara']
var emails = ['Ben@benmoren.com', 'Tyler@tylerstefanich.com', 'sara@sara.com']

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

  for (var i = 3 - 1; i >= 0; i--) {

    var data = new this.Users({
      userName: userNames[i],
      email: emails[i],
      avatar: [1,2,3,4], // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
      team: 1,
      tasksPlayed: [rand(30),rand(30),rand(30)],

      // PING
      loggedIn: true,
      currentLocation: 'River',
      priority: rand(30),
      waitTime: rand(1000),

      // METRICS
      score: 200,
      locationsVisited: ['River','Target'], // location + timespent
      totalTasks: rand(30), // this may not be needed scores = totalPlays
      totalTaskTime: rand(1000),
      totalWaitTime: rand(1000),
    });

    // SAVE USER
    this.saveUser(data, function(){})
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





database.saveTitle = function (searchTerm, newTitle){
  this.Users.update(
    { _id: searchTerm },
    { $set:
      {
        title: newTitle
      }
    }, function (err) {
      if (err) return handleError(err);
      // updated!
    });
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
      tasksPlayed: data.tasksPlayed,
      loggedIn:  data.loggedIn ,
      currentLocation:  data.currentLocation,
      priority: data.priority  ,
      waitTime: data.waitTime  ,
      score:  data.score  ,
      locationsVisited: data.locationsVisited  ,
      totalTasks: data.totalTasks ,
      totalTaskTime: data.totalTaskTime  ,
      totalWaitTime: data.totalWaitTime
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
      tasksPlayed: { $addToSet: "$tasksPlayed"  },
      loggedIn: { $addToSet: "$loggedIn"  },
      currentLocation: { $addToSet: "$currentLocation"  },
      priority: { $addToSet: "$priority"  },
      waitTime: { $addToSet: "$waitTime"  },
      score: { $addToSet: "$score"  },
      locationsVisited: { $addToSet: "$locationsVisited"  },
      totalTasks: { $addToSet: "$totalTasks"  },
      totalTaskTime: { $addToSet: "$totalTaskTime"  },
      totalWaitTime: { $addToSet: "$totalWaitTime"  },
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
