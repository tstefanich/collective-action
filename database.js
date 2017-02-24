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
var database = {

  Users : null,
  userSchema : null,

  myTest: function(){console.log("this is a test")},
  init : function(){
    var self = this;
    return new Promise(function(resolve, reject){

      console.log("connecting to database...");

      // connect to database
      mongoose.connect('mongodb://localhost/test');

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
          avatar: Array, // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
          team: Number,
          tasksPlayed: Array,
          
          // PING
          loggedIn: Boolean,
          currentLocation: String, 

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

        self.deleteAllUsers();
        self.fakeData();
        self.getUsers(self.Users);
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

/************************************

 DATABASE Getters / Setters 

************************************/

/// USERS

database.getUserName = function ()
{
  
}

database.setUserName = function ()
{
  
}

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
      avatar: [1,2,3,4], // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
      team: 1,
      tasksPlayed: [rand(30),rand(30),rand(30)],
      
      // PING
      loggedIn: true,
      currentLocation: 'River', 

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

















database.searchDocs = function (keyword, callback)
{
  console.time('searchTime');
  var items = [];
  // var r = new RegExp(keyword,'');
 //  
  // DocModel.find({ 'text': {$regex:r}}, function(err, results){
  //  if (err) return console.error(err);
    
 //    // returns results array
  //  if(results.length > 0) {
  //    for (var nextResult of results){
  //      //console.log('page '+nextResult);
 //        items.push(nextResult);
  //    }
  //  } else {
  //    console.log('no results');
  //  }
  //  console.timeEnd('searchTime');
 //    //console.log(items);
 //    callback(items);
  // });

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
//  console.log('searchDocsTrash');
//    //['NS2016-titles-2015-06-08_1PM.pdf','OCR-mediumBook-English.pdf']
//    this.Document.find( { pdf: { $in: ['NS2016-titles-2015-06-08_1PM.pdf','OCR-mediumBook-English.pdf'] } } ,
//    function (err, results) {
//      console.log(err);
//      if (err) return console.error(err);
//      console.log(results);
//      callback(results);
//    } )
//

this.Document.aggregate(
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
  this.Document.update(
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







database.dbInfo = function (callback) {
 database.Users.aggregate(
   { $group: 
     { _id: '$userName',
      userName: { $addToSet: "$userName"  },
      avatar: { $addToSet: "$avatar"  },
      team: { $addToSet: "$team"  },
      tasksPlayed: { $addToSet: "$tasksPlayed"  },
      loggedIn: { $addToSet: "$loggedIn"  },
      currentLocation: { $addToSet: "$currentLocation"  },
      score: { $addToSet: "$score"  },
      locationsVisited: { $addToSet: "$locationsVisited"  },
      totalTasks: { $addToSet: "$totalTasks"  },
      totalTaskTime: { $addToSet: "$totalTaskTime"  },
      totalWaitTime: { $addToSet: "$totalWaitTime"  },          
     } 
   },
   function (err, results) {
     if (err) return handleError(err);
     console.log(results);
     callback(results);
   }
 );
}


// export my database module
module.exports = database;