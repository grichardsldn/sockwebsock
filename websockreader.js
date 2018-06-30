'use strict';

let WebSockReader = function( endpoint ) {
  console.log(`endpoint=${endpoint}` );
  let retry_ms = 5000;
  let status = "INIT";
  let websocket;
  let onmessage = function() {};
  let onconnect = function() {};
  let ondisconnect = function() {};

  let connect = function() {
    console.log(`Connecting to ${endpoint}`);
    websocket = new WebSocket( endpoint );

    websocket.onopen = function( event ) {
      status = "CONNECTED";
      console.log("Connected");
      onconnect( endpoint );
    };
  
    websocket.onmessage = function( event) {
      console.log("Recieved message: " +  event.data);
      onmessage( event.data );
    };
  
    websocket.onclose = function( event ) {
      status = "RECONNECTING";
      console.log("Connection closed");
      ondisconnect( endpoint );
  
      setTimeout(connect, retry_ms );
  
    };  
  };
  connect();

  return {
    endpoint: function() {
      return endpoint;
    },
    onmessage: function( callback ) { onmessage = callback },

    ondisconnect: function( callback ) { ondisconnect = callback },

    onconnect: function( callback) { onconnect = callback },
  };
};
