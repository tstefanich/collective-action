/************************************

 EXPRESS APP

************************************/

var express  =  require( 'express' );
var exphbs   =  require( 'express-handlebars' );
var multer   =  require( 'multer' );
var bodyParser = require('body-parser');
var util = require('util');

var fs = require('fs');

var app = express();
var database;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/data/uploads/');
  }
});

var upload = multer( { storage: storage } );
require( 'string.prototype.startswith' );

/************************************

 EXPRESS CONFIG

************************************/

app.use(express.static(__dirname + '/bower_components' ) );
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/data'));
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());       // to support JSON-encoded bodies
//app.engine('html', require('ejs').renderFile);


var hbs = exphbs.create( {
  extname: '.hbs',
  helpers: {
    compare: function(lvalue, rvalue, options) {

        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        var operator = options.hash.operator || "==";

        var operators = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        }

        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

        var result = operators[operator](lvalue,rvalue);

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    }
  }
 } )


// Create `ExpressHandlebars` instance with a default layout.
app.engine( '.hbs', hbs.engine );
app.set('view engine', '.hbs');


/************************************

 EXPRESS GET

************************************/

app.get( '/', function( req, res, next ){
	database.dbInfo(function(results){
		return res.render('index',{templateName:'index'});
	});
});

app.get( '/game-client', function( req, res, next ){
  database.dbInfo(function(results){
    return res.render('game-client', {'users' : results, templateName:'game-client'});
  });


});

app.get( '/game-projection', function( req, res, next ){
  database.dbInfo(function(results){
    return res.render('game-projection', {'users' : results, templateName:'game-projection'});
  });


});

app.get( '/admin-1', function( req, res, next ){
  database.dbInfo(function(results){
    return res.render('admin-1', {'users' : results});
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
app.post( '/check-user', function( req, res ) {
  //database.restoreFile(req);
  console.log(req.body.userName)
  database.checkIfUserExists(req, function(err, response){
       if(err){
           return res.status( 422 ).json( {
            error : err.message
         } );
      } else {
           return res.status( 200 ).send( response );
      }
  });
  // This was need for successful callback for ajax
  // This should probably be in a callback maybe inside the restoreFile request.... maybe....
  //res.send(req.body);
});

app.post( '/check-email', function( req, res ) {
  //database.restoreFile(req);
  console.log(req.body.email)
  database.checkIfEmailExists(req, function(err, response){
       if(err){
           return res.status( 422 ).json( {
            error : err.message
         } );
      } else {
           return res.status( 200 ).send( response );
      }
  });
  // This was need for successful callback for ajax
  // This should probably be in a callback maybe inside the restoreFile request.... maybe....
  //res.send(req.body);
});

app.post( '/get-user', function( req, res ) {
  //database.restoreFile(req);
  console.log(req.body.email)


  database.getUserByEmail(req, function(err, response){
       if(err){
           return res.status( 422 ).json( {
            error : err.message
         } );
      } else {
           return res.status( 200 ).send( response );
      }
  });
  // This was need for successful callback for ajax
  // This should probably be in a callback maybe inside the restoreFile request.... maybe....
  //res.send(req.body);
});

app.post( '/update-fields', function( req, res ) {
  //database.restoreFile(req);
  console.log(req.body.email)


  database.updateFields(req, function(err, response){
       if(err){
           return res.status( 422 ).json( {
            error : err.message
         } );
      } else {
           return res.status( 200 ).send( response );
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

// var connectedUsers =

io.on('connection', function(client){
  console.log('client connected: ' + client.id);


  client.on('calcPriority', function(data,callback){
    var newPriority;


    callback(newPriority)
  });

  client.on('disconnect', function(){
    console.log('client disconnected: ' + client.id);
  });

});
server.listen(3000, function(){ console.log('socket.io server started on  port 3000') });

// setTimeout(function(){
//   var clients = io.sockets.clients().connected;
//   console.log(clients);
// },2000)


/************************************

MISC

************************************/


module.exports = {
  app: function(db){
    database = db;
    return app;
  }
}
