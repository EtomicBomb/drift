var sprites = {};
var index = 0;

function parseImageData(records) {
  sprites = {};
  var variants = [];
  var string = "";

  for (var i=0; i<records.length; i++) {
    var curr = records[i];
    var next = i+1<records.length ? records[i+1] : null;
  
    string += curr.data;
    
    if (next === null || curr.variant != next.variant) {
      variants.push({
        width: curr.width,
        height: curr.height,
        data: toImageDataArray(string),
      });
      string = "";
    }
    
    if (next === null || curr.sprite != next.sprite) {
      sprites[curr.sprite] = variants;
      variants = [];
    }
  }
}

readRecords("sprites", {}, function(records) {
  parseImageData(records);
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


function toImageDataArray(string) {
  var array = [];

  for (var i=0; i<string.length; i++) {
    var byte = string.charCodeAt(i);
    array.push(255*(byte-93)/162);
  }
  return array;
}


