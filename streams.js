var rxNames;
var rxWishIndices;
var rxStreamLastFixed;


init();


function init() {
  rxNames = {};
  rxWishIndices = {};
  rxStreamLastFixed = 0;
  
  rxNames.you = true;
  
  var stream = new TXStream("me", "you", "data");
  stream.tx("My favorite number is 0");
  
  for (var i=1; i<10; i++) {
    stream.tx("No, it's "+i);
  }
}


function rxHandle(txer, rxer, type, data) {
  
  console.log(txer+" "+rxer+" "+type+" "+data);
}



// everything below here is general to streams



onRecordEvent("streams", function(record, type) {
  if ((type == "create" || type == "update") && rxNames[record.rxer]) {
    var id = record.id;
    if (!(id in rxWishIndices)) {
      rxWishIndices[id] = 0;
    }
    
    if (record.startIndex == rxWishIndices[id]) {
      var data = record.data;
      for (var i=0; i<data.length; i++) {
        rxHandle(record.txer, record.rxer, record.type, data[i]);
      }
      rxWishIndices[id] += data.length;
      
    } else if (rxStreamLastFixed+250 < getTime()) {
      // set the wish index, the txer is not doing what we want
      console.log("Fixing stream...");
      rxStreamLastFixed = getTime();
      record.wishIndex = rxWishIndices[id];
      updateRecord("streams", record, doNothing);
    }
  }
});

function TXStream(txer, rxer, type) {
  this.txer = txer;
  this.rxer = rxer;
  this.type = type;
  
  this.buf = [];
  this.currentIndex = 0;
  this.record;
  this.lastUpdated = getTime();
  
  this.tx = function(data) {
    this.buf.push(data);
    this.update();
  };
  
  this.update = function() {
    // update the record with our current data
    var start = this.currentIndex;
    var end = Math.min(this.buf.length, start+25);
    
    // stop uncessesary updates
    if (this.lastUpdated+200 > getTime() || start == end || this.record == null) return;

    // update our data for next time
    this.currentIndex = end;
    this.lastUpdated = getTime();
    
    this.record.data = this.buf.slice(start, end);
    this.record.startIndex = start;
    
    updateRecord("streams", this.record, doNothing);
  };
  
  this.addRecord = function(newRecord) {
    this.record = newRecord;
  };
  
  this.init = function() {
    var info = {
      txer: this.txer,
      rxer: this.rxer,
      type: this.type, 
      startIndex: 0,
      data: [],
      // don't define wishIndex
    };
    
    var that = this;
    createRecord("streams", info, function(record) {
      that.addRecord(record);

      timedLoop(200, function() {
        readRecords("streams", {id:that.record.id}, function(records) {
          if (records[0].wishIndex != null) {
            that.currentIndex = records[0].wishIndex;
          }
          that.update();
        });
      });
    });
  };

  this.init();
}




// --------------------------------------------TRIVIAL FUNCTIONS-----------------------------

function wait(delay) {
  var end = getTime()+delay;
  while (end > getTime());
}

function doNothing() {}

function sanitize(input) {
  if (input.length === 0) input = "_";
  input = input.substring(0, 15);
  input = input.replace(/[^a-zA-Z0-9_]/g, "_");
  
  return input;
}

Array.prototype.remove = function(elem) {
  var index = this.indexOf(elem);
  if (index != -1) this.splice(index, 1);
};

