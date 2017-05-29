/**
 * Represents a search trough an array.
 * @function search
 * @param {Array} array - The array you wanna search trough
 * @param {string} key - The key to search for
 * @param {string} [prop] - The property name to find it in
 */


var searchResults;


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
var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!
// var socket = io('http://162.243.214.28:3000'); //MAKE SSURE TO CHANGE THIS TO LOCALHOST FOR LOCAL DEV!

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
     TimePrepForTask: 15000,
     TimeStartTask: 30000,
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

              //reset state on page refresh / re-connect of game-projection
              socket.emit('resetRoomClients', GAME_LOCATION);
              socket.emit('getAllUsers',GAME_LOCATION, function(users){
                setTimeout(function(){
                  users.forEach(function(user){
                    var a = new avatar('assets/images/avatars/'+user.userObject.avatar+'', user.id, random(0,width), random(0,height))
                    avatars.push(a)
                  })
                },2000);
              })
          });

          gameProjection.parseTitleUrlParamater();
          //socket.on('disconnect', function(){
          //     console.log('disconnected from the server as: ' + socket.id);
          //});

          socket.on('addAvatar',function(user){
            console.log('addAvatar',user);
            var a = new avatar('assets/images/avatars/'+user.userObject.avatar+'', user.id, random(0,width), random(0,height))
            avatars.push(a)
          })
          socket.on('removeAvatar',function(user){
            console.log('removeAvatar',user);

            for (var i = 0; i < avatars.length; i++) {

               if(avatars[i].id == user.id){
                 avatars[i].state = 'avatarIsShrinking';
                 avatars[i].startTime = performance.now();
                 avatars[i].endTime = avatars[i].startTime + duration2;
                 soundReverse.playbackRate = random(.8,1.5);
                 soundReverse.play();
               }
            }

          })

     },
     parseTitleUrlParamater:function(){
      var title = $('.location-title').text();
      var titleElement = $('.location-title')

      switch (title) {
        case 'commons':
            titleElement.html('Commons');
            break;
        case 'westbank':
            titleElement.html('Westbank');
            break;
        case 'littleafrica':
            titleElement.html('Little Africa');
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
                      // self.refreshConnectedBackgroundAvatars();
                      break;
                  case 'highscores-players':
                      self.setStateAndTime('highscores-teams', self.TimeHighscoresTeams);
                      self.writeTeamScoresToScreen()
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
      socket.emit('getAllUsers', GAME_LOCATION, function(numberOfConnections) {
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
      searchResults = null;
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
    writeHighScoresToScreen:function(){
      socket.emit('getHighScoreUsers',function(results){
        console.log('highScores',results);
        var appendData = ''
        results.forEach(function(result){
          appendData += '<p> <img style="height:70px" src="assets/images/avatars/'+ result.avatar +'">' + result.userName + ' &#8212; ' + result.score + '</p>';
        })
        // console.log(appendData);
        $('.scoreBoard').html(appendData)
      })
    },
    writeTeamScoresToScreen:function(){
      socket.emit('getTeamScores',function(results){
        // console.log(results);

        results.sort(function(a, b) {
            return b.score - a.score
        })
        // console.log('😬',results);

        var appendData = ''
        results.forEach(function(result){
          var teamString =''
          if(result.team == 1){
           teamString = '<p> <img style="height:70px" src="assets/images/teamicons/1.png"> Team 1 (Earth) &#8212; '
          }else if(result.team == 2){
            teamString = '<p> <img style="height:70px" src="assets/images/teamicons/2.png"> Team 2 (Water) &#8212; '
          }else if(result.team == 3){
            teamString = '<p> <img style="height:70px" src="assets/images/teamicons/3.png"> Team 3 (Wind) &#8212; '
          }else if(result.team == 4){
            teamString = '<p> <img style="height:70px" src="assets/images/teamicons/4.png"> Team 4 (Fire) &#8212; '
          }

          appendData += teamString + result.score + '</p>'
        })

        $('.teamScoreBoard').html(appendData)

      })
    },
    // refreshConnectedBackgroundAvatars:function(){
    //   socket.emit('getAllUsers', GAME_LOCATION, function(connectedUsers) {
    //     console.log('gau',connectedUsers);
    //     compiledAvatars = ''
    //     connectedUsers.forEach(function(user){
    //       //compiledAvatars+= '<img src="assets/images/avatars/'+  +'">'
    //         var id = user.userObject.id;
    //         if(avatars.filter(function(e) { return e.id == id }).length > 0){
    //           // Do nothing
    //         } else {
    //           var a = new avatar('assets/images/avatars/'+user.userObject.avatar+'',user.userObject.id, random(0,width),random(0,height),  )
    //           avatars.push(a)
    //         }
    //     })
    //     //$('.tempAvatarStorage').html(compiledAvatars)
    //   }); // close getNewAndNotifyUsers
    // },
    convertSpreadsheetToTasksObject:function(json){
        //https://stackoverflow.com/questions/30082277/accessing-a-new-style-public-google-sheet-as-json
        console.log('parsing Google Spreadsheet');
        //console.log(json);

        for (var i = 0; i < json.feed.entry.length; i++) {
          //  This is console.log for the each row in the spreadsheet
          //console.log( json.feed.entry[i]);
          var task = json.feed.entry[i].gsx$prompt.$t;
          var timePrep =  5000;//json.feed.entry[i].gsx$bio.$t;
          var timePlay =  30000;//json.feed.entry[i].gsx$bio.$t;
          var players = json.feed.entry[i].gsx$highplayers.$t;
          var playersMax = json.feed.entry[i].gsx$highplayers.$t;


          //var time;//10000;//json.feed.entry[i].gsx$bio.$t;
          // if(json.feed.entry[i].gsx$time.$t == ''){
          //  time = '2';
          //} else {
          //  playersMin = json.feed.entry[i].gsx$time.$t;
          //}


          var playersMin;
          if(json.feed.entry[i].gsx$lowplayers.$t == ''){
            playersMin = '2';
          } else {
            playersMin = json.feed.entry[i].gsx$lowplayers.$t;
          }

          console.log(playersMin);

          //Object
          var tempObject = {
            task: task.replace(/^\s+|\s+$/g, ""),
            timePrep: timePrep,
            timePlay: timePlay,
            time: timePlay.replace(/^\s+|\s+$/g, ""),
            players: players.replace(/^\s+|\s+$/g, ""),
            playersMin: playersMin.replace(/^\s+|\s+$/g, ""),
            playersMax: playersMax.replace(/^\s+|\s+$/g, "")

          }

          // Make a newly formatted Master List/Array
          // of all of the projects
          allTasks.push(tempObject);

        //marker.setVisible(true);
        }
        console.log('parsed Google Spreadsheet');


    }
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













/*******************
  ANIMATED BACKGROUND
********************/
var avatars = []
// var count = 0
// var cell = 200
// var numAvatars = 30
// var positions = []
var sound;
var soundReverse;
function preload(){
}

function setup() {
  sound = loadSound('assets/audio/pop.mp3');
  soundReverse = loadSound('assets/audio/popReverse.mp3');

  createCanvas(windowWidth,windowHeight)
  for (var i = 0; i < 30; i++) {
    // var a = loadImage('avatars/'+ Math.ceil(Math.random()*294)+'.png')

  }

}

function draw() {
  background(255)


  avatars.sort(function(a, b) {
    return (a.y-a.avatarHeight) - (b.y-a.avatarHeight)
  })

  for (var i = 0; i < avatars.length; i++) {
    avatars[i].display();
    if(avatars[i].readyRemove == true){avatars.splice(i, 1); }
  }







  // noLoop();

  // if(count >= numAvatars) return;

  // for (var x = cell/5; x < width-cell; x+= cell ) {
  //   for (var y = cell/5; y < height - cell; y+= cell) {
  //
  //     if(Math.random() > 0.5){
  //       count++
  //       console.log(count);
  //       image(avatars[count], x,y,cell*0.75,cell*0.75)
  //     }
  //
  //
  //   }
  // }


  // for (var i = 0; i < numAvatars; i++) {
  //   pos = {}
  //
  //   pos.x = random(0,width - numAvatars*6)
  //   pos.y = random(0, height - numAvatars*6)
  //
  //   positions.push(pos)
  // }
  //
  // positions.sort(function(a, b) {
  //   return a.y - b.y
  // })
  //
  // for (var i = 0; i < numAvatars ; i++) {
  //   image(avatars[i],positions[i].x,positions[i].y, numAvatars*6,numAvatars*6)
  // }


}

function perlin() {
  let i = 0;
  let n = random(100);
  return ()=>{
    n += 0.0004;

    //i = (i + 1) % 2;

    let noiseT = i + n;
    //noiseT = noiseT % 1.0;
    var ret = noise(noiseT); //(0,1)
    //ret = (ret - .5) * 2; //(-1,1)
    //console.log(ret)
    return ret;
  }
}
function easeOutBounce(t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
}

function easeInOutElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      b;
    } else if ((t /= d / 2) === 2) {
      b + c;
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    if (t < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    } else {
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
  }


  function easeInElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      b;
    } else if ((t /= d) === 1) {
      b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  }
var startTime
var duration = 300; // animate over 1000ms
var duration2 = 700; // animate over 1000ms

var totChange = .99; // change the size by 25%


function avatar(path,id,x,y){
  this.id = id;
  this.x = x
  this.y = y
  this.previousX = 0;
  this.previousY = 0;
  this.random = perlin()
  this.yRandom = perlin()
  this.image = loadImage(path)
  this.speed = random(0,6)
  this.waitTime = random(4,10)
  this.counter = 0;
  this.state = 'avatarIsGrowing';
  this.avatarWidth = -2;
  this.avatarHeight = 0;
  this.startTime = performance.now();
  this.endTime = this.startTime + duration;
  this.rotate = 0;
  this.angle = 0;
  this.angleCounter = 0;
  this.currentValue = 0;
  this.readyRemove = false;

  sound.playbackRate = random(.8,1.5);
  sound.play();

  this.avatarGrow = function(){
    if (this.time >= this.endTime)
    {
      this.state = 'normal';
    }

    var elapsed =  this.time - this.startTime;
    var value = easeOutBounce(elapsed, .001, totChange, duration);

    if(value > .99){ value = 0.99; } // This is required from keep the tween from increasing too far
    this.currentValue =value; // this is needed to reverse the tween.

    this.avatarWidth = (this.image.width) * value/2;
    this.avatarHeight = (this.image.height) * value/2;//
  },
  this.avatarShrink = function(){
    if (this.time >= this.endTime)
    {
      this.state = 'normal';
      this.readyRemove = true;
    }

    var elapsed =  this.time - this.startTime;
    var value = easeInOutElastic(elapsed, this.currentValue, -this.currentValue, duration2);

    if(value < 0){ value = 0.000001; } // This is required from keep the tween from reversing too far

    this.avatarWidth = (this.image.width) * (value/2);
    this.avatarHeight = (this.image.height) * (value/2);//
  },
  this.calculateSpeed = function(){
      this.speed = abs(this.x - this.previousX) + abs(this.y - this.previousY);
      //speed = speed;
      //console.log(speed);
      this.previousX = this.x;
      this.previousY = this.y;
  },
  this.display = function(){

    this.time = performance.now();

    this.x = constrain( map(this.random(),0,1, -.5,1.5) * width, 0 - this.avatarWidth, width + this.avatarWidth ) ;//constrain(this.x + this.random()*4, 0, width - (this.image.width/2));
    this.y = constrain( map(this.yRandom(), 0, 1, -.5, 1.5) * height, 0 - this.avatarHeight , height + this.avatarHeight );//constrain(this.y + this.random()*4, 0, height - (this.image.height/2));

    if(this.image.width != 1){ // this necessary until the image is loaded

      switch(this.state) {
        case 'avatarIsGrowing':
          this.avatarGrow();
          break;
        case 'avatarIsShrinking':
          this.avatarShrink();
          break;
      }

      this.calculateSpeed();

      var angle = sin(this.angleCounter * 2 * PI); //-1, 1
      angle =  round(angle * 1) / 1; // snap
      angle *= .75;

      var bounceOffset = sin((this.angleCounter + .25) * 2 * 2 * PI);
      //bounceOffset =  round(bounceOffset * 1) / 1; // snap
      bounceOffset *= 1.75;

      push();
      translate(this.x,this.y + bounceOffset);
      rotate(radians(angle));
      image(this.image,0-(this.avatarWidth/2),0-(this.avatarHeight),this.avatarWidth,this.avatarHeight);
      pop();


      var dT = (1/30.0); //delta time
      //console.log(speed);
      var animSpeed = map(this.speed, 0, 1, .6, .75);
      this.angleCounter = (this.angleCounter + dT * animSpeed);



    }
  }
}

function lerp(t, minn, maxx)
{
  return(t, 0, 1, minn, maxx);
}

function mousePressed() {
    //var a = new avatar('avatars/'+ Math.ceil(Math.random()*294)+'.png', random(0,width),random(0,height) )
    //avatars.push(a)
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
     for (var i = 0; i < avatars.length; i++) {

        if(avatars[i].id == 'aaa'){
          avatars[i].state = 'avatarIsShrinking';
          avatars[i].startTime = performance.now();
          avatars[i].endTime = avatars[i].startTime + duration2;
          soundReverse.playbackRate = random(.8,1.5);
          soundReverse.play();
      }
        }
  }
}
