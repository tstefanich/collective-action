var allTasks = [
 {
   task:"Perform a flood",
   time: 3000,
   players: 4,
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
   players:2,
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


var gameProjection = {
     currentTask:null,
     wait:null,
     init: function(){
          time = new Date().getTime();//store the current time
          // this.getNewTask();
          // this.newGame()

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
        // if(new Date().getTime() - time >= this.wait){
           console.log("tick");//if it is, do something
           time = new Date().getTime();//also update the stored time

           var currentTask = allTasks[getRandomInt(0,allTasks.length)];
           this.wait = currentTask.time;

           console.log(currentTask.players);
          //  socket.emit('startNewGame', 'newGame') //reset all users mobile views && push to the database
           socket.emit('getPriorityUsers', currentTask.players , function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.

            //Need to build in a check here to change the screen to wait for more players if there are less than 2.
            //  if(chosenPlayers == false){ //there are not enough users for this game connected to the server, try again.
            //    gameProjection.newGame()
            //  }
            if(chosenPlayers.length < 2) {
              $('.currentTask').html('Waiting for more players to join...')
              return;
            }

            if(chosenPlayers.length < currentTask.players){
                gameProjection.newGame()
            }

             console.log('chosenPlayers',chosenPlayers)

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

           //this is now wrapped into get priority users.
          //  socket.emit('getSoonUsers', 'soon') //notify the people who are coming up soon. was thinking that we could do this to avoid having to calculate and store who is actually next and just notify maybe 10 or so people that they will be soon and should be on alert, this way they will be in the next 1-2 rounds... I can only see this being a problem for  all crowd games.

        // }
    }
}

/*******************
     Setup
********************/
gameProjection.init();

$(document).click(function(){ //somethimes this fires twice for whatever reason...
  gameProjection.newGame()
})
/*******************
     Draw
********************/
function draw(){
    //  gameProjection.checkTimer();

    // gameProjection.newGame()

     window.requestAnimationFrame(draw);

}
window.requestAnimationFrame(draw);
