//http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients/24145381
// https://stackoverflow.com/questions/13745519/send-custom-data-along-with-handshakedata-in-socket-io
// http://www.psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/

////////////////////////////
// Fake User Data in Local Storage
///////////////////////////


// function rand(max) {
//   min = Math.ceil(1);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min;
// }

//var userNames = ['Ben', 'TylerStefanich', 'Sara']
//var emails = ['ben@benmoren.com', 'tyler@tylerstefanich.com', 'sara@sara.com']
//var chooser = Math.floor(Math.random()*3);
//
//var fakeData = {
//  userName: userNames[chooser],
//  email: emails[chooser],
//  avatar: '69.svg', // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
//  team: 1,
//  score: 0,
//  locationsVisited: ['River','Target'], // location + timespent
//};

//store.set('user', fakeData);


//////////////////////////
// End Fake User Data
/////////////////////////
function resizeTextBox(){
      console.log('window loaded');
      var newHeight = $(window).height();
      console.log(newHeight)
      newHeight = newHeight - 50 ;
      console.log(newHeight + 'nav');

      newHeight = newHeight - $('.page .container .imageContainer img').height() ;
    //  console.log(newHeight + 'image');
      // Intro Slide show & Signup
      newHeight = newHeight - 15 ;

      $('.bottomHalf').css('height', newHeight+'px' );

}

$(window).load(function(){
 resizeTextBox();
});

$(window).resize(function(event) {
 resizeTextBox();
});


//prevent uses phone from sleeping.
// var noSleep = new NoSleep();
// noSleep.enable();
var vibrateInterval;

// Starts vibration at passed in level
function startVibrate(duration) {
    navigator.vibrate(duration);
}



// var socket = io('https://joincollectiveaction.com:3000', { secure : true}); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

var socket = io('http://localhost:3000');

function currentUserInfo() {
    var ui = {
        userObject: store.get('user'),
        room: GAME_LOCATION //*******IMPORTANT****** //set in the game-client.hbs
    }
    return ui;
}

function updateWaitTime(resetToggle){
  var getUser = store.get('user')
  if(resetToggle == 'reset' || getUser.totalLocalWaitTime == undefined){
    getUser.totalLocalWaitTime = 0; //reset to 0
  }else{
    getUser.totalLocalWaitTime += (Date.now() - getUser.connectionTime)
  }
  getUser.connectionTime = Date.now(); // always reset this time so its fair for everyone...
  console.log('getUser',getUser);
  store.set('user', getUser)

  socket.emit('updateUser', currentUserInfo()) //send updated userinfo to the server to store on the socket object

}

//reload the view when the app boots up & this page connects
socket.on('reload', function() {
    location.reload();
    console.log('~+~+~+~ RELOADED PAGE');
})

socket.on('connect', function() {
  //  console.log(socket);

    console.log('connected to the server as: ' + socket.id);
    socket.emit('updateUser', currentUserInfo())
    socket.emit('addAvatarClient', currentUserInfo())

    var getUser = store.get('user');

    getUser.connectionTime = Date.now();

    check = getUser.locationsVisited.map(function(e) { return e.location; }).indexOf(GAME_LOCATION);
    //getUser.locationsVisited.indexOf(GAME_LOCATION) // use this if we dont want to record connection time
    if(check == -1){ //we havnt been here yet
      var locObj = {
        location:GAME_LOCATION,
        time: Date.now()
      }
      getUser.locationsVisited.push(locObj)
      socket.emit('updateLocationsVisited',getUser) //database call

    }
    console.log('getUser prestore', getUser);
    store.set('user', getUser)


    //resetViews
    $('.page').removeClass('my-turn');
    $('.prompt').html('')

});

socket.on('reconnect', function() {
    socket.emit('updateUser', currentUserInfo())
    $('.page').removeClass('my-turn');
    $('.page').css('background-image','url(assets/images/client/newGame.png)')
    $('.prompt').html('')

})


socket.on('newGame', function() {
    updateWaitTime();
    // $('.waitingNext').html('')
    console.log('~~~~~~NEWGAME!');
    window.parent.document.title = GAME_LOCATION + '🚫' + socket.id
    $('.page').removeClass('my-turn');
    $('.page').css('background-image','url(assets/images/client/newGame.png)')
    $('.prompt').html('')
})

socket.on('myTurn', function(taskToPlay) {
    updateWaitTime('reset');
    $('.page').addClass('my-turn');
    //Add Points to the client side user object.
    var getUser = store.get('user');
        // console.log('getUser1', getUser);
        getUser.score++

        //for tracking over the night
        getUser.tracking = {
          location: GAME_LOCATION,
          time: Date.now(),
          // lat:,
          // lon:
        }
        // console.log('getUser2', getUser);
        socket.emit('scorePoints', getUser)
      store.set('user', getUser)

    // $('.waitingNext').html( taskToPlay )
    window.parent.document.title = GAME_LOCATION + '✅' + socket.id
    // $('.page').css('background-color','green')

    if(taskToPlay.players == 'all'){
      $('.page.queue .container img').attr('src','assets/images/client/everyone-small.png')
    }else{
      $('.page.queue .container img').attr('src','assets/images/client/myTurn-small.png')
    }

    $('.prompt').html( taskToPlay.task )
    $('.bottomHalf').textfill({maxFontPixels:24});

    // trigger sound notification
    //  $('.myTurnAudio').get(0).play()
});

// function tempMyTurn(){
//
//   updateWaitTime('reset');
//   $('.page').addClass('my-turn');
//
//  var taskToPlay = {};
// taskToPlay.players = 'all';
//   // $('.waitingNext').html( taskToPlay )
//   window.parent.document.title = GAME_LOCATION + '✅' + socket.id
//   // $('.page').css('background-color','green')
//
//   if(taskToPlay.players == 'all'){
//     $('.page.queue .container img').attr('src','assets/images/client/everyone-small.png')
//   }else{
//     $('.page.queue .container img').attr('src','assets/images/client/myTurn.png')
//   }
//
//   // $('.bottomHalf span').html( taskToPlay.task )
//   // $('.prompt').html( 'Baby humpback whales whisper to their mothers to stay safe from listening predators, but human noise pollution makes it hard for the mothers to hear them. Choose to be a baby whale, a mother whale, or a predator swimming about. Can you hear eachother?')
//   $('.prompt').html( 'You are tadpoles hatching from eggs. Swim fast to the shore, then grow legs and hop onto the land!')
//
//   $('.bottomHalf').textfill({maxFontPixels:24});
//
//   // trigger sound notification
//   //  $('.myTurnAudio').get(0).play()
//
//
// }
//
// setTimeout(function(){
//   tempMyTurn();
// },1000)

socket.on('disconnect', function() {
    console.log('disconnected from the server as: ' + socket.id);

});
