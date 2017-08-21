#!/usr/bin/env node

'use strict';


/******************************************************
MACBOOK
/dev/tty.wchusbserial1410
/dev/tty.wchusbserial1420

UBUNTU
/dev/ttyUSB0
/dev/ttyUSB1
******************************************************/

const SerialPort = require('serialport');
var MicroGear = require('microgear');

const APPID     = "YOUR_APPID";
const KEY       = "YOUR_KEY";
const SECRET    = "YOUR_SECRET";
const ALIAS     = "YOUR_DEVICE_NAME";
const SERIALPORT = "SERIAL_PORT"

const port = new SerialPort(SERIALPORT, {baudrate: 9600, databits: 8, parity: 'none', autoOpen: true});

var microgear = MicroGear.create({
    key : KEY,
    secret : SECRET
});

microgear.on('connected', function() {
    console.log('Connected...');
    microgear.setalias(ALIAS);
    microgear.subscribe("/data");
});

microgear.on('disconnected', function() {
    console.log('Disconnected...');
});

microgear.on('message', function(topic,body) {
    console.log('incoming : '+topic+' : '+body);

    if(topic.trim() === ('/'+APPID+'/data').trim()){
        // Convert to Buffer
        var msg = body.toString().split(',');
        if(msg[0]!=ALIAS && msg.length==2){
            var buf = new Buffer(msg[1], 'hex');
            //console.log(buf);

            port.write(buf, (err) => {
                if (err) { return console.log('Error: ', err.message) }
                console.log('message written');
            });
        }
    }
});

microgear.on('closed', function() {
    console.log('Closed...');
});

port.on('open', () => {
    console.log('Port Opened');
    microgear.connect(APPID);
});

port.on('data', (data) => {
    /* get a buffer of data from the serial port */
    console.log("--> Receive : "+data);

    // Convert to HEX string
    var text = data.toString('hex');
    console.log("Publish --> "+text);
    microgear.publish("/data",ALIAS+","+text);
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
});
