var fs = require('fs');
var app = require('express')();
var http = require('http');
var server = http.createServer(app);

var WebSocket = require('ws');
var wss = new WebSocket.Server({ server });

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults
db.defaults({ log: [] })
  .write();

wss.on('connection', function(socket) {
  console.log('a user connected');
  if (socket.readyState === WebSocket.OPEN) {
    const msgs = db.get('log')
                   .map('msg')
                   .value();
    msgs.forEach(msg => {
      socket.send(msg);
    });
  }
  socket.on("message", function(message) {
    db.get('log')
      .push({ msg: message })
      .write();
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
