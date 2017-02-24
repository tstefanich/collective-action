var schedule = require('node-schedule');
var cp = require('child_process');

var children = [];

// load in database module
var database = require('./database.js');
// when db has init, pass to app and setup scheduler
database.init()
    .then((db) => {

        var app = require('./app.js').app(db);

        app.listen( 8080, function() {  
          console.log( 'Express server listening on port 8080' );
        });


    })
    .catch((err) => console.log("uh oh: " + err.message)); 