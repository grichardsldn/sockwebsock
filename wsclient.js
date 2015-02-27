'use strict';

// Test program to open a web socket and output strings received

var WebSocket = require("ws");

var es = new WebSocket("ws://localhost:3001/3002");

es.onopen = function( event ) {
  console.log("Connected");
};

es.onmessage = function( event) {
  console.log("Recieved message: " +  event.data);
};

es.onclose = function( event ) {
  console.log("Connection closed");
};


