var allTasks = [
 {
   task:"clap",
   time: 3000,
 },
 {
    task:"sing",
    time: 11000,
 },
 {
    task:"run",
    time: 5000,
 },
 {
    task:"jump",
    time: 7000,
 }
]


/**********************
Globals
**********************/
var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!
var time;


/**********************
Helper Functions
**********************/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
/*
var namespace = '/';
var roomName = 'my_room_name';
for (var socketId in io.nsps[namespace].adapter.rooms[roomName]) {
    console.log(socketId);
}*/


var gameProjection = {
     currentTask:null,
     wait:null,
     init: function(){
          time = new Date().getTime();//store the current time
          this.getNewTask();

          socket.on('connect', function(){
               console.log('connected to the server as: ' + socket.id);
          });

          socket.on('disconnect', function(){
               console.log('disconnected from the server as: ' + socket.id);
          });
     },
     draw:function(){
          //this.checkTimer();

     },
     checkTimer:function(){
          if(new Date().getTime() - time >= this.wait){
               console.log("tick");//if it is, do something
               time = new Date().getTime();//also update the stored time
               gameProjection.getNewTask();
          }
     },
     getNewTask:function(){
          var currentTask = allTasks[getRandomInt(0,3)];
          this.wait = currentTask.time;
          $('.currentTask').html(currentTask.task);
     },
     getPriorityUsers:function(numberUsers,callback){
       socket.emit('getPriorityUsers', numberUsers, callback )
     }



}



/*******************
     Setup
********************/
gameProjection.init();
gameProjection.getPriorityUsers(2, function(data){
  console.log('returned users: ');
  console.log(data);
})



socket.on('forwardUserData',function(data){

  console.log(data);
})

/*******************
     Draw
********************/
function draw(){
     gameProjection.checkTimer();
     window.requestAnimationFrame(draw);

}
window.requestAnimationFrame(draw);
