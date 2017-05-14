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
        // console.log(array[i][prop]);
        if (array[i][prop] <= key) {
            tempArray.push(array[i]);
        } else if(array[i][prop] == 'all'){
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
var socket = io('http://162.243.214.28:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

//reload the view when the app boots up & this page connects
socket.on('reload',function(){
  location.reload();
  console.log('~+~+~+~ RELOADED PAGE');
})

// var time;

// const GAME_LOCATION = 'location1' ///////////IMPORTANT ***** SET GAME LOCATION IN game-projection.hbs

/**********************
Helper Functions
**********************/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}



var gameProjection = {
     bodyElement: $('body'),
     currentNumberOfConnections:null,
     requestedNumberOfConnections: false,
     currentPlayers:null,
     requestedCurrentPlayers: false,
     currentTask:null,
     requestedTask: false,
     prepFrameCounter:0,
     taskFrameCounter:0,
     numberOfTimesGetDataHasRun: 0,
     wait:5000,
     state:'title',
     gameStateIndex:0,

     // Time Variables
     TimeTitle: 5000,
     TimeHighscoresPlayers:5000,
     TimeHighscoresTeams:5000,
     TimeGetNumberOfConnectionsTaskPlayers:500,
     TimeSetupGame:500,
     TimeInviteToPerformanceArea: 5000,
     TimeWeNeedMorePlayers: 5000,
     TimePrepForTask: 30000,
     TimeStartTask: 60000,
     TimeEndTask: 7000,
     TimeEndScore: 7000,
     TimeReset: 250,

     //gameStates:['highscore players','highscore team','teaser','get players','get task','start task'],
     init: function(){
          time = new Date().getTime();//store the current time
          // this.getNewTask();
          // this.newGame()

          socket.on('connect', function(){
              console.log('connected to the server as: ' + socket.id);
          });

          gameProjection.parseTitleUrlParamater();
          //socket.on('disconnect', function(){
          //     console.log('disconnected from the server as: ' + socket.id);
          //});

     },
     parseTitleUrlParamater:function(){
      var title = $('.location-title').text();
      var titleElement = $('.location-title')

      switch (title) {
        case 'commons':
            //titleElement.html('Commons');
            titleElement.html('Gallery 1');

            break;
        case 'westbank':
            //titleElement.html('Westbank');
            titleElement.html('Gallery 2');
            break;
        case 'littleafrica':
            //titleElement.html('Little Africa');
            titleElement.html('Gallery 3');
            break;
        case 'rondo':
            titleElement.html('Rondo');
            break;
        case 'littlemekong':
            titleElement.html('Little Mekong');
            break;
        case 'lowertown':
            titleElement.html('Lowertown');
            break;
      }
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
      if($('body').hasClass('warning')){
        $('body').removeClass('warning');
      }
      self.state = state;
      self.wait = waitTime
     },
     removeBodyClassForAnimatedBackground:function(){
      var self = this;
      if(self.bodyElement.hasClass('warning')){
        self.bodyElement.removeClass('warning');
      }
     },
     animateBackgroundForLowTime:function(){
      var self = this;
      var prepTime = Math.floor(self.TimePrepForTask/1000 - (self.prepFrameCounter/60));
      var taskTime = Math.floor(self.TimeStartTask/1000 - (self.taskFrameCounter/60));

      if(taskTime < 10 && self.state == 'start-task'){
        self.bodyElement.addClass('warning');
      } else if(prepTime < 10 && self.state == 'prep-for-task'){
        self.bodyElement.addClass('warning');
      }
     },
     reset:function(){
      var self = this;
      self.currentNumberOfConnections = null;
      self.requestedNumberOfConnections = false;
      self.currentPlayers = null;
      self.requestedCurrentPlayers = false;
      self.currentTask = null;
      self.requestedTask = false;

      self.prepFrameCounter = 0;
      self.taskFrameCounter = 0;

      self.numberOfTimesGetDataHasRun = 0;
     },

      checkTimer:function(){
           var self = this;
           if(new Date().getTime())
           if(new Date().getTime() - time >= self.wait){
                console.log("tick2");//if it is, do something
                time = new Date().getTime();//also update the stored time
                switch (self.state) {
                  case 'title':
                      self.setStateAndTime('highscores-players', self.TimeHighscoresPlayers);
                      self.writeHighScoresToScreen();
                      break;
                  case 'highscores-players':
                      self.setStateAndTime('highscores-teams', self.TimeHighscoresTeams);
                      break;
                  case 'highscores-teams':
                      self.setStateAndTime('get-number-of-connections-task-players', self.TimeGetNumberOfConnectionsTaskPlayers);
                      break;
                  case 'get-number-of-connections-task-players':
                      self.checkIfNumberOfConnectionsIsEmptyAndGet();
                      self.checkIfTaskIsEmptyAndGet();
                      self.checkIfPlayersIsEmptyAndGet();
                      if(self.currentNumberOfConnections != null && self.currentTask != null && self.currentPlayers != null && allTasks.length > 0){
                        self.setStateAndTime('setup-game', self.TimeSetupGame);
                      } else if(self.currentNumberOfConnections <= 1 && self.currentTask != null && self.currentPlayers <= 1 && allTasks.length > 0){
                        self.setStateAndTime('title', self.TimeTitle);
                      } else if(self.numberOfTimesGetDataHasRun > 15) {
                        self.setStateAndTime('title', self.TimeTitle);
                        self.reset();
                        self.numberOfTimesGetDataHasRun = 0; // Maybe this should be self.reset();
                      } else {
                        self.setStateAndTime('get-number-of-connections-task-players', 100);
                        self.numberOfTimesGetDataHasRun++;
                      }
                      break;
                  case 'setup-game':
                      // self.newGame();
                      self.writeTaskToScreen();
                      $('#sound-ding')[0].play();
                      self.setStateAndTime('invite-to-performance-area', self.TimeInviteToPerformanceArea);
                      break;
                  case 'invite-to-performance-area':
                      //check to change the screen to wait for more players if there are less than 2.
                      if(self.currentNumberOfConnections < 2) {
                        self.setStateAndTime('we-need-more-players', self.TimeWeNeedMorePlayers);
                      } else {
                        self.setStateAndTime('prep-for-task', self.TimePrepForTask);
                        $('#sound-jingle')[0].play();
                      }
                      //var interval = 0;
                      //self.setStateAndTime('get-players', self.wait);
                      //$('.page .people ul li').each(function(){
                      //  interval = interval + 2000;
                      //  $(this).delay(interval).animate({opacity:1});
                      //});
                      break;
                  case 'we-need-more-players':
                      self.setStateAndTime('get-number-of-connections-task-players', self.TimeGetNumberOfConnectionsTaskPlayers);
                      break;
                  case 'prep-for-task':
                      // time to get ready
                      console.log(gameProjection.currentPlayers)
                      self.setStateAndTime('start-task',  self.TimeStartTask);
                      self.removeBodyClassForAnimatedBackground();
                      $('#sound-ding')[0].play();
                      //self.setStateAndTime('start-task',  gameProjection.currentTask.time);
                      break;
                  case 'start-task':
                      self.setStateAndTime('end-task', self.TimeEndTask);
                      self.removeBodyClassForAnimatedBackground();
                      $('#sound-cheers')[0].play();
                      break;
                  case 'end-task':
                      self.setStateAndTime('end-score', self.TimeEndScore);
                      break;
                  case 'end-score':
                      self.setStateAndTime('reset', self.TimeReset);
                      break;
                  case 'reset':
                      socket.emit('resetViews', self.currentPlayers)
                      self.reset();
                      self.setStateAndTime('title', self.TimeTitle);
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
                self.animateBackgroundForLowTime();
                self.checkTimer();
                break;
            case 'start-task':
                // time to get ready
                console.log('start task');
                self.writeTaskTimeToScreen();
                self.animateBackgroundForLowTime();
                self.checkTimer();
                break;
            case 'end-task':
                console.log('end task');
                self.checkTimer();
                break;
            case 'end-score':
                console.log('end score');
                self.checkTimer();
                break;
            case 'reset':
                console.log('reset task');
                self.checkTimer();
                break;
          }


     },

    checkIfNumberOfConnectionsIsEmptyAndGet:function(){
      var self = gameProjection;
      if (self.requestedNumberOfConnections == false){
        self.requestedNumberOfConnections = true;
        self.checkNumberOfConnections();
      }
    },
    checkNumberOfConnections:function(){
      socket.emit('getNumberOfUsers', GAME_LOCATION, function(numberOfConnections) {
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
      socket.emit('getNewAndNotifyUsers', gameProjection.currentTask, function(chosenPlayers){
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
      // console.log(ameProjection.currentTask.time);
      gameProjection.currentTask = searchResults[getRandomInt(0,searchResults.length)];
      gameProjection.TimeStartTask = parseInt(gameProjection.currentTask.time);
    },
    writeTaskToScreen:function(){
      var task = gameProjection.currentTask.task;
      $('.currentTask').html(task);
    },
    writePrepTimeToScreen:function(){
      var self = this;
      self.prepFrameCounter++;
      var prepTime = Math.floor(self.TimePrepForTask/1000 - (self.prepFrameCounter/60));
      $('.prep-time').html(prepTime);
    },
    writeTaskTimeToScreen:function(){
      var self = this;
      self.taskFrameCounter++;
      var taskTime = Math.floor(self.TimeStartTask/1000 - (self.taskFrameCounter/60));
      $('.task-time').html(taskTime);
    },
    setupDebugTimes:function(){
        var self = this;
        self.TimeTitle = 1000;
        self.TimeHighscoresPlayers = 1000;
        self.TimeHighscoresTeams = 1000;
        self.TimeGetNumberOfConnectionsTaskPlayers = 500;
        self.TimeSetupGame = 500;
        self.TimeInviteToPerformanceArea = 3000;
        self.TimeWeNeedMorePlayers = 3000;
        self.TimePrepForTask = 3000;
        self.TimeStartTask = 5000;
        self.TimeEndTask = 1000;
        self.TimeEndScore = 1000;
        self.TimeReset = 250;
    },
    writeHighScoresToScreen:function(number){
      socket.emit('getHighScoreUsers',function(results){
        // console.log('highScores',results);
        var appendData = ''
        results.forEach(function(result){
          appendData += '<p>' + result.userName + ' --- ' + result.score + '</p>';
        })
        // console.log(appendData);
        $('.scoreBoard').html(appendData)
      })
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
          var time = json.feed.entry[i].gsx$time.$t//10000;//json.feed.entry[i].gsx$bio.$t;
          var players = json.feed.entry[i].gsx$numberofplayers.$t;

          Object
          var tempObject = {
            task: task.replace(/^\s+|\s+$/g, ""),
            timePrep: timePrep,
            timePlay: timePlay,
            time: time.replace(/^\s+|\s+$/g, ""),
            players: players.replace(/^\s+|\s+$/g, "")

          }

          // Make a newly formatted Master List/Array
          // of all of the projects
          allTasks.push(tempObject);

        //marker.setVisible(true);
        }
        console.log('parsed Google Spreadsheet');


    },
    scorePoints:function(){
      //not implemented yet
      socket.emit('scorePoints', {} );
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
  //gameProjection.setupDebugTimes();
  gameProjection.draw()
});
