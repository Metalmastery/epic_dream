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

    connection.on('message', function(msg) {
		var parsed = JSON.parse(msg.utf8Data);
		console.log('message from ' + this.id);
		switch (parsed.msgType) {
			case 'join_battle':
				console.log('client ' + this.id + ' joined battle');
				broadcast(parsed.shipData, this.id);
				break;
			case 'create_room':
				console.log('client ' + this.id + ' created room');
				break;
			case 'join_room':
				//TODO: join room method
				console.log('client ' + this.id + ' joined room');
				break;
			case 'leave_room':
				//TODO: leave room method
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
        connections.splice(index, 1);
    });

});
function broadcast(msg, casterId) {
	var cns = connections,
		l = cns.length,
		i = 0;
	for (i; i < l; i++) {
		if (cns[i].id !== casterId) {
			cns[i].send(msg);
		}
	}
}
sys.debug("Server running at 192.168.0.1:8888");
//console.dir(http)