pc.script.attribute('socketIO', 'string', 'http://localhost:51000',
{
    displayName: "Connect String"
});
pc.script.attribute('metaServer', 'string', 'http://xnaspacerace-44001.onmodulus.net',
{
    displayName: "Metaserver Connect String"
});
pc.script.create('PlayerClient', function (context) {
	
	var PlayerClient = function (entity) {
		this.entity = entity;
	};
	
	var players = [];
	var gameManager = null;
	
	PlayerClient.prototype = {
		
		initialize: function () {
			if (typeof io !== 'undefined') {
            			this.connectString = context.root.findByName(this.socketIO)||'http://localhost:51000';
				if (location.hostname == 'playcanvas.com' && this.connectString) {
					this.socket = io(this.connectString);
				} else {
					this.socket = io();
				}
				this.metaConnectString = context.root.findByName(this.metaServer)||'http://xnaspacerace-44001.onmodulus.net';
				if (this.metaConnectString) {
					this.metaSocket = io(this.metaConnectString);
				}
                        }
			
			if (this.socket) {
				this.socket.on('ServerMessage', this.ServerMessage, this);
				this.socket.on('ServerJoin', this.ServerJoin, this);
				this.socket.on('ServerRejoin', this.ServerRejoin, this);
				this.socket.on('ServerQuit', this.ServerQuit, this);
				this.socket.on('ServerSpawn', this.ServerSpawn, this);
				this.socket.on('ServerUpdate', this.ServerUpdate, this);
				this.socket.on('ServerScore', this.ServerScore, this);
				this.socket.on('ServerCapability', this.ServerCapability, this);

				this.socket.emit('ClientRejoin', location.href);
			} else {
				console.log("Failed to connect to " + this.host + ":" + this.port);
			}
			if (this.metaSocket) {
				// report on game servers from meta server
				this.metaSocket.on('Stats', this.Stats, this);
				// request game servers from meta server
				this.metaSocket.emit('PlayerInstanceRequest');
			}
			
			var root = context.root.getChildren()[0];
			gameManager = root.script.GameManager;
			
			this.on('ClientSpawn', this.ClientSpawn, this);
			this.on('ClientUpdate', this.ClientUpdate, this);
		},
		
		ServerMessage: function (packet) {
			console.log(packet);
		},
		
		// serverjoin is fired when the player has joined a game, 
		// and the player's id is returned for further processing
		ServerJoin: function (packet) {
			console.log('serverjoin');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId
				};
				gameManager.fire('PlayerJoined', msg);
				console.log('playerId: ' + msg.playerId);
			}
		},
		
		ServerRejoin: function (packet) {
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
		
		ServerQuit: function (packet) {
			console.log('serverquit');
			
			if (gameManager) {
				var msg = {
					playerId: packet.playerId
				};
				gameManager.fire('PlayerQuit', msg);
				console.log('playerId: ' + playerId);
			}
		},
		
		ServerSpawn: function (packet) {
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
		
		ServerUpdate: function (packet) {
			console.log('serverupdate');

			if (gameManager) {
				var msg = {
					playerId: packet.playerId,
					playerNumber: packet.playerNumber,
					shipId: packet.shipId,
					position: new pc.Vec3(packet.position.data[0], packet.position.data[1], packet.position.data[2]),
					orientation: new pc.Vec3(packet.orientation.data[0], packet.orientation.data[1], packet.orientation.data[2])
				};
				gameManager.fire('PlayerUpdate', msg);
			}
		},

		ServerScore: function (packet) {
			console.log(packet.playerNumber + " " + packet.score);
		},


		Stats : function(gameServers) {
			for (var gameServer in gameServers) {
				confirm("Join "+gameServer+" with "+gameServers[gameServer]);
			}
		},
		
		ServerCapability: function () {
			if (history.pushState) {
				var href = location.href;
				var i = href.indexOf("#");
				if (i >= 0) {
					href = href.substring(0, i);
				}
				history.pushState({}, document.title, href + "#" + arguments[0].id);
			}
		},
		
		ClientSpawn: function (shipId, position, orientation) {
			if (this.socket) {
				console.log('Spawning: shipId: ' + shipId 
                          + '  position: (' + position.x.toFixed(3) + ', ' + position.y.toFixed(3) + ', ' + position.z.toFixed(3) + ')' 
                          + '  orientation: (' + orientation.x.toFixed(3) + ', ' + orientation.y.toFixed(3) + ', ' + orientation.z.toFixed(3) + ')');
				
				this.socket.emit('ClientSpawn', shipId, position, orientation);
			}
		},
		
		ClientUpdate: function (shipId, position, orientation) {
			if (this.socket) {
				this.socket.emit('ClientUpdate', shipId, position, orientation);
			}
		},
		
		ClientDelta: function (deltaposition, deltaorientation) {
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
