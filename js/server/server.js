var connections = [];

var sys = require("sys");
var socket = require("websocket").server;
var http = require("http");

var server = http.createServer(function(request, response) {
});
server.listen(8888, function() {sys.debug('test') });

var s = new socket({
    httpServer : server
});

s.on('request', function(request) {
    console.log((new Date()).toLocaleTimeString() + ' Connection from origin ' + request.origin);
    var connection = request.accept(null, request.origin),
        index = connections.push(connection) - 1;
    connection.on('message', function(msg) {
        console.log((new Date()).toLocaleTimeString() + ' Message from origin ' + msg.utf8Data);
        for (var i = 0; i < connections.length; i++) {
            connections[i].send(msg.utf8Data);
        }
    });
    connection.on('close', function(msg) {
        console.log((new Date()).toLocaleTimeString() + ' Disconnected ' + msg);
        connections.splice(index, 1);
    });

});

sys.debug("Server running at 192.168.0.1:8888");
//console.dir(http)