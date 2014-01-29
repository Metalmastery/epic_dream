var connections = [];

var sys = require("sys");
var WSServer = require("websocket").server;
var http = require("http");
var RoomController = require("./room");

var server = http.createServer(function(request, response) {
});
server.listen(8888, function() {sys.debug('test') });

var wss = new WSServer({
    httpServer : server
});
var rc = new RoomController();

wss.on('request', function(request) {
    console.log((new Date()).toLocaleTimeString() + ' Connection from origin ' + request.origin);
    var connection = request.accept(null, request.origin),
        index = connections.push(connection) - 1;

	connection.id = 'cid' + Date.now();
	connection.send(JSON.stringify({
		cid: connection.id,
		msgType: 'register_cid'
	}));
	console.log('Assigned client ID ' + connection.id);

//	connection.send(JSON.stringify({
//		rooms: rc.rooms,
//		msgType: 'rooms_list'
//	}));

    connection.on('message', function(msg) {
		var parsed = JSON.parse(msg.utf8Data);
		console.log('message from ' + this.id);
		switch (parsed.msgType) {
			case 'join_battle':
				console.log('client ' + this.id + ' joined battle');
				broadcast(msg.utf8Data, this.id);
				break;
			case 'create_room':
				console.log('client ' + this.id + ' created room');
				rc.create(parsed.roomName, this.id);
				break;
			case 'join_room':
				console.log('client ' + this.id + ' joined room');
				rc.join(parsed.roomName, this.id);
				break;
			case 'leave_room':
				rc.leave(this.id);
				console.log('client ' + this.id + ' left room');
				break;
			default:
				break;
		}
        console.log((new Date()).toLocaleTimeString() + ' Message from origin ' + msg.utf8Data);
//        for (var i = 0; i < connections.length; i++) {
//            connections[i].send(msg.utf8Data);
//        }
    });

    connection.on('close', function(msg) {
        console.log((new Date()).toLocaleTimeString() + ' Disconnected ' + msg);
		rc.leave(this.id);
        connections.splice(index, 1);
    });

});
function broadcast(msg, casterId) {
	var l = connections.length,
		i = 0;
	for (i; i < l; i++) {
		if (connections[i].id !== casterId) {
			connections[i].send(msg);
		}
	}
}
sys.debug("Server running at 192.168.0.1:8888");
//console.dir(http)