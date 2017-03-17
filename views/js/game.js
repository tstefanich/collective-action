var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!
socket.on('connect', function(){
     console.log('connected to the server as: ' + socket.id);
});


socket.on('next', function(data){
     console.log(data);
});

socket.on('myTurn', function(data){
     console.log(data);
});


$(window).click(function(){
     var clientInfo = { 'hi':'there', 'ho' :'here' }
     socket.emit('clientInfo', clientInfo);
})


socket.on('disconnect', function(){
     console.log('disconnected from the server as: ' + socket.id);
});


/*****

slideDownPanel($('.page.login .close'));
This function needs the jQuery Object to work you need to target the close button

moreDetails($(this));
This needs to be an anchor tag with a href like this
<a class="btn btn-default more-details" href="#login">Login</a>
