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

var userNames = ['Ben', 'TylerStefanich', 'Sara']
var emails = ['ben@benmoren.com', 'tyler@tylerstefanich.com', 'sara@sara.com']
var chooser = Math.floor(Math.random()*3);

var fakeData = {
  userName: userNames[chooser],
  email: emails[chooser],
  avatar: '69.svg', // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
  team: 1,
  score: 0,
  locationsVisited: ['River','Target'], // location + timespent
};

store.set('user', fakeData)


//////////////////////////
// End Fake User Data
/////////////////////////

//prevent uses phone from sleeping.
// var noSleep = new NoSleep();
// noSleep.enable();

var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

function currentUserInfo() {
    var ui = {
        userObject: store.get('user'),
        room: GAME_LOCATION //*******IMPORTANT****** //set in the game-client.hbs
    }
    return ui;
}

//reload the view when the app boots up & this page connects
socket.on('reload', function() {
    location.reload();
    console.log('~+~+~+~ RELOADED PAGE');
})

socket.on('connect', function() {
    console.log('connected to the server as: ' + socket.id);
    //  console.log(socket);

    socket.emit('updateUser', currentUserInfo())
});

socket.on('reconnect', function() {
    socket.emit('updateUser', currentUserInfo())
})

socket.on('newGame', function() {
    // $('.waitingNext').html('')
    //upload user local storage to the database here (dont overwrite the user, only update the values incase something goes wrong)
    // var getUser =  store.get('user')
    console.log('~~~~~~NEWGAME!');
    window.parent.document.title = GAME_LOCATION + '🚫' + socket.id
    // $('.page').css('background-color','red')
    $('.page').css('background-image','url(assets/images/client/newGame.png)')
    $('.bottomHalf').html( '')

})

socket.on('mySoon', function(data) {
  // setTimeout(function(){
    //if im a next user, change my status to reflect.
    console.log('~~~~~~mySoon!');
    var getUser = store.get('user')

      // $('.waitingNext').html('')
      window.parent.document.title = GAME_LOCATION + '⚠️' + socket.id
      // $('.page').css('background-color','yellow')
      $('.page').css('background-image','url(assets/images/client/mySoon.png)')
      $('.bottomHalf').html( '')


});

socket.on('myTurn', function(taskToPlay) {
    //  console.log(data);

    //Add Points to the client side user object.
    var getUser = store.get('user');
        // console.log('getUser1', getUser);
        getUser.score++
        // console.log('getUser2', getUser);
        socket.emit('scorePoints', getUser)
      store.set('user', getUser)


    // $('.waitingNext').html( taskToPlay )
    window.parent.document.title = GAME_LOCATION + '✅' + socket.id
    // $('.page').css('background-color','green')
    $('.page').css('background-image','url(assets/images/client/myTurn.png)')
    $('.bottomHalf').html( taskToPlay )



    // trigger sound notification
    //  $('.myTurnAudio').get(0).play()
    //  slideDownPanel($('.page.waiting-room .close'));

});


socket.on('disconnect', function() {
    console.log('disconnected from the server as: ' + socket.id);

});