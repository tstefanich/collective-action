/**
 * Represents a search trough an array.
 * @function search
 * @param {Array} array - The array you wanna search trough
 * @param {string} key - The key to search for
 * @param {string} [prop] - The property name to find it in
 */



function search(array, key, prop){
    // Optional, but fallback to key['name'] if not selected
    prop = (typeof prop === 'undefined') ? 'name' : prop;
    var tempArray = [];
    for (var i=0; i < array.length; i++) {
        if (array[i][prop] <= key) {
            tempArray.push(array[i]);
        }
    }
    return tempArray;
}

var allTasks = []


function moreDetails(click){
     var $this = null;
     // check if object is jquery object
     if(click instanceof jQuery){
          $this = click;
     } else {
          // this is a javascript object
          $this = $('#'+click.id);
     }
     var href = $this.attr("href");
     var hash = href.substr(1);

     if($this.hasClass('artwork')){
          showArtworkClose();

          console.log('artwork');

          // Get project desc panel and send it to marker as visited function
          var $thisProject = $this.parents('.project-slide-panel');
          //setMarkerAsVisited($thisProject);


          //console.log($this.attr('data-project-url'));
          var projectUrl = $this.attr('data-project-url');
          var $iframe = $('.iframe.project-slide-panel');
          //customProblemsAndFixesArtwork($('.slideUp.project-slide-panel'));

          //Set Panel from display none to display block
          $iframe.css('display','block');

          //Set Panel src
          $iframe.attr('src',projectUrl);

          //If we don't set a slight timeout the css animation won't work.
          setTimeout(function(){
            $iframe.addClass('slideUp');
          },100);

        }  else {

                    //Set Panel from display none to display block
                    $('.page.'+hash).css('display','block');

                    //If we don't set a slight timeout the css animation won't work.
                    setTimeout(function(){
                         $('.page.'+hash).addClass('slideUp');
                    },100);

                    var currentPageImage = $('.project-slide-panel.'+hash).find('.location-image-large');
                    var currentPage = $('.project-slide-panel.'+hash);
                    var currentImage = currentPage.attr('data-image')
                   if(currentPageImage.length){
                     $('<img/>').attr('src', '/assets/images/locations/'+currentImage+'-large.jpg').load(function() {
                      $(this).remove(); // prevent memory leaks as @benweet suggested
                      currentPageImage.css('background-image', 'url(/assets/images/locations/'+currentImage+'-large.jpg)');
                      currentPageImage.delay(700).velocity({opacity: 1},600);
                     });
                   }

           }
}

function slideDownPanel(link){
     var $this = link;

     if($this.hasClass('artwork')){
          var $iframe = $('.iframe.project-slide-panel');
          hideArtworkClose();

          $iframe.velocity({opacity: 0}, 150, function(){

            setTimeout(function(){
              $iframe.css('display','none');
              $iframe.attr('src', $iframe.attr('data-fake-src'));
              $iframe.removeClass('slideUp');

              setTimeout(function(){
                $iframe.removeClass('white'); // This is a fix for some of the projects
                $('.close.artwork').removeClass('black'); // This is a fix for some of the projects
                $iframe.css('opacity','1');
              },250);

            }, 750);



          });


        } else {
     if($this.parent('.nav').parent('.page').hasClass('sign-up')){
          $('#carousel-sign-up').carousel(0);
     }
     $this.parent('.nav').parent('.page').removeClass('slideUp');
     setTimeout(function(){
       $this.parent('.nav').parent('.page').css('display','none');
     }, 750);

     }
}

/**********************
Globals
**********************/
var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

//reload the view when the app boots up & this page connects
socket.on('reload',function(){
  location.reload();
  console.log('~+~+~+~ RELOADED PAGE');
})

var time;

const GAME_LOCATION = 'location1'


/**********************
Helper Functions
**********************/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


var gameProjection = {
     currentNumberOfConnections:null,
     requestedNumberOfConnections: false,
     currentPlayers:null,
     requestedCurrentPlayers: false,
     currentTask:null,
     requestedTask: false,
     prepCounter:0,
     prepTime:3000,
     wait:5000,
     state:'title',
     gameStateIndex:0,
     gameStates:['highscore players','highscore team','teaser','get players','get task','start task'],
     init: function(){
          time = new Date().getTime();//store the current time
          // this.getNewTask();
          // this.newGame()

          //socket.on('connect', function(){
          //     console.log('connected to the server as: ' + socket.id);
          //});
//
          //socket.on('disconnect', function(){
          //     console.log('disconnected from the server as: ' + socket.id);
          //});

     },
     changeState:function(string){
      gameProjection.state = string;
     },
     setStateAndTime:function(state, waitTime){
      var self = this;
      console.log(state);
      if(state != 'get-number-of-connections-task-players' && state != 'get-number-of-connections' && state != 'get-task' && state != 'get-players'){
        slideDownPanel($('.page.slideUp .close'));
        moreDetails($('.page.'+state+' .nav a'));
      }
      self.state = state;
      self.wait = waitTime
     },
     reset:function(){
      var self = this;
      self.currentNumberOfConnections = null;
      self.requestedNumberOfConnections = false;
      self.currentPlayers = null;
      self.requestedCurrentPlayers = false;
      self.currentTask = null;
      self.requestedTask = false;

      self.prepTime = 3000;
      self.prepCounter = 0;
     },

      checkTimer:function(){
           var self = this;
           if(new Date().getTime())
           if(new Date().getTime() - time >= self.wait){
                console.log("tick2");//if it is, do something
                time = new Date().getTime();//also update the stored time
                switch (self.state) {
                  case 'title':
                      self.setStateAndTime('highscores-players', 5000);
                      break;
                  case 'highscores-players':
                      self.setStateAndTime('highscores-teams', 5000);
                      break;
                  case 'highscores-teams':
                      self.setStateAndTime('get-number-of-connections-task-players', 100);
                      break;
                  case 'get-number-of-connections-task-players':
                      self.checkIfNumberOfConnectionsIsEmptyAndGet();
                      self.checkIfTaskIsEmptyAndGet();
                      self.checkIfPlayersIsEmptyAndGet();
                      if(self.currentNumberOfConnections != null && self.currentTask != null && self.currentPlayers != null && allTasks.length > 0){
                        self.setStateAndTime('setup-game', 1000);
                      } else {
                        self.setStateAndTime('get-number-of-connections-task-players', 100);
                      }
                      break;
                  case 'setup-game':
                      // self.newGame();
                      self.writeTaskToScreen();
                      self.setStateAndTime('invite-to-performance-area', 5000);
                      break;
                  case 'invite-to-performance-area':
                      //check to change the screen to wait for more players if there are less than 2.
                      if(self.currentNumberOfConnections < 2) {
                        self.setStateAndTime('we-need-more-players', 3000);
                      } else {
                        self.setStateAndTime('prep-for-task', 3000);
                      }
                      //var interval = 0;
                      //self.setStateAndTime('get-players', self.wait);
                      //$('.page .people ul li').each(function(){
                      //  interval = interval + 2000;
                      //  $(this).delay(interval).animate({opacity:1});
                      //});
                      break;
                  case 'we-need-more-players':
                      self.setStateAndTime('get-number-of-connections-task-players', 3000);
                      break;
                  case 'prep-for-task':
                      // time to get ready
                      console.log(gameProjection.currentPlayers)

                      self.setStateAndTime('start-task',  gameProjection.currentTask.time);
                      break;
                  case 'start-task':
                      self.setStateAndTime('end-task', 7000);
                      break;
                  case 'end-task':
                      self.setStateAndTime('reset', 100);
                      break;
                  case 'reset':
                      socket.emit('resetViews', self.currentPlayers)
                      self.reset();
                      self.setStateAndTime('title', 1000);
                      break;
                }
                //self.state = self.gameStates[self.gameStateIndex % 5];
                //self.gameStateIndex++;
                //gameProjection.getNewTask();
           }
      },
      draw:function(){
          var self = gameProjection;
          requestAnimationFrame(self.draw);
          switch (self.state) {
            case 'title':
                console.log('title');
                self.checkTimer();
                //slideDownPanel($('.page.sign-up .close'));
                break;
            case 'highscores-players':
                console.log('highscores-players');
                self.checkTimer();
                break;
            case 'highscores-teams':
                console.log('highscore team');
                self.checkTimer();
                break;
            case 'get-number-of-connections-task-players':
                console.log('get-number-of-connections-task-players');
                self.checkTimer();
                break;
            case 'setup-game':
                console.log('get-players');
                self.checkTimer();
                break;
            case 'invite-to-performance-area':
                console.log('invite-to-performance-area');
                self.checkTimer();
                break;
            case 'we-need-more-players':
                console.log('we-need-more-players');
                self.checkTimer();
                break;
            case 'prep-for-task':
                console.log('prep for task');
                self.writePrepTimeToScreen();
                self.checkTimer();
                break;
            case 'start-task':
                // time to get ready
                console.log('start task');
                self.checkTimer();
                break;
            case 'end-task':
                console.log('end task');
                self.checkTimer();
                break;
            case 'reset':
                console.log('reset task');
                self.checkTimer();
                break;
          }


     },
    //  getNewTask:function(){
    //       var currentTask = allTasks[getRandomInt(0,3)];
    //       this.wait = currentTask.time;
    //       $('.currentTask').html(currentTask.task);
    //       socket.emit('newGame', 'newGame')
    //
    //  },
    //  getPriorityUsers:function(numberUsers,callback){
    //    socket.emit('getPriorityUsers', numberUsers, callback )
    //  }
    checkIfNumberOfConnectionsIsEmptyAndGet:function(){
      var self = gameProjection;
      if (self.requestedNumberOfConnections == false){
        self.requestedNumberOfConnections = true;
        self.checkNumberOfConnections();
      }
    },
    checkNumberOfConnections:function(){
      socket.emit('getNumberOfUsers', GAME_LOCATION, function(numberOfConnections) { //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.
        console.log(numberOfConnections);
        gameProjection.currentNumberOfConnections = numberOfConnections.length;
      }); // close getNewAndNotifyUsers
    },
    checkIfPlayersIsEmptyAndGet:function(){
      var self = gameProjection;
      if (self.requestedCurrentPlayers == false && self.currentTask != null){
        self.requestedCurrentPlayers = true;
        self.getPlayers();
      }
    },
    getPlayers:function(){
      gameProjection.currentTask.location = GAME_LOCATION;
      socket.emit('getNewAndNotifyUsers', gameProjection.currentTask, function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.
        console.log(chosenPlayers);
        gameProjection.currentPlayers = chosenPlayers;
      }); // close getNewAndNotifyUsers
    },
    checkIfTaskIsEmptyAndGet:function(){
      var self = gameProjection;
      if (self.requestedTask == false && self.currentNumberOfConnections != null){
        self.requestedTask = true;
        self.getTask();
      }
    },
    getTask:function(){
      var numberOfPlayers = gameProjection.currentNumberOfConnections;
      var searchResults = null;
      if(gameProjection.currentNumberOfConnections < 2){
        // This need to be changed not to grab specific number of connections but only task that have a minimum number of connections
        searchResults = [];
      } else {
        searchResults = search(allTasks, gameProjection.currentNumberOfConnections,'players')
        //searchResults = allTasks[getRandomInt(0,allTasks.length)];
      }
      console.log(searchResults);
      gameProjection.currentTask = searchResults[getRandomInt(0,searchResults.length)];
    },
    writeTaskToScreen:function(){
      var task = gameProjection.currentTask.task;
      $('.currentTask').html(task);
    },
    writePrepTimeToScreen:function(){
      var self = this;
      self.prepCounter++;
      var prepTime = Math.floor(self.prepTime/1000 - (self.prepCounter/60));
      $('.prep-time').html(prepTime);
    },
    convertSpreadsheetToTasksObject:function(json){
        //https://stackoverflow.com/questions/30082277/accessing-a-new-style-public-google-sheet-as-json
        console.log('parsing Google Spreadsheet');
        console.log(json);

        for (var i = 0; i < json.feed.entry.length; i++) {
          //  This is console.log for the each row in the spreadsheet
          //  console.log( json.feed.entry[i]);
          var task = json.feed.entry[i].gsx$prompt.$t;
          var timePrep =  5000;//json.feed.entry[i].gsx$bio.$t;
          var timePlay =  30000;//json.feed.entry[i].gsx$bio.$t;
          var time = 10000;//json.feed.entry[i].gsx$bio.$t;
          var players = json.feed.entry[i].gsx$numberofplayers.$t;

          Object
          var tempObject = {
            task: task,
            timePrep: timePrep,
            timePlay: timePlay,
<<<<<<< HEAD
            time: time,
            players: players
=======
            players: players,
            time:time
>>>>>>> origin/master
          }

          // Make a newly formatted Master List/Array
          // of all of the projects
          allTasks.push(tempObject);

        //marker.setVisible(true);
        }
        console.log('parsed Google Spreadsheet');


    },
    scorePoints:function(){
      socket.emit('scoreAndSavePoints', gameProjection.currentTask , function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.
        gameProjection.currentPlayers = chosenPlayers;
      }); // close getNewAndNotifyUsers
    },
    // newGame:function(){
    //     // if(new Date().getTime() - time >= this.wait){
    //        console.log("tick");//if it is, do something
    //
    //        var currentTask = gameProjection.currentTask;
    //        currentTask.location = GAME_LOCATION // attach the location of this game projection to each current task, we could do this in the json on each task too, but this might prevent us from easily re-using prompts at the commons/uniondepot endcaps.
    //
    //
    //        console.log('currentTask',currentTask);
    //        //  socket.emit('startNewGame', 'newGame') //reset all users mobile views && push to the database
    //        socket.emit('getNewAndNotifyUsers', currentTask , function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.
    //
    //
    //         //check to change the screen to wait for more players if there are less than 2.
    //         //if(chosenPlayers.length < 2) {
    //         //  //$('.currentTask').html('Waiting for more players to join...')
    //         //  //gameProjection.setStateAndTime('we-need-more-players', gameProjection.wait)
    //         //  return;
    //         //}
    //
    //         //if(chosenPlayers.length < currentTask.players){
    //         //    gameProjection.newGame()
    //         //}
    //
    //          //console.log('chosenPlayers',chosenPlayers)
    //
    //          //var userlist = ""
    //          //chosenPlayers.forEach(function(player){
    //          //  $('.people ul').append('<li>'+player.userObject.userName+'<img src="assets/images/avatars/avatar_4.png"></li>');
    //          //})
    //
    //          //$('.currentTask').html(
    //          //  currentTask.task
    //          //  + '<br>'
    //          //  + userlist
    //          //)
    //
    //           //time = new Date().getTime();//also update the stored time
    //           //this.wait = currentTask.time;
    //
    //        }) // close getNewAndNotifyUsers
    //
    // }
}


/*******************
     Setup
********************/
$(document).ready(function(){ //somethimes this fires twice for whatever reason...
  console.log('load');
  gameProjection.init();
  gameProjection.draw()
});


$(document).click(function(){ //somethimes this fires twice for whatever reason...
  //gameProjection.newGame()
})
/*******************
     Draw
********************/

