var TAU = 2*Math.PI;

function onLoad() {
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
}

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
  };
  
  this.init();
}



var sprites = {};
readRecords("sprites", {}, function(records) {
  sprites = {};
  var json = "";

  for (var i=0; i<records.length; i++) {
    var curr = records[i];
    var next = i+1<records.length ? records[i+1] : null;

    json += records[i].data;

    if (next === null || curr.name != next.name) {
      sprites[curr.name] = JSON.parse(json);
      json = "";
    }
  }
  
  onLoad();
});

function Sprite(spriteName, x, y) {
  this.x = x == null ? 0 : x;
  this.y = y == null ? 0 : y;
  
  this.id;
  this.halfWidth;
  this.halfHeight;

  this.angle = 0;
  
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
    
    setPosition(this.id, this.x-this.halfWidth, this.y-this.halfHeight);
  };
  
  this.getAngle = function() {
    return this.angle;
  };
  
  this.setAngle = function(newAngle) {
    this.angle = newAngle; 
    setStyle(this.id, "transform: rotate("+ (-this.angle) +"rad);");
  };
  
  this.init = function(spriteName) {
    // read data about the canvas
    this.id = randomNumber(0, 999999999).toString();
    var spriteData = sprites[spriteName];
    this.halfWidth = spriteData.width/2;
    this.halfHeight = spriteData.height/2;

    // create the canvas
    createCanvas(this.id, spriteData.width, spriteData.height);
    this.hide();
    
    // set up attributes about the canvas
    setStyle(this.id, "z-index: 999;"); // put it on the top
    this.setPosition(this.x, this.y);
    
    // actually draw the data to the screen
    setActiveCanvas(this.id);
    putImageData(spriteData, 0, 0);
  };
  
  this.init(spriteName);
}
