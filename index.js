var fs = require('fs');
var app = require('express')();
var https        = require('https');
var server = https.createServer({ 
                key: fs.readFileSync('/home/ffw/.config/letsencrypt/live/feuerwehr-eisolzried.de/privkey.pem'),
                cert: fs.readFileSync('/home/ffw/.config/letsencrypt/live/feuerwehr-eisolzried.de/fullchain.pem')
},app);

var WebSocket = require('ws');
var wss = new WebSocket.Server({ server });
var history = [];

wss.on('connection', function(socket) {
  console.log('a user connected');
  for (var i = 0; i < history.length; i++) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(history[i]);
    }
  }
  socket.on("message", function(message) {
    history.push(message);
    if (history.length > 20) {
      history.shift();
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
