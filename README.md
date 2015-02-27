# sockwebsock
TCP socket to Web Socket gateway 

Sits on one or more TCP sockets listening to connections, and one or
more web wockets.  Messages sent to the TCP sockets are forwarded to
all the web sockets associated with that TCP socket.

This is a plumbing tool to allow simple embedded systems with no web
sockets stack to push messages to an application running on a browser.

npm ws install
node sockwebsock


