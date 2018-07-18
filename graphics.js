var TAU = 2*Math.PI;


setup();

function setup() {
  setActiveCanvas("canvas");
  circle(0,0,1000);
  
  setTimeout(function() {
    var arrow = new Arrow(50, 50);
    
    timedLoop(50, function() {
      arrow.draw();
      arrow.step();
    });
    
  }, 2000);
}


for (var i=0; i<10; i++) {
  createArrowCanvas(i);
}

function createArrowCanvas(i) {
  setTimeout(function() {
    var id = "arrow"+i;
    createCanvas(id, 50, 50);
    hideElement(id);
    setActiveCanvas(id);
    drawImageURL(id+".png");
  }, 100*i);
}


function Arrow(x, y) {
  this.x = x;
  this.y = y;
  this.r = 3;
  this.theta = 0;
  this.canvas;
  
  this.draw = function() {
    setPosition(this.canvas, this.x, this.y);
  };
  
  this.step = function() {
    this.x += this.r*Math.cos(this.theta);
    this.y += this.r*Math.sin(this.theta);
  };
  
  this.rotate = function(newTheta) {
    this.theta = newTheta;
    this.newArrow();
  };
  
  this.newArrow = function() {
    // make theta between 0 and TAU
    this.theta %= TAU;
    if (this.theta < 0) this.theta += TAU;
    var id = "arrow"+Math.round(this.theta*(9/TAU));
    setActiveCanvas(id);
    var data = getImageData(0,0,50,50);
    // make a new canvas
    if (this.canvas) deleteElement(this.canvas);
    
    this.canvas = randomNumber(0,999999999).toString();
    createCanvas(this.canvas, 50, 50);
    
    hideElement(this.canvas);
    setActiveCanvas(this.canvas);
    putImageData(data, 0,0);
    setPosition(this.canvas, this.x, this.y);
    showElement(this.canvas);
  };
  
  
  this.newArrow();
}


