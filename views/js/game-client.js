//http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients/24145381
// https://stackoverflow.com/questions/13745519/send-custom-data-along-with-handshakedata-in-socket-io
// http://www.psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/

////////////////////////////
// Fake User Data in Local Storage
///////////////////////////
function rand(max) {
  min = Math.ceil(1);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
var MortalKombat={characters:["Goro","JohnnyCage","Kano","LiuKang","Raiden","Reptile","Scorpion","ShangTsung","SonyaBlade","Sub-Zero","Baraka","Jade","Jax","Kintaro","Kitana","KungLao","Mileena","NoobSaibot","ShaoKahn","Smoke","Chameleon","Cyrax","Ermac","Kabal","Khameleon","Motaro","Nightwolf","Rain","Sektor","Sheeva","Sindel","Stryker","Fujin","QuanChi","Kia","Jataaka","Sareena","Shinnok","Jarek","Kai","Meat","Reiko","Tanya","Blaze","BoRaiCho","Drahmin","Frost","HsuHao","Kenshi","LiMei","Mokap","Moloch","Nitara","Ashrah","Dairou","Darrius","Havik","Hotaru","Kira","Kobra","Monster","Onaga","Shujinko","Daegon","Taven","DarkKahn","CyberSub-Zero","Kratos","Skarlet","Belokk","Hornbuckle","NimbusTerrafaux"],get:function(){var a=this.characters.length-1;return this.characters[Math.floor(Math.random()*a)]}};

var fakeData = {
  userName: MortalKombat.get(),
  email: MortalKombat.get() + '@' + MortalKombat.get() + '.com',
  avatar: [1,2,3,4], // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
  team: 1,
  tasksPlayed: [rand(30),rand(30),rand(30)],

  // PING
  loggedIn: true,
  currentLocation: 'River',
  priority: rand(30),
  waitTime: rand(1000),

  // METRICS
  score: 0,
  locationsVisited: ['River','Target'], // location + timespent
  totalTasks: rand(30), // this may not be needed scores = totalPlays
  totalTaskTime: rand(1000),
  totalWaitTime: rand(1000),
};

store.set('user', fakeData)


////////////////////////////
// End Fake User Data
///////////////////////////


var myLocation = Math.floor(Math.random() * 2) //Join a random location for testing... This should be changed based on geolocation 

var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

function currentUserInfo() {
    var ui = {
        userObject: store.get('user'),
        room: 'location' + myLocation // SET THIS TO THE ROOM/LOCATION THE USER is going to login to. *******IMPORTANT******
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
    //upload user local storage to the database (dont overwrite the user, only update the values incase something goes wrong)
    console.log('~~~~~~NEWGAME!');
    // console.log('newGame:', store.get('user'));
    $('.waitingNext').html('Waiting At Location XXX')
    window.parent.document.title = myLocation + '🚫' + socket.id
})

socket.on('mySoon', function(data) {
    //if im a next user, change my status to reflect.
    console.log('~~~~~~mySoon!');
      $('.waitingNext').html('Get ready to act! <br> Its soon your turn to play!')
      window.parent.document.title = myLocation + '⚠️' + socket.id
});

socket.on('myTurn', function(taskToPlay) {
    //  console.log(data);
    console.log('~~~MYTURN~~~');
    var getUser = store.get('user')
        getUser.totalTasks++ //these are the same thing...
        getUser.score++ //these are the same thing...
      store.set('user', getUser)

    $('.waitingNext').html('Its your turn to act! <br>' + taskToPlay + '<br> My Score:' + getUser.score )
    window.parent.document.title = myLocation + '✅' + socket.id

    // trigger sound notification on phone
    //  $('.myTurnAudio').get(0).play()
    //  slideDownPanel($('.page.waiting-room .close'));

});


socket.on('disconnect', function() {
    console.log('disconnected from the server as: ' + socket.id);

});



/*****

slideDownPanel($('.page.waiting-room .close'));
This function needs the jQuery Object to work you need to target the close button

moreDetails($('.more-details.game.btn');
This needs to be an anchor tag with a href like this
<a class="btn btn-default more-details" href="#login">Login</a>

*/