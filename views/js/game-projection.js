var allTasks = [
 {
   task:"Perform a flood",
   time: 3000,
   players: 5,
   type: 'largeGroup'
 },
 {
    task:"Perform an earthquake (in the mountains)",
    time: 11000,
    players: 5,
    type: 'largeGroup'
 },
 {
    task:"Perform a monsoon (or rainstorm)",
    time: 5000,
    players: 5,
    type: 'largeGroup'
 },
 {
    task:"Envision a futuristic water filtration system",
    time: 7000,
    players: 2,
    type: 'smallGroup'
 },
 {
   task:"Be a bicycle (and go for a ride)",
   time:10000,
   players:3,
   type: 'smallGroup'
 },
 {
   task: "$ is a bee, everyone else is a flower, can the bee find some flowers to pollinate?",
   time:6000,
   players: 3,
   type: 'smallGroup'
 }
]


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
          // this.getNewTask();
          this.newGame()

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
    //  checkTimer:function(){
    //       if(new Date().getTime() - time >= this.wait){
    //            console.log("tick");//if it is, do something
    //            time = new Date().getTime();//also update the stored time
    //            gameProjection.getNewTask();
    //       }
    //  },
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
    newGame:function(){
        if(new Date().getTime() - time >= this.wait){
           console.log("tick");//if it is, do something
           time = new Date().getTime();//also update the stored time

           var currentTask = allTasks[getRandomInt(0,allTasks.length)];
           this.wait = currentTask.time;

           console.log(currentTask.players);
           socket.emit('newGame', 'newGame') //reset all users mobile views
           socket.emit('getPriorityUsers', currentTask.players , function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do. 

             console.log(chosenPlayers)

             var userlist = ""
             chosenPlayers.forEach(function(player){
               userlist += player.userObject.userName
               userlist += '<br>'
             })

             $('.currentTask').html(
               currentTask.task
               + '<br>'
               + userlist
             )


           }) // close getPriorityUsers

        }
    }
}

/*******************
     Setup
********************/
gameProjection.init();
// gameProjection.getPriorityUsers(2, function(data){
//   console.log('returned users: ');
//   console.log(data);
// })



socket.on('forwardUserData',function(data){

  console.log(data);
})

/*******************
     Draw
********************/
function draw(){
    //  gameProjection.checkTimer();
    gameProjection.newGame()

     window.requestAnimationFrame(draw);

}
window.requestAnimationFrame(draw);
