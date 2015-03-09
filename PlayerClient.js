pc.script.attribute('host', 'string', 'localhost',
{
	displayName: "Remote Host"
});

pc.script.attribute('port', 'number', 8088,
{
	displayName: "Remote Port"
});

pc.script.create('PlayerClient', function (context) {
	
	var PlayerClient = function (entity) {
		this.entity = entity;
		
		this.host = "localhost";
		this.port = 8088;
	};
	
	var players = [];
	var gameManager = null;
	
	PlayerClient.prototype = {
		
		initialize: function () {
			this.port = context.root.findByName('port') || this.port;
			this.host = context.root.findByName('host') || this.host;
			
			if (typeof io !== 'undefined') {
				this.socket = io("http://" + this.host + ":" + this.port, { hostname: this.host, host: this.host, port : this.port });
			}
			
			if (this.socket) {
				this.socket.on('servermessage', this.servermessage, this);
				this.socket.on('serverjoin', this.serverjoin, this);
				this.socket.on('serverrejoin', this.serverrejoin, this);
				this.socket.on('serverquit', this.serverquit, this);
				this.socket.on('serverspawn', this.serverspawn, this, arguments);
				this.socket.on('serverupdate', this.serverupdate, this);
				this.socket.on('serverscore', this.serverscore, this);
				this.socket.on('servercapability', this.servercapability, this);
				this.socket.emit('clientrejoin', location.href);
			} else {
				console.log("Failed to connect to " + this.host + ":" + this.port);
			}
			
			var root = context.root.getChildren()[0];
			gameManager = root.script.GameManager;
			
			this.on('spawn', this.spawn, this);
		},
		
		servermessage: function (packet) {
			console.log(packet);
		},
		
		// serverjoin is fired when the player has joined a game, 
		// and the player's id is returned for further processing
		serverjoin: function (packet) {
			console.log('serverjoin');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId
				};
				gameManager.fire('PlayerJoined', msg);
				console.log('playerId: ' + msg.playerId);
			}
		},
		
		serverrejoin: function (packet) {
			console.log('serverrejoin');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId,
					previousId: packet.previousId
				};
				gameManager.fire('PlayerRejoined', msg);
				console.log('playerId: ' + msg.playerId);
			}
		},
		
		serverquit: function (packet) {
			console.log('serverquit');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId
				};
				gameManager.fire('PlayerQuit', msg);
				console.log('playerId: ' + playerId);
			}
		},
		
		serverspawn: function (packet) {
			console.log('serverspawn:');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId,
					playerNumber: packet.playerNumber,
					shipId: packet.shipId,
					position: new pc.Vec3(packet.position.data[0], packet.position.data[1], packet.position.data[2]),
					orientation: new pc.Vec3(packet.orientation.data[0], packet.orientation.data[1], packet.orientation.data[2])
				};
				gameManager.fire('PlayerSpawned', msg);
			
				console.log('Spawning: playerId: ' + msg.playerId 
					      + ' playerNumber: ' + msg.playerNumber 
						  + ' shipId: ' + msg.shipId 
                          + ' position: (' + msg.position.x.toFixed(3) + ', ' + msg.position.y.toFixed(3) + ', ' + msg.position.z.toFixed(3) + ')' 
                          + ' orientation: (' + msg.orientation.x.toFixed(3) + ', ' + msg.orientation.y.toFixed(3) + ', ' + msg.orientation.z.toFixed(3) + ')');
			}
		},
		
		serverupdate: function (packet) {
			// $('#messages').append($('<li>').text(playerNumber+" at "+position+" turns "+orientation));
			if (typeof players[packet.playerNumber] === 'undefined') {
				console.log("Player needs to spawn first before sending updates");
			} else {
			}
		},
		
		serverscore: function (packet) {
			console.log(packet.playerNumber + " " + packet.score);
		},
		
		servercapability: function () {
			if (history.pushState) {
				var href = location.href;
				var i = href.indexOf("#");
				if (i >= 0) {
					href = href.substring(0, i);
				}
				history.pushState({}, document.title, href + "#" + arguments[0].id);
			}
		},
		
		spawn: function (shipId, position, orientation) {
			if (this.socket) {
				console.log('Spawning: shipId: ' + shipId 
                          + '  position: (' + position.x.toFixed(3) + ', ' + position.y.toFixed(3) + ', ' + position.z.toFixed(3) + ')' 
                          + '  orientation: (' + orientation.x.toFixed(3) + ', ' + orientation.y.toFixed(3) + ', ' + orientation.z.toFixed(3) + ')');
				
				this.socket.emit('clientspawn', shipId, position, orientation);
			}
		},
		
		move: function (position, orientation) {
			if (this.socket) {
				this.socket.emit('clientmove', position, orientation);
			}
		},
		
		delta: function (deltaposition, deltaorientation) {
			this.position[0] += deltaposition[0];
			this.position[1] += deltaposition[1];
			this.position[2] += deltaposition[2];
			this.position[3] += deltaposition[3];
			this.orientation[0] += deltaorientation[0];
			this.orientation[1] += deltaorientation[1];
			this.orientation[2] += deltaorientation[2];
			this.move(position, orientation);
		}
	};
	
	return PlayerClient;
});
