var SPRITE_SIZES = {arrow:[50,50], gradient:[50,50]};

var TAU = 2*Math.PI;

createCanvas("canvas", 320, 450);
setActiveCanvas("canvas");
setFillColor("#020C5A");
circle(0,0,1000);
setFillColor("white");
for (var i=0; i<50; i++) {
  circle(randomNumber(0,320), randomNumber(0, 450), 2);
}


var arrow = new Arrow();

timedLoop(50, function() {
  arrow.step();
});

onEvent("screen1", "keydown", function(event) {
  if (event.key == "a") {
    arrow.rotate(TAU/10);
  } else if (event.key == "e") {
    arrow.rotate(-TAU/10);
  } else if (event.key == ",") {
    // pulse forward
    arrow.vx += 3*Math.cos(arrow.theta);
    arrow.vy -= 3*Math.sin(arrow.theta);
    
    // set a limit on the velocity
    var vMag = Math.sqrt(arrow.vx*arrow.vx + arrow.vy*arrow.vy);
    if (vMag > 15) {
      arrow.vx *= 15/vMag;
      arrow.vy *= 15/vMag;
    }
  }
});


function Arrow() {
  this.x = 160;
  this.y = 225;
  
  this.theta = 0;
  this.vx = 0; 
  this.vy = 0;
  
  this.arrow;
  
  this.step = function() {
    this.x += this.vx;
    if (this.x > 320) this.x = 0;
    if (this.x < 0) this.x = 320;
    this.y += this.vy;
    if (this.y > 450) this.y = 0;
    if (this.y < 0) this.y = 450;
    this.arrow.setPosition(this.x, this.y);
  };
  
  this.rotate = function(dTheta) {
    this.theta += dTheta;
    this.arrow.setAngle(this.theta);
  };
  
  this.init = function() {
    this.arrow = new Sprite("arrow", this.x, this.y);
    this.arrow.show();
    wait(1000);
  };
  
  this.init();
}


function Sprite(name, x, y, angle, width, height) {
  this.x = x == null ? 0 : x;
  this.y = y == null ? 0 : y;
  this.angle = angle == null ? 0 : angle;
  this.width = width == null ? SPRITE_SIZES[name][0] : width;
  this.height = height == null ? SPRITE_SIZES[name][1] : height;
  
  this.id;
  this.halfWidth;
  this.halfHeight;
  
  this.show = function() {
    showElement(this.id);
  };
  this.hide = function() {
    hideElement(this.id);
  };
  this.delete = function() {
    deleteElement(this.id);
  };
  
  this.getPosition = function() {
    return [this.x, this.y];
  };

  this.setPosition = function(newX, newY) {
    this.x = newX;
    this.y = newY;
    setPosition(this.id, this.x-this.width/2, this.y-this.height/2);
  };

  this.getAngle = function() {
    return this.angle;
  };
  
  this.setAngle = function(newAngle) {
    this.angle = newAngle; 
    setStyle(this.id, "transform: rotate("+ (-this.angle) +"rad);");
  };
  
  this.init = function(name) {
    this.id = randomNumber(999999999).toString();
    
    image(this.id, name+".png");
    this.hide();

    setSize(this.id, this.width, this.height); // the size of an image defaults to null
    
    this.setAngle(this.angle);
    this.setPosition(this.x, this.y);
    
  };

  this.init(name);
}

function wait(delay) {
  var end = getTime()+delay;
  while (end > getTime()) {}
}


