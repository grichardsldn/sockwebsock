'use strict';

var sockWebSock = ( function() {
  
  // socketlist keeps track of what is connected where
  var makeSocketlist = require('./socketlist.js');
  var socketlist = makeSocketlist();

  var net = require('net');
  var WebSocketServer = require("ws").Server;

  var verbose = false;
  var logport;

  var log = function( msg ) {
    msg = new Date().toUTCString() + ' ' + msg;
    if( verbose ) {
      console.log( msg );
    } 
    if( logport ) {
      socketlist.send('/', msg ); // the logging endpoint is just /
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
      log(port + ': TCP client connected');

      c.name = "tcp:" + guid();
      socketlist.add( c.name, "tcp", c, '/' + c.address().port );
      //socketlist.dump();
  
      c.on('end', function() {
        log(port + ': TCP client disconnected');
        socketlist.remove( c.name );
        //socketlist.dump();
      });
      c.on('data', function( data ) {
        log('received from:' + c.address().port + ': ' + data );
        socketlist.send('/' + c.address().port, data );
      });
    });
  
    server.listen(port, function() { //'listening' listener
      //log('TCP server bound to port ' + port);
    });
  };

  var httpsocket = function( httpsocketport ) {
    var http = require('http');

    http.createServer( function( req,res ) {
      log( "request on httpsocket" );
      socketlist.dump();
      socketlist.send('/3001' , "httpdata received" );
      res.writeHead( 200, {'Content-Type': 'text/plain' } ); res.end('Hello Owly');
    }).listen(3000);
  
    log( 'http server started on localhost:3000' );
  };

  var websocket = function( websocketport, endpoint ) {
    try {
      var wss = new WebSocketServer( { 
        port: websocketport,
        path: endpoint });
  
      wss.on("connection", function( ws ) {
        log(websocketport + endpoint + ": websocket connected");
        ws.name = "web:" + guid();
        socketlist.add( ws.name, "web", ws, endpoint );
        //socketlist.dump();
  
        ws.on("close", function() {
          log( websocketport + endpoint + ": websocket connection closed");
          socketlist.remove( ws.name );
          //socketlist.dump();
        });
      });
      //log('websocket server port:' + websocketport 
      //  + ' endpoint:' + endpoint + ' bound');
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
  
      log('Mapping tcp port ' + tcpport 
        + ' to ws://localhost:' + webport + '/' + tcpport );

      tcpsocket( tcpport );
      websocket( webport, '/' + tcpport );
      httpsocket( "ignored" );
    },
    create_logport: function( port, WebSocketServer ) {
      logport = port;
      log('Creating logport ' + port );
      websocket( port, '/');
    }
    
  };
})();

var opt = require('node-getopt').create([
  ['v' , '', 'verbose'],
  ['l' , 'logport=ARG', 'logging port'],
  ['h' , 'help', 'display this help'],
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

if( opt.options.logport ) {
  sockWebSock.create_logport( opt.options.logport );
}

opt.argv.forEach( function( arg ) {
  sockWebSock.create_pair( arg );
});
  


