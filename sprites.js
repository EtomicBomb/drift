var TAU = 2*Math.PI;

var sprites = {};
var index = 0;

function loadSprites(records) {
  sprites = {};
  var variants = [];
  var imageDataData = "";

  for (var i=0; i<records.length; i++) {
    var curr = records[i];
    var next = i+1<records.length ? records[i+1] : null;

    imageDataData += records[i].data;

    if (next === null || curr.variant != next.variant) {
      variants.push({
        width: curr.width,
        height: curr.height,
        data: JSON.parse(imageDataData),
      });
      imageDataData = "";
    }
    
    if (next === null || curr.sprite != next.sprite) {
      sprites[curr.sprite] = variants;
      variants = [];
    }
  }
}

readRecords("sprites", {}, function(records) {
  loadSprites(records);
  // draw the background
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
      arrow.rotate(TAU/20);
    } else if (event.key == "e") {
      arrow.rotate(-TAU/20);
    } else if (event.key == ",") {
      // pulse forward
      arrow.vx += 5*Math.cos(arrow.theta);
      arrow.vy -= 5*Math.sin(arrow.theta);
      
      // set a limit on the velocity
      var vMag = Math.sqrt(arrow.vx*arrow.vx + arrow.vy*arrow.vy);
      if (vMag > 15) {
        arrow.vx *= 15/vMag;
        arrow.vy *= 15/vMag;
      }
    }
  });
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
    this.theta %= TAU;
    if (this.theta < 0) this.theta += TAU;
    
    var variantCount = this.arrow.maxVariant()+1;
    var variant = (this.theta * (variantCount/TAU))|0;
    this.arrow.setVariant(variant);
  };
  
  this.init = function() {
    this.arrow = new Sprite("arrow", 0, this.x, this.y);
    this.rotate(0);
    this.arrow.show();
  };
  
  this.init();
}

function Sprite(sprite, variant, x, y) {
  this.spriteName = sprite;
  this.variant = variant == null ? 0 : variant;
  this.x = x == null ? 0 : x;
  this.y = y == null ? 0 : y;
  
  this.canvasID;
  this.variants;
  this.halfWidth;
  this.halfHeight;
  
  this.show = function() {
    showElement(this.canvasID);
  };
  this.hide = function() {
    hideElement(this.canvasID);
  };
  this.delete = function() {
    deleteElement(this.canvasID);
  };
  
  this.getPosition = function() {
    return [this.x, this.y];
  };

  this.setPosition = function(newX, newY) {
    this.x = newX;
    this.y = newY;
    
    var realX = this.x - this.halfWidth;
    var realY = this.y - this.halfHeight;
    setPosition(this.canvasID, realX, realY);
  };
  
  this.getVariant = function() {
    return this.variant;
  };
  
  this.setVariant = function(newVariant) {
    this.variant = newVariant;
    var data = sprites[this.spriteName][this.variant];
    this.halfWidth = data.width/2;
    this.halfHeight = data.height/2;
    setActiveCanvas(this.canvasID);
    putImageData(data, 0, 0);
  };
  
  this.maxVariant = function() {
    return sprites[this.spriteName].length-1;
  };
  
  this.init = function() {
    this.canvasID = randomNumber(0, 999999999).toString();
    createCanvas(this.canvasID);
    this.hide();
    setStyle(this.canvasID, "z-index: 999"); // put it on the top
    this.setVariant(this.variant);
    this.setPosition(this.x, this.y);
  };
  
  this.init();
}
