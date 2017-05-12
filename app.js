/************************************

 EXPRESS APP

************************************/

var express = require('express');
var exphbs = require('express-handlebars');
var multer = require('multer');
var bodyParser = require('body-parser');
var util = require('util');
var fs = require('fs');

var app = express();
var database;

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/data/uploads/');
    }
});

var upload = multer({
    storage: storage
});
require('string.prototype.startswith');


/************************************

 EXPRESS CONFIG

************************************/

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/data'));
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json()); // to support JSON-encoded bodies
//app.engine('html', require('ejs').renderFile);


var hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        compare: function(lvalue, rvalue, options) {

            if (arguments.length < 3)
                throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

            var operator = options.hash.operator || "==";

            var operators = {
                '==': function(l, r) {
                    return l == r;
                },
                '===': function(l, r) {
                    return l === r;
                },
                '!=': function(l, r) {
                    return l != r;
                },
                '<': function(l, r) {
                    return l < r;
                },
                '>': function(l, r) {
                    return l > r;
                },
                '<=': function(l, r) {
                    return l <= r;
                },
                '>=': function(l, r) {
                    return l >= r;
                },
                'typeof': function(l, r) {
                    return typeof l == r;
                }
            }

            if (!operators[operator])
                throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

            var result = operators[operator](lvalue, rvalue);

            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }

        }
    }
})


// Create `ExpressHandlebars` instance with a default layout.
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


/************************************

 EXPRESS GET

************************************/

app.get('/', function(req, res, next) {
    database.dbInfo(function(results) {
        return res.render('index', {
            templateName: 'index'
        });
    });
});


// app.get('/p/:tagId', function(req, res) {
//   res.send("tagId is set to " + req.params.tagId);
// });

app.get('/game-client', function(req, res, next) {
    // database.dbInfo(function(results) {
        return res.render('game-client', {
            // 'users': results,
            templateName: 'game-client',
            setLocation: req.query.location
        // });
    });


});

app.get('/game-projection', function(req, res, next) {
    database.dbInfo(function(results) {
        return res.render('game-projection', {
            'users': results,
            templateName: 'game-projection'
        });
    });
});

app.get('/game-projection-new', function(req, res, next) {
    database.dbInfo(function(results) {
        return res.render('game-projection-new', {
            'users': results,
            templateName: 'game-projection-new',
            setLocation: req.query.location
        });
    });
});

app.get('/admin', function(req, res, next) {
    database.dbInfo(function(results) {
        return res.render('admin', {
            'users': results
        });
    });
});

app.get('/database-view', function(req, res, next) {
    // database.dbInfo(function(results) {
    database.getSortedUsers(0,0,function(results){
        return res.render('database-view', {
            'users': results
        });
    });
});




/**************

Sample how to link url with page temple

***************/
//app.get( '/page-name', function( req, res, next ){
// return res.render( 'page-name' );
//);

/**************

Sample how to search a query and render search
We may not use this ... probably some sort of ajax thing instead.

***************/
//app.get("/search", function(req, res, next) {
//  if(req.query.s){
//    var query = req.query.s;
//    database.searchDocs(query, function(items){
//      res.render('search', {'search_results' : items});
//    });
//  } else {
//    return res.render('search');
//  }
//});

/************************************

 EXPRESS GET FOR ALL UNMATCHED URLS
 -- This is now used for Single View

************************************/

/*
app.get('*', function(req, res) {

  //res.redirect("http://www.mysite.com/");
});*/


/************************************

 EXPRESS POST

************************************/
app.post('/check-user', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body.userName)
    database.checkIfUserExists(req, function(err, response) {
        if (err) {
            return res.status(422).json({
                error: err.message
            });
        } else {
            return res.status(200).send(response);
        }
    });
    // This was need for successful callback for ajax
    // This should probably be in a callback maybe inside the restoreFile request.... maybe....
    //res.send(req.body);
});

app.post('/check-email', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body.email)
    database.checkIfEmailExists(req, function(err, response) {
        if (err) {
            return res.status(422).json({
                error: err.message
            });
        } else {
            return res.status(200).send(response);
        }
    });
    // This was need for successful callback for ajax
    // This should probably be in a callback maybe inside the restoreFile request.... maybe....
    //res.send(req.body);
});

app.post('/get-user', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body.email)


    database.getUserByEmail(req, function(err, response) {
        if (err) {
            return res.status(422).json({
                error: err.message
            });
        } else {
            return res.status(200).send(response);
        }
    });
    // This was need for successful callback for ajax
    // This should probably be in a callback maybe inside the restoreFile request.... maybe....
    //res.send(req.body);
});

app.post('/update-fields', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body.email)


    database.updateFields(req, function(err, response) {
        if (err) {
            return res.status(422).json({
                error: err.message
            });
        } else {
            return res.status(200).send(response);
        }
    });
    // This was need for successful callback for ajax
    // This should probably be in a callback maybe inside the restoreFile request.... maybe....
    //res.send(req.body);
});



/*************************************
socket.io && Queue
**************************************/
var server = require('http').createServer();
var io = require('socket.io')(server);

//liveReload views on nodemon auto server reboot
setTimeout(function() {
    io.emit('reload', 'reload');
    console.log('Reload Views');
}, 2000)

io.on('connection', function(socket) {
    console.log('socket connected:', socket);

    socket.on('updateUser', function(userInfo) {
        // console.log(userInfo);
        socket.join(userInfo.room)
        // store the username in the socket session for this client socket
        socket.userObject = userInfo.userObject;
        socket.userObject.locationWaitTime = Date.now(); //add a temp key/value to track how long they have been waiting at this location.
    });

////////////////////////////
// This queue version is based on the temp property 'locationWaitTime' in the user object which is attached to the socket above. This is used instead ofthe io.sockets.socket.handshake time so it can be reset to Date.now() if that user is called to play.
///////////////////////////

    var connections = io.sockets.sockets //all connections global, below functions are reliant on this.
    // console.log('all connections:',connections);

    function allUsersInRoom(roomName){
      var roomUsers = []
      for (var socketID in connections) { //loop over all the user objects
        if (connections[socketID].userObject != null && connections[socketID].rooms[roomName]) { //make sure were not looking at the projection and make sure we are looking at users logged into location
          var user = {
              id: socketID,
              userObject: connections[socketID].userObject
          }
          roomUsers.push(user)
        }
      }

      return roomUsers;
    }

    function organizeUsersByWaitTime(roomName) { //create a list of all connected users in decending order (lowest wait time at the bottom of the returned array)

        // console.log(connections);
        var decendingUsers = []

        for (var socketID in connections) { //loop over all the user objects
            if (connections[socketID].userObject != null && connections[socketID].rooms[roomName]) { //make sure were not looking at the projection and make sure we are looking at users logged into location
                // console.log(connections[socketID]);
                var user = {
                    id: socketID,
                    calculatedWaitTime: Date.now() - connections[socketID].userObject.locationWaitTime,
                    userObject: connections[socketID].userObject
                }
                decendingUsers.push(user)
            }
        }

        //sort
        // console.log('before sort', decendingUsers);
        decendingUsers.sort(function(a, b) {
            return b.calculatedWaitTime - a.calculatedWaitTime
        })
        // console.log('after sort', decendingUsers);

        return decendingUsers;
    }

    socket.on('getNumberOfUsers', function(roomName, callback) {
        var users = allUsersInRoom(roomName);
        callback(users); //send the selected users back to the game-projection
    });

    socket.on('scorePoints', function(user) {
      // console.log('scorePoints',user.email);
      // console.log('scorePoints',user.score);
      database.updatePoints(user.email, user.score)
    });

    //reset mobile views to 'waiting screen'
    socket.on('resetViews', function(users){
      console.log('resetViews users',users);
        users.forEach(function(element) {
          // console.log(element.id);
          socket.to(element.id).emit('newGame', 'newGame');
      });
    });

    socket.on('getNewAndNotifyUsers', function(currentTask, callback) { // should prob be renamed to 'getNewAndNotifyUsers' or something like that.
      // io.emit('newGame', 'newGame') //reset all users to default waiting status on their view.
      io.to(currentTask.location).emit('newGame'); //reset only to the players in the room on new game

      ////////////////////////////
      // get the users who have waited the longest
      ///////////////////////////
        var returnPriorityUsers;

        if(currentTask.players == 'all'){
            //choose all
            returnPriorityUsers = allUsersInRoom(currentTask.location) //this prevents the users who have been waiting the longest from being reset when an all player game happens, if we want to reset them, we can use organizeUsersByWaitTime() here instead.
          } else {
          // choose some
          var priorityUsers = organizeUsersByWaitTime(currentTask.location)

          returnPriorityUsers = priorityUsers.slice(0, currentTask.players);
          console.log('play selections:', returnPriorityUsers);
          //reset the waittime to Date.now() if we were chosen.
          for (var socketID in connections) {
              // console.log(connections[socketID].id);
              returnPriorityUsers.forEach(function(element) { //this could be more efficent.
                  if (connections[socketID].id == element.id) {
                      connections[socketID].userObject.locationWaitTime = Date.now();
                  }
              })
          }
          ////////////////////////////
          // Notify users who are coming up soon after calculation
          ///////////////////////////
          var soonUsers = organizeUsersByWaitTime(currentTask.location)

          var returnSoonUsers = soonUsers.slice(0, 3); //get the X off the top of the list
          console.log('soon selections:', returnSoonUsers);

          returnSoonUsers.forEach(function(element) {
              // console.log(element.id);
              socket.to(element.id).emit('mySoon', 'youre up soon');
          });

        }

        //notify users that it's their turn!
        returnPriorityUsers.forEach(function(element) {
            // console.log(element.id);
            socket.to(element.id).emit('myTurn', currentTask.task);
        });

        callback(returnPriorityUsers) //send the selected users back to the game-projection

    });


    socket.on('disconnect', function() {
        console.log('client disconnected: ' + socket.id);

    });

});
server.listen(3000, function() {
    console.log('socket.io server listening on port 3000')
});



/************************************

MISC

************************************/


module.exports = {
    app: function(db) {
        database = db;
        return app;
    }
}