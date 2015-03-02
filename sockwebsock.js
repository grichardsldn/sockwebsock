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

function tcpsocket( net, port ) {
  var server = net.createServer(function(c) { //'connection' listener
    console.log('TCP client connected');

    c.name = "tcp:" + guid();
    socketlist.add( c.name, "tcp", c, '/' + c.address().port );
    socketlist.dump();

    c.on('end', function() {
      console.log('TCP client disconnected');
      socketlist.remove( c.name );
      socketlist.dump();
    });
    c.on('data', function( data ) {
      console.log('received from:' + c.address().port + ': ' + data );
      socketlist.send('/' + c.address().port, data );
    });
  });

  server.listen(port, function() { //'listening' listener
    console.log('TCP server bound port ' + port);
  });
}

function websocket( ws, websocketport, endpoint ) {
  try {
    var wss = new WebSocketServer( { 
      port: websocketport,
      path: endpoint });

    wss.on("connection", function( ws ) {
      console.log("websocket connected");
      ws.name = "web:" + guid();
      socketlist.add( ws.name, "web", ws, endpoint );
      socketlist.dump();

      ws.on("close", function() {
        console.log("websocket connection closed");
        socketlist.remove( ws.name );
        socketlist.dump();
      });
    });
    console.log('websocket server port:' + websocketport 
      + ' endpoint:' + endpoint + ' connected');
  } catch (e ) {
    console.log('Excpetion: ' + e );
  };

}

var net = require('net');
var tcpports=[3002,3003];
tcpports.forEach( function( port ) {
  tcpsocket( net, port );
} );

var WebSocketServer = require("ws").Server;
websocket( WebSocketServer, 3001, '/3002');
websocket( WebSocketServer, 3005, '/3003');


