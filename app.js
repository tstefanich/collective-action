
    const SETTINGS = {
        server: 'localhost'
        //server: 'server-http'
        //server: 'server-https'
    }


/************************************

 EXPRESS APP

************************************/

var express = require('express');
var exphbs = require('express-handlebars');
var multer = require('multer');
var bodyParser = require('body-parser');
var util = require('util');
var fs = require('fs');
var minify = require('express-minify');
var compression = require('compression')
var webp = require('webp-middleware');
var minifyHTML = require('express-minify-html');

var app = express();
var database;



var ssl;
var server;

//console.log(ssl);

if(SETTINGS.server == 'localhost'){
    server = require('http').createServer(); //for local testing
} else if(SETTINGS.server == 'server-http'){
    console.log = function() {}
    server = require('http').createServer();
} else if(SETTINGS.server == 'server-https'){
    //console.log = function() {}
    ssl = {
         key: fs.readFileSync('/etc/letsencrypt/live/joincollectiveaction.com/privkey.pem'),
         cert: fs.readFileSync('/etc/letsencrypt/live/joincollectiveaction.com/fullchain.pem'),
         ca: fs.readFileSync('/etc/letsencrypt/live/joincollectiveaction.com/chain.pem')
    }
    server = require('https').createServer(ssl,app); //for server SSL
}



// var server = require('https').createServer(ssl,app); //for server SSL
var io = require('socket.io')(server);




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

Password protect admin page

************************************/
var auth = require('http-auth');
var basic = auth.basic({
        realm: "Web."
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === "admin" && password === "risingsealevels");
    }
);

//app.get('/the_url', );


app.get('/admin', auth.connect(basic), function(req, res, next) {
        return res.render('admin', {});
});
/************************************

 EXPRESS CONFIG

************************************/
app.use(compression());
app.use(minify({
  cache: false,
  uglifyJsModule: null,
  errorHandler: null,
  jsMatch: /javascript/,
  cssMatch: /css/,
  jsonMatch: /json/,
  sassMatch: /scss/,
  lessMatch: /less/,
  stylusMatch: /stylus/,
  coffeeScriptMatch: /coffeescript/,
}));
app.use(webp(__dirname + '/views'));//, { ... }));

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/views/assets'));


app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}))

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  false
    }
}));
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

        },
        listLocations:function(locationsVisitedArray) {
          var out = ''

          for(var i=0, l=locationsVisitedArray.length; i<l; i++) {
            out += locationsVisitedArray[i].location + " ";
          }

          return out;
        },
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


app.get('/demo', function(req, res, next) {
    database.dbInfo(function(results) {
        return res.render('index', {
            templateName: 'index'
        });
    });
});



app.get('/blank', function(req, res, next) {
    // database.dbInfo(function(results) {
        return res.render('blank', {});


});


app.get('/share/:avatar', function(req, res, next) {
        var avatar = req.params.avatar;
        console.log(avatar);

        return res.render('share', {
            templateName: 'share',
            setAvatar: avatar
        });
});

app.get('/share-test', function(req, res, next) {
        var avatar = req.params.avatar;
        console.log(avatar);

        return res.render('share-test', {
            templateName: 'share',
            setAvatar: avatar
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
            templateName: 'game-projection',
            setLocation: req.query.location
        });
    });
});



app.get('/database-view', function(req, res, next) {
    // database.dbInfo(function(results) {
    database.getSortedUsers(100,'-score',function(results){
        return res.render('database-view', {
            'users': results
        });
    });
});


app.get('/get-team', function(req, res, next) {
    database.checkTeamsAndSetTeam(function(err, response) {
        console.log(response);
        if (err) {
            return res.status(422).json({
                error: err.message
            });
        } else {
            return res.status(200).send(response);
        }
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
app.post('/getTeamScores',function(req, res){
  database.calculateTeamScores(function(results){
    // console.log('get scores',results);
    res.status(200).send(results);
  });
})

app.post('/getHighScores',function(req, res){
  database.getSortedUsers(40,'-score',function(results){
    // console.log('highscores',results);
    res.status(200).send(results);
  });
})


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

app.post('/save-user', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body)
    database.saveUser(req, function(err, response) {
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

app.post('/share-save', function(req, res, next) {
       req.body.image = req.body.image.replace(/^data:image\/png+;base64,/, "");
       var userName = req.body.userName;
        //req.body.image = req.body.image.replace(/ /g, '+');
        if (fs.existsSync('views/assets/images/social-media/ns2017/'+userName+'.png')) {
            console.log('found file')
            res.status(200).send('found file'); ;
        } else {
            fs.writeFile('views/assets/images/social-media/ns2017/'+userName+'.png', req.body.image, 'base64', function(err) {
                console.log(err);
                res.status(200).send("file created"); ;
            });
        }
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


app.post('/get-user-by-name', function(req, res) {
    //database.restoreFile(req);
    console.log(req.body.username)


    database.getUserByUsername(req, function(err, response) {
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
var connections;

//liveReload views on nodemon auto server reboot
// setTimeout(function() {
//     io.emit('reload', 'reload');
//     console.log('Reload Views');
// }, 2000)

io.on('connection', function(socket) {
    connections = io.sockets.sockets //all connections global, below functions are reliant on this.
    // console.log('all connections:',connections);

    function allUsersInRoom(roomName){ //list all the users in the room with socket ID
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
                    //toggle the below for local vs servertime
                    // calculatedWaitTime: Date.now() - connections[socketID].userObject.locationWaitTime,
                    calculatedWaitTime: connections[socketID].userObject.totalLocalWaitTime,
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


    socket.on('updateUser', function(userInfo) { //update the userObject attached to the users socket connection && join a specific location
        socket.join(userInfo.room)
        // store the username in the socket session for this client socket
        socket.userObject = userInfo.userObject; //attach the userObject to the socket
        // socket.userObject.locationWaitTime = Date.now(); //add a temp key/value to track how long they have been waiting at this location.
        // console.log("userInfo", userInfo);
        // var user = {
        //     id: socket.id,
        //     userObject: socket.userObject
        // }
    });

    socket.on('joinProjectinoRoom',function(gameLocation){
      socket.join(gameLocation)
      socket.connectedRoom = gameLocation;

    })

    socket.on('addAvatarClient', function(user){ //forward the add onto the projection.
      user.id = socket.id;
      socket.connectedRoom = user.room;
      console.log('addAvatarClient',user);
      io.to(user.room).emit('addAvatar', user);
      // io.emit('addAvatar', user)
    })

    socket.on('getAllUsers', function(roomName, callback) {
        var users = allUsersInRoom(roomName);
        callback(users); //send the selected users back to the game-projection
    });

    socket.on('scorePoints', function(user) {
      // console.log('scorePoints',user.email);
      // console.log('scorePoints',user.score);
      database.updatePoints(user.email, user.score)
      database.updateTracking(user.email, user.tracking)
    });

    socket.on('updateLocationsVisited', function(user){
      // console.log('ULV', user.email);
      // console.log('ULV', user.locationsVisited);
      database.updateLocations(user.email,user.locationsVisited)
    })

    socket.on('getHighScoreUsers',function(callback){
      database.getSortedUsers(7,'-score',function(results){
        // console.log('highscores',results);
        callback(results)
      });
    });

    socket.on('getTeamScores',function(callback){
      database.calculateTeamScores(function(results){
        // console.log('get scores',results);
        callback(results)
      });
    })

    //reset mobile views to 'waiting screen'
    socket.on('resetViews', function(users){
      console.log('resetViews users',users);
        users.forEach(function(element) {
          // console.log(element.id);
          socket.to(element.id).emit('newGame', 'newGame');
      });
    });

    //reset mobile views to 'waiting screen'
    socket.on('resetRoomClients', function(roomName){
      console.log('REFRESH PROJECTION | resetRoomClients');
      io.to(roomName).emit('newGame');
    })

    socket.on('getNewAndNotifyUsers', function(currentTask, callback) { // should prob be renamed to 'getNewAndNotifyUsers' or something like that.
      // io.emit('newGame', 'newGame') //reset all users to default waiting status on their view.
      io.to(currentTask.location).emit('newGame'); //reset only to the players in the room on new game

      // console.log('!',currentTask);

      // get the users who have waited the longest
      ///////////////////////////
        var returnPriorityUsers;

        if(currentTask.playersMax == 'all'){
            //choose all
            returnPriorityUsers = allUsersInRoom(currentTask.location) //this prevents the users who have been waiting the longest from being reset when an all player game happens, if we want to reset them, we can use organizeUsersByWaitTime() here instead.
          } else {
          // choose some
          var priorityUsers = organizeUsersByWaitTime(currentTask.location)

          if(currentTask.playersMax > priorityUsers.length){
              returnPriorityUsers = priorityUsers;
          } else {
            returnPriorityUsers = priorityUsers.slice(0, currentTask.playersMax);
          }
          console.log('play selections:', returnPriorityUsers);
          //reset the waittime to Date.now() if we were chosen. ( no longer needed if doing it by local wait time)
          // for (var socketID in connections) {
          //     // console.log(connections[socketID].id);
          //     returnPriorityUsers.forEach(function(element) { //this could be more efficent.
          //         if (connections[socketID].id == element.id) {
          //             connections[socketID].userObject.locationWaitTime = Date.now();
          //         }
          //     })
          // }
        }

        //notify users that it's their turn!
        returnPriorityUsers.forEach(function(element) {
            // console.log(element.id);
            socket.to(element.id).emit('myTurn', currentTask);
        });

        callback(returnPriorityUsers) //send the selected users back to the game-projection

    });


    socket.on('disconnect', function() {
        console.log('client disconnected:', socket);
        var user = {
            id: socket.id,
            userObject: socket.userObject
        }
        io.to(socket.connectedRoom).emit('removeAvatar', user);

    });

console.log('socket connected:', socket);
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
