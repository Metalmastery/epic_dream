var connections = [],
	rooms = [];

var sys = require("sys");
var WSServer = require("websocket").server;
var http = require("http");
var Room = require("./room");

var server = http.createServer(function(request, response) {
});
server.listen(8888, function() {sys.debug('test') });

var wss = new WSServer({
    httpServer : server
});

wss.on('request', function(request) {
    console.log((new Date()).toLocaleTimeString() + ' Connection from origin ' + request.origin);
    var connection = request.accept(null, request.origin),
        index = connections.push(connection) - 1;

    connection.on('message', function(msg) {
		var parsed = JSON.parse(msg.utf8Data);
		switch (parsed.reqType) {
			case 'connect':
				console.log('client' + index + ' connected');
				break;
			case 'create_room':
				var room = new Room(parsed.name, index.toString());
				rooms.push(room);
				console.log('client' + index + ' created room');
				connection.send(JSON.stringify(rooms));
				break;
			case 'join_room':
				//TODO: join room method
				console.log('client' + index + ' joined room');
				break;
			case 'left_room':
				//TODO: left room method
				console.log('client' + index + ' left room');
				break;
			default:
				break;
		}
//        console.log((new Date()).toLocaleTimeString() + ' Message from origin ' + msg.utf8Data);
//        for (var i = 0; i < connections.length; i++) {
//            connections[i].send(msg.utf8Data);
//        }
    });

    connection.on('close', function(msg) {
        console.log((new Date()).toLocaleTimeString() + ' Disconnected ' + msg);
        connections.splice(index, 1);
    });

});

sys.debug("Server running at 192.168.0.1:8888");
//console.dir(http)