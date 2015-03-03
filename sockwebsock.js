'use strict';

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
    console.log('TCP server bound to port ' + port);
  });
}

function websocket( WebSocketServer, websocketport, endpoint ) {
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

function create_pair( arg, net, WebSocketServer ) {
  var tcpport = arg.split('/')[0];
  var webport = arg.split('/')[1];

  tcpsocket( net, tcpport );
  websocket( WebSocketServer, webport, '/' + tcpport );
}

function sockwebsock() {
  var opt = require('node-getopt').create([
    ['v' , ''                    , 'verbose'],
    ['h' , 'help'                , 'display this help'],
  ])              // create Getopt instance
  .bindHelp()     // bind option 'help' to default action
  .parseSystem(); // parse command line
  
  console.info( opt );

  if( opt.argv.length == 0) {
    console.error( "No socket pairs specified" );
    process.exit();  
  }

  var net = require('net');
  var WebSocketServer = require("ws").Server;
  
  opt.argv.forEach( function( arg ) {
    create_pair( arg, net, WebSocketServer );
  });
}

// socketlist keeps track of what is connected where
var makeSocketlist = require('./socketlist.js');
var socketlist = makeSocketlist();
  
sockwebsock();


