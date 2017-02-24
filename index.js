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



// dealing with exit since we've got children
function exitHandler(options, err) {

    if (options.cleanup) {
    	console.log( `\nShutting down ${children.length} process(es)` );
    	// clean up child processes
		for(child of children){
			child.send({exit : true});
		}
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

// process.exit()
process.on('exit', exitHandler.bind(null,{cleanup:true}));
// ctrl+c
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
// uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
