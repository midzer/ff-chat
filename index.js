var fs = require( 'fs' );
var app = require('express')();
var https        = require('https');
var server = https.createServer({ 
                key: fs.readFileSync('/home/ffw/.config/letsencrypt/live/feuerwehr-eisolzried.de/privkey.pem'),
                cert: fs.readFileSync('/home/ffw/.config/letsencrypt/live/feuerwehr-eisolzried.de/fullchain.pem')
},app);
server.listen(62187, function(){
  console.log('listening on *:62187');
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

