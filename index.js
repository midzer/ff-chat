var app = require('express')();
var http = require('http');
var server = http.createServer(app);

var WebSocket = require('ws');
var wss = new WebSocket.Server({ server });

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const imageDataURI = require('image-data-uri');

const adapter = new FileSync('db.json');
const db = low(adapter);

const imageSrcMatch = /<img src='([^']+)/;
const imageTypeMatch = /data:image\/([^;]+)/;
const imagePath = './images/';

// Set some defaults
db.defaults({ log: [] })
  .write();

wss.on('connection', function(socket) {
  console.log('a user connected');
  if (socket.readyState === WebSocket.OPEN) {
    const messages = db.get('log')
                   .map('msg')
                   .value();
    messages.forEach(message => {
      const imageSrc = message.match(imageSrcMatch);
      if (imageSrc) {
        imageDataURI.encodeFromFile(imagePath + imageSrc[1])
        .then(result => socket.send(`<img src='${result}'>`))
      }
      else {
        socket.send(message);
      }
    });
  }
  socket.on("message", function(message) {
    const imageSrc = message.match(imageSrcMatch);
    if (imageSrc) {
      const now = new Date();
      const fileName = now.toISOString().replace(/[^\w]/g, '');
      const filePath = imagePath + fileName;
      const imageType = imageSrc[1].match(imageTypeMatch);
      if (imageType) {
        imageDataURI.outputFile(imageSrc[1], filePath)
        .then(result => {
          db.get('log')
            .push({ msg: `<img src='${fileName}.${imageType[1]}'>` })
            .write();
        });
      }
    }
    else {
      db.get('log')
        .push({ msg: message })
        .write();
    }
    wss.clients.forEach(function(client) {
      if (client !== socket && client.readyState === WebSocket.OPEN ) {
        client.send(message);
      }
    });
  });
  socket.on('close', function() {
    console.log('user disconnected');
  });
});

server.listen(62187, function() {
  console.log('listening on *:62187');
});
