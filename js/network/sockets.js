var ws = (function(){
	var socket = new WebSocket('ws:localhost:8888'),
		clientId;

	socket.onopen = function() {
		console.log("connection created");
		var data = {};
		for (var i = 0; i < engy.objects.length; i++) {
			if (engy.objects[i].behavior === 'ship') {
				data.x = engy.objects[i].x;
				data.y = engy.objects[i].y;
			}
		}
		this.send(JSON.stringify({
			msgType: 'join_battle',
			data: data
		}));
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
			case 'join_battle':
				this.onNewPlayer(parsed.data);
				break;
			case 'rooms_list':
				this.checkRooms(parsed.rooms);
				break;
			default:
				break;
		}
	};

	socket.onerror = function(error) {
		console.log("Error " + error.message);
	};
	socket.checkRooms = function (rooms) {
		if (!rooms.length) {
			this.createRoom('test_room');
		} else {
			var name = window.prompt('Enter the room name to join', 'test_room');
			this.joinRoom(name);
		}
	};
	socket.createRoom = function (name) {
		this.send(JSON.stringify({
			msgType: 'create_room',
			roomName: name
		}));
	};
	socket.joinRoom = function (name) {
		this.send(JSON.stringify({
			msgType: 'join_room',
			roomName: name
		}));
	};
	socket.onNewPlayer = function (playerData) {
		var wsShip = new Ship(playerData.x, playerData.y, 'ws', null);
		engy.addToMainLoop(wsShip);
		engy.collider.add(wsShip);
	};

	return socket;
})();