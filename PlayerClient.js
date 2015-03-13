pc.script.create('PlayerClient', function (context) {
	
	var PlayerClient = function (entity) {
		this.entity = entity;
	};
	
	var socket = null;
	var players = [];
	var gameManager = null;
	
	PlayerClient.prototype = {
		
		initialize: function () {
			//if (typeof io !== 'undefined') {
			//	this.socket = io();
            //}
			
		    socket = io();
		    if (socket) {
			    socket.on('ServerPackets', this.ServerPackets, this);
			    socket.on('ServerMessage', this.ServerMessage, this);
				socket.on('ServerJoin', this.ServerJoin, this);
				socket.on('ServerRejoin', this.ServerRejoin, this);
				socket.on('ServerQuit', this.ServerQuit, this);
				socket.on('ServerSpawn', this.ServerSpawn, this);
				socket.on('ServerUpdate', this.ServerUpdate, this);
				socket.on('ServerScore', this.ServerScore, this);
				socket.on('ServerCapability', this.ServerCapability, this);

				socket.emit('ClientRejoin', location.href);
			} else {
				console.log("Failed to connect to " + this.host + ":" + this.port);
			}
			
			var root = context.root.getChildren()[0];
			gameManager = root.script.GameManager;
			
			this.on('ClientSpawn', this.ClientSpawn, this);
			this.on('ClientUpdate', this.ClientUpdate, this);
			this.on('ClientSimulate', this.ClientSimulate, this);
		},
		

        //
	    // receiving messages from the server and dispatching them to the game
        //
		ServerPackets: function (packet) {
		    var len = packet.length;

		    for (var i = 0; i < len; i++) {
		        //socket.fire(packet[i].Msg, packet[i].Packet);
		        try {
		            socket._callbacks[packet[i].Msg][0](packet[i].Packet);
		        } catch (err) {
		        }
		    }
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
				console.log('playerId: ' + msg.playerId);
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
		    //console.log('serverupdate');

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
		

	    //
	    // Sending messages to the server
        //
		ClientSpawn: function (shipId, position, orientation) {
			if (socket) {
			    var response = {
			        shipId: shipId,
			        position: position,
                    orientation: orientation
				};

				socket.emit('ClientSpawn', response);
			}
		},
		
		ClientUpdate: function (shipId, position, orientation) {
			if (socket) {
			    var response = {
			        shipId: shipId,
			        position: position,
			        orientation: orientation
			    };
			    socket.emit('ClientUpdate', response);
			}
		},


		ClientSimulate: function (filename, filters) {
		    if (socket) {
		        var response = {
		            filename: filename,
                    filters: filters
		        };
		        socket.emit('ClientSimulate', response);
		    }
		}
	};
	
	return PlayerClient;
});
