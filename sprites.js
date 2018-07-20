var sprites = {};
var index = 0;

function parseImageData(records) {
  sprites = {};
  var variants = [];
  var imageDataData = [];

  for (var i=0; i<records.length; i++) {
    var curr = records[i];
    var next = i+1<records.length ? records[i+1] : null;

    var data = JSON.parse(records[i].data);
    Array.prototype.push.apply(imageDataData, data);

    if (next === null || curr.variant != next.variant) {
      variants.push({
        width: curr.width,
        height: curr.height,
        data: imageDataData,
      });
      imageDataData = [];
    }
    
    if (next === null || curr.sprite != next.sprite) {
      sprites[curr.sprite] = variants;
      variants = [];
    }
  }
}

readRecords("sprites", {}, function(records) {
  var start = getTime();
  parseImageData(records);
  console.log(getTime()-start);
  createCanvas("canvas", 50, 50);
  setActiveCanvas("canvas");
  
  console.log("ready");
  
  onEvent("screen1", "keydown", function(event) {
    if (event.key == " " && index < sprites.arrow.length) {
      clearCanvas();
      putImageData(sprites.arrow[index], 0, 0);
      index++;
    }
  });
  
  
});


