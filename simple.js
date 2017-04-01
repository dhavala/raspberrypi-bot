var fs = require('fs');
var cors = require('cors')
var http      = require('http');
var https     = require('https');
var express   = require('express');
//var gpio   = require('pi-gpio');
var gpio   = require('rpi-gpio');

var privateKey  = fs.readFileSync('numlinebot-key.pem', 'utf8');
var certificate = fs.readFileSync('numlinebot-cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = express();
app.use(cors())
app.use(express.static(__dirname));

// set-up PIN reference (BCM)
gpio.setMode(gpio.MODE_RPI)

// set-up GPIO pins for I/O
gpio.setup(16,gpio.DIR_OUT,write);

function write(){
 console.log("test-1")
 gpio.write(16,false,function(err){
 if (err) throw err;
 });
}

// pin states for both motors based on L293 driver
// http://www.rakeshmondal.info/L293D-Motor-Driver

// Forward (Clockwise)
var forward_pins = [
  {pin: 11, state:  true},
  {pin: 12, state:  false},
  {pin: 15, state:  true},
  {pin: 16, state:  false}
];

// Backward (Anti-clockwise)
var backward_pins = [
  {pin: 0, state:  false},
  {pin: 2, state:  true},
  {pin: 21, state:  false},
  {pin: 22, state:  true}
];

// Stop moving
var stop_pins = [
  {pin: 0, state:  false},
  {pin: 2, state:  false},
  {pin: 21, state:  false},
  {pin: 22, state:  false}
];

// Duration of rotation for each step
var milliseconds_per_step = 500;
var currentPos = 1;

// move rover N steps forward
app.get('/forward/:steps', function (req, res) {

  var steps = Number(req.params.steps);
  currentPos = currentPos + steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_forward(steps);
});


// move rover N steps backward
app.get('/backward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  currentPos = currentPos - steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_backward(steps);

});


// reset rover state
app.get('/reset', function (req, res) {
  currentPos = 1;
  res.send(String(currentPos));
  console.log('Reset bot to 1');
});


function move_forward(steps) {
  console.log('Started moving forward...');

  // start forward movement
  set_state(forward_pins);

  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}


function move_backward(steps) {
  console.log('Started moving backward...');

  // start backward movement
  set_state(backward_pins);

  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}


function stop() {
  set_state(stop_pins);
}


function set_state(pin_states) {
  
    gpio.write(2,true,function(err){
    if(err) throw err;
    });
  
}


process.on('SIGINT', function() {
  gpio.destroy();
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  process.exit();
});

// ------------------------------------------------------------------------
// Start Express App Server
//
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3030);
httpsServer.listen(3443);

console.log('Raspberry Pi Emulator API is up and running');
console.log('Bot is waiting for your commands at ' + currentPos);

