var count = 1
var s;
var frame = []
var ava = []

function preload(){
  for (var i = 1; i < 340 ; i++) {
    a = loadImage('avatars/' + i + '.png')
    ava.push(a);
  }


  for (var i = 1; i < 5; i++) {
    f = loadImage('frame/' + i + '.png')
    frame.push(f)
  }
  s = loadSound('pop.mp3')

}

function setup() {
  createCanvas(windowWidth,windowHeight)
  imageMode(CENTER);
  // frameRate(2);


}

function draw() {
  // background(255,255,255,0.1);

if(frameCount % 30 == 0){
  background(255);

  // f = frame[floor(random(frame.length))]
  // image(f, width/2,height/2,800,800)


  s.rate(random(0.75,2));
  s.play();

    first = ava[floor(random(ava.length))]
    // console.log(first);
    image(first,width/2-150,height/2, first.width/3, first.height/3);

    // second = ava[floor(random(ava.length))]
    // image(second,width/2+150,height/2, second.width/3, second.height/3);


}


}