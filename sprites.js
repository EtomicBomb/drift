// TASK: be able to display a sprite while constantly clearing a canvas

/*
var string = "";
for (var i=0; i<records.length; i++) {
  string += records[i].data;
}
var array = toImageDataArray(string);
console.log(array);

var data = {
  width: records[0].width,
  height: records[0].height,
  data: array,
};
var start = getTime();
createCanvas("scratch", 50, 50);
setActiveCanvas("scratch");
putImageData(data, 0,0);
var end = getTime();
console.log(end-start);
*/

var sprites = {};
var index = 0;

  


function windows(array) {
  var index = -1;
  return {
    next: function() {
      index++;
      if (index < array.length-1) {
        return {value: [array[index], array[index+1]], done: false};
      } else if (index == array.length-1) {
        return {value: [array[index], null], done: false};
      } else {
        return {done: true};
      }
    }
  };
}

function parseImageData(records) {
  sprites = {};
  var variants = [];
  var string = "";

  var iter = windows(records);
  var index = -1;
  while (true) {
    index++;
    var item = iter.next();
    if (item.done) break;
    var curr = item.value[0];
    var next = item.value[1];

    string += curr.data;
    
    if (next === null || curr.variant != next.variant) {
      var array = toImageDataArray(string);
      variants.push({
        width: curr.width,
        height: curr.height,
        data: array,
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

/*
readRecords("sprites", {}, function(records) {
  var spritesSplit = splitBy(records, "sprite");

  for (var i=0; i<spritesSplit.length; i++) {
    var variantsSplit = splitBy(spritesSplit[i], "variant");

    var variants = [];
    for (var j=0; j<variantsSplit.length; j++) {
      var partsSplit = splitBy(variantsSplit[j], "part");

      var string = "";
      for (var k=0; k<partsSplit.length; k++) {
        string += partsSplit[k][0].data;
      }

      // construct the variant
      var variant = {
        width: variantsSplit[j][0].width,
        height: variantsSplit[j][0].height,
        data: toImageDataArray(string),
      };
      
      variants.push(variant);
    }
    
    sprites[spritesSplit[i][0].sprite] = variants;
  }
  
  init();
});
*/


function toImageDataArray(string) {
  var array = [];
  
  for (var i=0; i<string.length; i++) {
    var byte = string[i].charCodeAt(0);
    array.push(Math.floor(255*(byte-93)/162)|0);
  }
  
  return array;
}

