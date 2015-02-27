'use strict';

module.exports = ( function() {
  var socketlist = {};

  return {
    dump : function() {
      var keys = [];
      for( var key in socketlist ) {
        keys.push( key );
      }
      console.log( keys.length + ' sockets: ');
      for( var i=0; i<keys.length ; i++ ) {
        console.log( '  ' + keys[i] + ', port=' + socketlist[keys[i]].port );
      }
    },

    count : function() {
      var keys = [];
      for( var key in socketlist ) {
        keys.push( key );
      }
      return keys.length;
    },

    add : function( name, type, connection, port ) {
      socketlist[name] = {
        name: name,
        port: port, 
        type: type,
        connection: connection
      };
    },

    remove : function( name ) {
      delete socketlist[name];
    },

    // write data to all 'web' sockets sat on a particular port
    send : function( port, data ) {
      console.log("send: port=" + port + ' data=' + data );

      var keys = [];
      for( var key in socketlist ) {
        keys.push( key );
      }
      for( var i=0; i<keys.length ; i++ ) {
        var s = socketlist[keys[i]];
        // console.log( 'considering ' + s.name + ' type=' + s.type + ' port=' + s.port);
        if( ( s.type == 'web' ) 
          && ( s.port == port ) ) {
            console.log("notify connection: " + s.name);
            s.connection.send(data );
        }
      }
    },
  };
});
