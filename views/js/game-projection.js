var allTasks = [
 {
   task:"Perform a flood",
   time: 3000,
   players: 4
 },
 {
    task:"Perform an earthquake (in the mountains)",
    time: 11000,
    players: 5
 },
 {
    task:"Perform a monsoon (or rainstorm)",
    time: 5000,
    players: 5
 },
 {
    task:"Envision a futuristic water filtration system",
    time: 7000,
    players: 2
 },
 {
   task:"Be a bicycle (and go for a ride)",
   time:10000,
   players:2
 },
 {
   task: "be a bee or a flower, can the bees find some flowers to pollinate?",
   time:6000,
   players: 3
 },
 {
   task: "all players test",
   time:6000,
   players: 'all'
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

const GAME_LOCATION = 'location1'


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
     newGame:function(){
        // if(new Date().getTime() - time >= this.wait){
           console.log("tick");//if it is, do something
           time = new Date().getTime();//also update the stored time

           var currentTask = allTasks[getRandomInt(0,allTasks.length)];
           currentTask.location = GAME_LOCATION // attach the location of this game projection to each current task, we could do this in the json on each task too, but this might prevent us from easily re-using prompts at the commons/uniondepot endcaps.
           this.wait = currentTask.time;

           console.log('currentTask',currentTask);
          //  socket.emit('startNewGame', 'newGame') //reset all users mobile views && push to the database
           socket.emit('getNewAndNotifyUsers', currentTask , function(chosenPlayers){ //this does not account for what happens if there are too few players for the selected task yet. This could also be broken out into a seperate emit message on the server to avoid callbacks if that seems like a style thing we might want to do.

            //check to change the screen to wait for more players if there are less than 2.
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
               userlist += player.userObject.userName + " : " + player.id
               userlist += '<br>'
             })

             $('.currentTask').html(
               currentTask.task
               + '<br>'
               + userlist
             )


           }) // close getNewAndNotifyUsers

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
