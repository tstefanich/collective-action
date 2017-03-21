//http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients/24145381
// https://stackoverflow.com/questions/13745519/send-custom-data-along-with-handshakedata-in-socket-io
// http://www.psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/

var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!

socket.on('connect', function(){
   console.log('connected to the server as: ' + socket.id);
   console.log(socket);

   socket.emit('updateUser', store.get('user') )
});

socket.on('reconnect',function(){
  socket.emit('updateUser', store.get('user') )
})






// socket.on('getMyWaitTime', function(callback){
//   var myWaitTime = "myWaitTime";
//   var getUser =  store.get('user')
//   console.log(getUser);
//
//
//   callback(myWaitTime)
// })

// socket.on('next', function(data){
//      console.log(data);
//      //if im a next user, change my status to reflect.
//      $('.waitingNext').html('Get ready to act! <br> you are next!')
//
// });
//
// socket.on('myTurn', function(data){
//
//     var getUser =  store.get('user')
//     getUser.locationPlays++
//     store.set('user', getUser)
//
//      console.log(data);
//      slideDownPanel($('.page.waiting-room .close'));
//
// });


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
