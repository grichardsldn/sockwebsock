'use strict';

// Test program to open a web socket and output strings received

var WebSocket = require("ws");

var path = process.argv[2] || 'ws://localhost:4001/3001';
console.log("Connecting to " + path );
var es = new WebSocket( path );

es.onopen = function( event ) {
  console.log("Connected");
};

es.onmessage = function( event) {
  console.log("Recieved message: " +  event.data);
};

es.onclose = function( event ) {
  console.log("Connection closed");
};


