//http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients/24145381


var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

function setPriority(){ // do we need to keep track of this in the DB? I think likely not...
  // getUser.priority = 1
  var getUser =  store.get('user')

  //this is the call and response/double callback thing we can use for getting the local storage user object and then adding info to the DB
  //we could use this call/response to query the DB on the server to get user stats for setting priority
  // socket.emit('calcPriority',getUser,function(calculatedPriority){
  //   getUser.priority = calculatedPriority
  //   store.set('user', getUser)
  //   console.log(getUser);
  // })
    var calculatedPriority = 0;

    var calcTime = Date.now() - getUser.connectionTimestamp

    if(calcTime > 900000){ //15mins
      calculatedPriority++
    }
    if(calcTime > 600000){  // 10mins
      calculatedPriority++
    }
    if(calcTime > 300000){ // 5mins
      calculatedPriority++
    }

    if(getUser.locationPlays == 0){ //new player
      calculatedPriority = 3
    }

    if(getUser.locationPlays < 5){ //5 or less games played at this location
      calculatedPriority++
    }
    if(getUser.locationPlays < 10){ // 10 or less games played at this location
      calculatedPriority++
    }

    //constrain
    if(calculatedPriority > 5){
      calculatedPriority = 5
    }
    if(calculatedPriority < 0){
      calculatedPriority = 0
    }


    getUser.priority = calculatedPriority
    store.set('user', getUser)
    console.log(getUser);
}

socket.on('connect', function(){
     console.log('connected to the server as: ' + socket.id);

     //setup the user with time and play data when connecting to a new location
     var getUser =  store.get('user')
     getUser.locationPlays = 0
     getUser.connectionTimestamp = Date.now()
     store.set('user', getUser)

     //setPriority()
});

Object.keys(io.sockets.sockets);

socket.on('setPriority', setPriority())

socket.on('next', function(data){
     console.log(data);
     //if im a next user, change my status to reflect.
     $('.waitingNext').html('Get ready to act! <br> you are next!')

});

socket.on('myTurn', function(data){

    var getUser =  store.get('user')
    getUser.locationPlays++
    store.set('user', getUser)

     console.log(data);
     slideDownPanel($('.page.waiting-room .close'));

});


socket.on('disconnect', function(){
     console.log('disconnected from the server as: ' + socket.id);
});


/*****

slideDownPanel($('.page.waiting-room .close'));
This function needs the jQuery Object to work you need to target the close button

moreDetails($('.more-details.game.btn');
This needs to be an anchor tag with a href like this
<a class="btn btn-default more-details" href="#login">Login</a>

*/
