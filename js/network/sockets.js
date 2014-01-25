var ws = (function(){
    var socket = new WebSocket('ws:localhost:8888'),
		clientId;

    socket.onopen = function() {
        console.log("connection created");
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('connection closed');
        } else {
            console.log('connection lost');
        }
        console.log('Code: ' + event.code + ' reason: ' + event.reason);
    };

    socket.onmessage = function(event) {
        console.log("Data received " + event.data);
//        window.tester.keys = JSON.parse(event.data)
		var parsed = JSON.parse(event.data);
		switch (parsed.msgType) {
			case 'register_cid':
				clientId = parsed.cid;
				break;
			default:
				break;
		}
    };

    socket.onerror = function(error) {
        console.log("Error " + error.message);
    };
	socket.createRoom = function (name) {
		this.send(JSON.stringify({
			msgType: 'create_room',
			roomName: name
		}));
	};

    return socket;
})();