# PieModbusBridge

### การทำงาน

Master ส่ง modbus ถามอุปกรณ์ที่ต่อภายใน bus เดียวกัน โดยมี PieModbus01 ต่ออยู่ด้วย ซึ่ง PieModbusBridge 01 อ่านค่าจาก serial และส่งต่อไปที่ PieModbusBridge 02 ผ่าน NETPIE และนำข้อความที่ได้เขียนลง serial เพื่อถามอุปกรณ์อื่นๆที่อยู่ใน bus เดียวกันกับ PieModbusBridge 02 ถ้ามีอุปกณ์ในตรงกับข้อความที่ส่งออกไป ก็จะทำการตอบกลับผ่าน NETPIE
 
![Alt text](img/PieModbusBridge.png?raw=true "Title")

### การใช้งาน

ติดตั้ง node mudule microgear และ serialport 

```
npm install microgear serialport
```

สร้างไฟล์

```
$ nano PieModbusBridge1.js
```

คัดลอกโค้ดด้านล่างไปวาง และแก้ไข YOUR_APPID, YOUR_KEY, YOUR_SECRET, YOUR_DEVICE_NAME และ SERIAL_PORT

```
#!/usr/bin/env node

'use strict';


/******************************************************
Serial Port

Windows
COM3
COM4

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
```

รันสคริป

```
$ chmod +x PieModbusBridge1.js PieModbusBridge2.js
$ ./PieModbusBridge1.js
```
