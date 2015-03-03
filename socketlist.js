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
        console.log( '  ' + keys[i] + ', endpoint=' + socketlist[keys[i]].endpoint );
      }
    },

    count : function() {
      var keys = [];
      for( var key in socketlist ) {
        keys.push( key );
      }
      return keys.length;
    },

    add : function( name, type, connection, endpoint ) {
      socketlist[name] = {
        name: name,
        endpoint: endpoint, 
        type: type,
        connection: connection
      };
    },

    remove : function( name ) {
      delete socketlist[name];
    },

    // write data to all 'web' sockets sat on a particular port
    send : function( endpoint, data ) {
      //console.log("send: endpoint=" + endpoint + ' data=' + data );

      var keys = [];
      for( var key in socketlist ) {
        keys.push( key );
      }
      for( var i=0; i<keys.length ; i++ ) {
        var s = socketlist[keys[i]];
        //console.log( 'considering ' + s.name + ' type=' + s.type + ' endpoint=' + s.endpoint);
        if( ( s.type == 'web' ) 
          && ( s.endpoint == endpoint ) ) {
            //console.log("notify connection: " + s.name);
            s.connection.send(data, { binary: false } );
        }
      }
    },
  };
});
