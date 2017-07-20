
var avatars = []
// var count = 0
// var cell = 200
// var numAvatars = 30
// var positions = []
var sound;
var soundReverse;
function preload(){
  sound = loadSound('pop.mp3');
  soundReverse = loadSound('popReverse.mp3');
}

function setup() {


  createCanvas(windowWidth,windowHeight)
  setTimeout(function(){
      generateAvatarsOnInterval();
  }, 3000);
  // for (var i = 0; i < 100; i++) {
  //   // var a = loadImage('avatars/'+ Math.ceil(Math.random()*294)+'.png')
  //   var a = new avatar('avatars/'+ Math.ceil(Math.random()*294)+'.png', random(0,width),random(0,height) )
  //     avatars.push(a)
  //
  // }


}

function draw() {
  background(255)


  avatars.sort(function(a, b) {
    return (a.y-a.avatarHeight) - (b.y-a.avatarHeight)
  })

  for (var i = 0; i < avatars.length; i++) {
    avatars[i].display();
    if(avatars[i].readyRemove == true){avatars.splice(i, 1); }
  }







  // noLoop();

  // if(count >= numAvatars) return;

  // for (var x = cell/5; x < width-cell; x+= cell ) {
  //   for (var y = cell/5; y < height - cell; y+= cell) {
  //
  //     if(Math.random() > 0.5){
  //       count++
  //       console.log(count);
  //       image(avatars[count], x,y,cell*0.75,cell*0.75)
  //     }
  //
  //
  //   }
  // }


  // for (var i = 0; i < numAvatars; i++) {
  //   pos = {}
  //
  //   pos.x = random(0,width - numAvatars*6)
  //   pos.y = random(0, height - numAvatars*6)
  //
  //   positions.push(pos)
  // }
  //
  // positions.sort(function(a, b) {
  //   return a.y - b.y
  // })
  //
  // for (var i = 0; i < numAvatars ; i++) {
  //   image(avatars[i],positions[i].x,positions[i].y, numAvatars*6,numAvatars*6)
  // }


}

function perlin() {
  let i = 0;
  let n = random(100);
  return ()=>{
    n += 0.0004;

    //i = (i + 1) % 2;

    let noiseT = i + n;
    //noiseT = noiseT % 1.0;
    var ret = noise(noiseT); //(0,1)
    //ret = (ret - .5) * 2; //(-1,1)
    //console.log(ret)
    return ret;
  }
}
function easeOutBounce(t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
}

function easeInOutElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      b;
    } else if ((t /= d / 2) === 2) {
      b + c;
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    if (t < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    } else {
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
  }


  function easeInElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      b;
    } else if ((t /= d) === 1) {
      b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  }
var startTime
var duration = 300; // animate over 1000ms
var duration2 = 700; // animate over 1000ms

var totChange = .75; // change the size by 25%


function avatar(path,x,y){
  this.id = 'aaa';
  this.x = x
  this.y = y
  this.previousX = 0;
  this.previousY = 0;
  this.random = perlin()
  this.yRandom = perlin()
  this.image = loadImage(path)
  this.speed = random(0,6)
  this.waitTime = random(4,10)
  this.counter = 0;
  this.state = 'avatarIsGrowing';
  this.avatarWidth = -2;
  this.avatarHeight = -1;
  this.startTime = performance.now();
  this.endTime = this.startTime + duration;
  this.rotate = 0;
  this.angle = 0;
  this.angleCounter = 0;
  this.currentValue = 0;
  this.readyRemove = false;

  sound.playbackRate = random(.8,1.5);
  sound.play();

  this.avatarGrow = function(){
    if (this.time >= this.endTime)
    {
      this.state = 'normal';
    }

    var elapsed =  this.time - this.startTime;
    var value = easeOutBounce(elapsed, .001, totChange, duration);
    if(value >= totChange){ value = totChange; } // This is required from keep the tween from increasing too far

    this.currentValue =value; // this is needed to reverse the tween.

    this.avatarWidth = (this.image.width) * value/2;
    this.avatarHeight = (this.image.height) * value/2;//
  },
  this.avatarShrink = function(){
    if (this.time >= this.endTime)
    {
      this.state = 'normal';
      this.readyRemove = true;
    }

    var elapsed =  this.time - this.startTime;
    var value = easeInOutElastic(elapsed, this.currentValue, -this.currentValue, duration2);

    if(value < 0){ value = 0.000001; } // This is required from keep the tween from reversing too far

    this.avatarWidth = (this.image.width) * (value/2);
    this.avatarHeight = (this.image.height) * (value/2);//
  },
  this.calculateSpeed = function(){
      this.speed = abs(this.x - this.previousX) + abs(this.y - this.previousY);
      //speed = speed;
      //console.log(speed);
      this.previousX = this.x;
      this.previousY = this.y;
  },
  this.display = function(){

    this.time = performance.now();

    this.x = map(this.random(),0,1, -.5,1.5) * width;//constrain(this.x + this.random()*4, 0, width - (this.image.width/2));
    this.y = map(this.yRandom(), 0, 1, -.5, 1.5) * height;//constrain(this.y + this.random()*4, 0, height - (this.image.height/2));

    if(this.image.width != 1){ // this necessary until the image is loaded

      switch(this.state) {
        case 'avatarIsGrowing':
          this.avatarGrow();
          break;
        case 'avatarIsShrinking':
          this.avatarShrink();
          break;
      }

      this.calculateSpeed();

      var angle = sin(this.angleCounter * 2 * PI); //-1, 1
      angle =  round(angle * 1) / 1; // snap
      angle *= .75;

      var bounceOffset = sin((this.angleCounter + .25) * 2 * 2 * PI);
      //bounceOffset =  round(bounceOffset * 1) / 1; // snap
      bounceOffset *= 1.75;

      push();
      translate(this.x,this.y + bounceOffset);
      rotate(radians(angle));
      image(this.image,0-(this.avatarWidth/2),0-(this.avatarHeight),this.avatarWidth,this.avatarHeight);
      pop();


      var dT = (1/30.0); //delta time
      //console.log(speed);
      var animSpeed = map(this.speed, 0, 1, .6, .75);
      this.angleCounter = (this.angleCounter + dT * animSpeed);



    }
  }
}

function lerp(t, minn, maxx)
{
  return(t, 0, 1, minn, maxx);
}

function mousePressed() {
  var a = new avatar('avatars/'+ Math.ceil(Math.random()*150)+'.png', random(0,width),random(0,height) )
    avatars.push(a)
}

var overAllTime = 1000;

function generateAvatarsOnInterval(){
 if( avatars.length <=80){
  var a = new avatar('avatars/'+ Math.ceil(Math.random()*150)+'.png', random(0,width),random(0,height) )
    avatars.push(a)
  //}
    overAllTime = overAllTime * .95;

  setTimeout(function(){
    generateAvatarsOnInterval();
  }, overAllTime);
}
};

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
     for (var i = 0; i < avatars.length; i++) {

        if(avatars[i].id == 'aaa'){
          avatars[i].state = 'avatarIsShrinking';
          avatars[i].startTime = performance.now();
          avatars[i].endTime = avatars[i].startTime + duration2;
          soundReverse.playbackRate = random(.8,1.5);
          soundReverse.play();
      }
        }
  }
}


/***


// var socket = io('http://162.243.214.28:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!
var socket = io('http://localhost:3000');

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
  //  console.log(socket);
    console.log('connected to the server as: ' + socket.id);
    socket.emit('updateUser', currentUserInfo())

    //update locationsVisited
    var getUser = store.get('user');
    // getUser.locationsVisited = []; // for testing...
    // console.log('getUser', getUser.locationsVisited);
    check = getUser.locationsVisited.map(function(e) { return e.location; }).indexOf(GAME_LOCATION);
    //getUser.locationsVisited.indexOf(GAME_LOCATION) // use this if we dont want to record connection time
    if(check == -1){ //we havnt been here yet
      var locObj = {
        location:GAME_LOCATION,
        time: Date.now()
      }
      getUser.locationsVisited.push(locObj)
      socket.emit('updateLocationsVisited',getUser)
      store.set('user', getUser)

    }
    // console.log('getUser2', getUser);

});

socket.on('reconnect', function() {
    socket.emit('updateUser', currentUserInfo())
})

socket.on('newGame', function() {
    // $('.waitingNext').html('')
    console.log('~~~~~~NEWGAME!');
    window.parent.document.title = GAME_LOCATION + '🚫' + socket.id
    // $('.page').css('background-color','red')
    $('.page').css('background-image','url(assets/images/client/newGame.png)')
    $('.bottomHalf').html( '')

})

socket.on('myTurn', function(taskToPlay) {

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

    if(taskToPlay.players == 'all'){
      $('.page').css('background-image','url(assets/images/client/mySoon.png)') //for testing until this page exists

    }else{
      $('.page').css('background-image','url(assets/images/client/myTurn.png)')

    }
    $('.bottomHalf').html( taskToPlay.task )

    // trigger sound notification
    //  $('.myTurnAudio').get(0).play()
});

socket.on('disconnect', function() {
    console.log('disconnected from the server as: ' + socket.id);

});


***/