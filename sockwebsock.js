'use strict';

var sockWebSock = ( function() {
  
  // socketlist keeps track of what is connected where
  var makeSocketlist = require('./socketlist.js');
  var socketlist = makeSocketlist();

  var net = require('net');
  var WebSocketServer = require("ws").Server;

  var verbose = false;

  var log = function( msg ) {
    if( verbose ) {
      console.log( msg );
    } 
  };

  var guid = function() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
  };

  var tcpsocket = function( port ) {
    var server = net.createServer(function(c) { //'connection' listener
      log('TCP client connected');

      c.name = "tcp:" + guid();
      socketlist.add( c.name, "tcp", c, '/' + c.address().port );
      socketlist.dump();
  
      c.on('end', function() {
        log('TCP client disconnected');
        socketlist.remove( c.name );
        socketlist.dump();
      });
      c.on('data', function( data ) {
        log('received from:' + c.address().port + ': ' + data );
        socketlist.send('/' + c.address().port, data );
      });
    });
  
    server.listen(port, function() { //'listening' listener
      log('TCP server bound to port ' + port);
    });
  };

  var websocket = function( websocketport, endpoint ) {
    try {
      var wss = new WebSocketServer( { 
        port: websocketport,
        path: endpoint });
  
      wss.on("connection", function( ws ) {
        log("websocket connected");
        ws.name = "web:" + guid();
        socketlist.add( ws.name, "web", ws, endpoint );
        socketlist.dump();
  
        ws.on("close", function() {
          log("websocket connection closed");
          socketlist.remove( ws.name );
          socketlist.dump();
        });
      });
      log('websocket server port:' + websocketport 
        + ' endpoint:' + endpoint + ' connected');
    } catch (e ) {
      console.log('Excpetion: ' + e );
    };
  };

  return {
    verbose: function() {
      verbose = true;
    }, 
    create_pair: function( arg, net, WebSocketServer ) {
      var tcpport = arg.split('/')[0];
      var webport = arg.split('/')[1];
  
      tcpsocket( tcpport );
      websocket( webport, '/' + tcpport );
      log('Mapping tcp port ' + tcpport 
        + ' to ws://localhost:' + webport + '/' + tcpport );
    }
  };
})();

var opt = require('node-getopt').create([
  ['v' , ''                    , 'verbose'],
  ['h' , 'help'                , 'display this help'],
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action
.parseSystem(); // parse command line
 
if( opt.argv.length == 0) {
  console.error( "No socket pairs specified" );
  process.exit();  
}

if( opt.options.v ) {
  sockWebSock.verbose();
}

opt.argv.forEach( function( arg ) {
  sockWebSock.create_pair( arg );
});
  


