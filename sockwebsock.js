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
 console.log("Creating http input on port " + httpsocketport );
    http.createServer( function( req,res ) {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
          console.log("got body: " + body);

          let path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
          log( "request on httpsocket for path" + path );
          //socketlist.dump();
          socketlist.send( path, body );
          res.writeHead( 200, {'Content-Type': 'text/plain' } ); res.end('Hello\n');
        });  
      }
    }).listen(3000); // port is fixed at the moment
  
    log( 'http server started on localhost:3000' );
  };

  var old_websocket_dont_use_this = function( websocketport, endpoint ) {
    try {
      var wss = new WebSocketServer( { 
        port: websocketport,
       });
  
      wss.on("connection", function( ws ) {
        log(websocketport + endpoint + ": websocket connected");
        ws.name = "web:" + guid();
        console.log( ws );
        socketlist.add( ws.name, "web", ws, endpoint);
        //socketlist.dump();
  
        ws.on("close", function() {
          log( websocketport + endpoint + ": websocket connection closed");
          socketlist.remove( ws.name );
          //socketlist.dump();
        });
      });
    } catch (e ) {
      console.log('Excpetion: ' + e );
    };
  };

  var websocket = function( websocketport ) {
    const http = require('http');
    const url = require('url');

    const WebSocket = require('ws');
 console.log("GDR: creating websocketserver on port " + websocketport );
    const server = http.createServer();
 
    server.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;
 console.log("GDR: connection from endpoint" + pathname );
      const wss = new WebSocket.Server({ noServer: true });

      wss.on('connection', function (ws) {
        console.log("wss connection on endpoint " + pathname);
        ws.name = "web:" + guid();
        socketlist.add( ws.name, "web", ws, pathname);

        ws.on('close', function () {
          console.log("wss close on endpoint " + pathname);
          socketlist.remove( ws.name );
        });
      });

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    } );
    console.log("GDR: calling server.listen");
    server.listen(websocketport);
    console.log("GDR: server.listen returned");
  }

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
      
    },
    create_websocket: function( port, path ) {
      websocket( port, path);
    },

    create_logport: function( port, WebSocketServer ) {
      logport = port;
      log('Creating logport ' + port );
      websocket( port, '/');
    },

    create_httplistener: function( port ) {
      httpsocket( port );
    },
  };
})();

var opt = require('node-getopt').create([
  ['v' , '', 'verbose'],
  ['l' , 'logport=ARG', 'logging port'],
  ['i' , 'inport=ARG', 'incoming http port'],
  ['o' , 'outport=ARG', 'outgoing websocket port'],
  ['h' , 'help', 'display this help'],
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action
.parseSystem(); // parse command line
 
// if( opt.argv.length == 0) {
//  console.error( "No socket pairs specified" );
//  process.exit();  
//}

if( opt.options.v ) {
  sockWebSock.verbose();
}

if( opt.options.logport ) {
  sockWebSock.create_logport( opt.options.logport );
}



if( opt.options.inport ) {
  sockWebSock.create_httplistener( opt.options.inport );
}

if( opt.options.outport ) {
  sockWebSock.create_websocket( opt.options.outport );
}

// old tcp pairs as trailling args
opt.argv.forEach( function( arg ) {
  sockWebSock.create_pair( arg );
});

  


