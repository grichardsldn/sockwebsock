'use strict';

var makeSocketlist = require('./socketlist.js');

var socketlist = makeSocketlist();

function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

// set up one socket for now

var net = require('net');
var server = net.createServer(function(c) { //'connection' listener
  console.log('TCP client connected');

  c.name = "raw:" + guid();
  socketlist.add( c.name, "raw", c, c.address().port );
  socketlist.dump();

  c.on('end', function() {
    console.log('TCP client disconnected');
    socketlist.remove( c.name );
    socketlist.dump();
  });
  c.on('data', function( data ) {
    console.log('received from:' + c.address().port + ': ' + data );
    socketlist.send(c.address().port, data );
  });
});

server.listen(3002, function() { //'listening' listener
  console.log('TCP server bound');
});

// the web socket stuff
var WebSocketServer = require("ws").Server;

var wss = new WebSocketServer( { port: 3001, path: '/3002' } );

wss.on("connection", function( ws ) {
  console.log("websocket connected");

  ws.name = "web:" + guid();
  socketlist.add( ws.name, "web", ws, "3002" );
  socketlist.dump();

  ws.on("close", function() {
    console.log("websocket connection closed");
    socketlist.remove( ws.name );
    socketlist.dump();
  });
});

console.log("websocket server connected");


