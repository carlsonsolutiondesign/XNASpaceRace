if (!pc) {
	var pc = {};
	pc.script = (function() {
		var script = {
			 create: function (name, callback) {
				console.log(name);
				callback()();
			}
		};
		return script;
	}());
}

pc.script.create('MultiplayerServer', function (context) {

    var MultiplayerServer = function (entity) {

		maxplayers = 0;
		thePlayers = [];
		oldplayers = [];

		this.express = require('express');
		this.app = this.express();
		this.http = require('http').Server(this.app);
		this.io = require('socket.io')(this.http);
		this.app.use(express.static(__dirname));

		this.io.on('connection', function (socket) {

            socket.on('clientmessage', function () {
                if (thePlayers[socket.client.id]) {
                    MultiplayerServer.prototype.clientmessage(socket, arguments);
                } else {
                    socket.emit('servermessage', "You need to join before sending messages");
                }
            });

            socket.on('clientmove', function () {
                if (thePlayers[socket.client.id]) { // if joined
                    MultiplayerServer.prototype.clientmove(socket, arguments);
                } else {
                    console.log("Unrecognized client " + socket.client.id);
                }
            });

            socket.on('clientspawn', function () {
                if (thePlayers[socket.client.id]) { // if joined
                    MultiplayerServer.prototype.clientspawn(socket, arguments);
                } else {
                    console.log("Unrecognized client " + socket.client.id);
                }
            });

            socket.on('clientshoot', MultiplayerServer.prototype.clientshoot);
            socket.on('clientslash', MultiplayerServer.prototype.clientslash);
            socket.on('clientpowerplay', MultiplayerServer.prototype.clientpowerplay);
            socket.on('clientcounter', MultiplayerServer.prototype.clientcounter);
            socket.on('clientquit', MultiplayerServer.prototype.clientquit);
            socket.on('clientturnbegin', MultiplayerServer.prototype.clientturnbegin);
            socket.on('clientturnend', MultiplayerServer.prototype.clientturnend);

            socket.on('clientrejoin', function () {
                if (thePlayers[socket.client.id]) {
                } else {
                    MultiplayerServer.prototype.clientrejoin(socket, arguments);
                }
            });

            socket.on('clientjoin', function () {
                if (thePlayers[socket.client.id]) {
                } else {
                    MultiplayerServer.prototype.clientjoin(socket);
                }
            });

            socket.on('disconnect', function () {
				if (thePlayers[socket.client.id]) {
					var response = {
						playerNumber: thePlayers[socket.client.id].playerNumber,
						playerId: socket.client.id
					};
					io.emit('serverquit', response);

					io.emit('servermessage', thePlayers[socket.client.id].playerNumber + " quit.");

                    oldplayers[socket.client.id] = thePlayers[socket.client.id];
                    delete thePlayers[socket.client.id];
                    MultiplayerServer.prototype.reportPlayers();
                }
            });
		});

		var defaultPort = 8088;

		module.exports = this.http.listen(process.env.PORT || defaultPort);

		console.log('express server started on port %s', process.env.PORT || defaultPort);

/*
		this.http.on('request', function (req, res) {
				console.log(req.url);
			}
		);
*/
		this.http.on('error', function (e) {
		  if (e.code == 'EADDRINUSE') {
		    console.log('Address in use, exiting...');
		  }
		});
	};


	MultiplayerServer.prototype = {

		reportPlayers: function() {
		    var numPlayers = 0;

			for (var p in thePlayers) {
				numPlayers++;
			}
			io.emit('servermessage', "The game has "+numPlayers+" player"+(numPlayers > 1 ? "s." : "."));
		},

		clientmessage: function(socket, msg) {
			io.emit('servermessage', "<"+thePlayers[socket.client.id].playerNumber+"> "+msg[0]);
		},

		clientspawn: function (socket, arguments) {
			
			var response = {
				playerId: socket.client.id,
				playerNumber: thePlayers[socket.client.id].playerNumber,
				shipId: thePlayers[socket.client.id].shipId = arguments[0],
				position: thePlayers[socket.client.id].position = arguments[1],
				orientation: thePlayers[socket.client.id].orientation = arguments[2]
			};
			
			io.emit('serverspawn', response);
		},

		clientmove: function(socket, position, orientation) {
			console.log(position);
			console.log(orientation);
			if (typeof thePlayers[socket.client.id].position !== 'undefined') {
				var newposition = position;
				var oldposition = thePlayers[socket.client.id].position;
				var delta = [newposition[0] - oldposition[0], 
					newposition[1] - oldposition[1], 
					newposition[2] - oldposition[2]];
				var distance = Math.sqrt(delta[0]*delta[0]+delta[1]*delta[1]+delta[2]*delta[2]);
/* player can go anywhere
				if (distance > 1) { // maximum distance player can travel
					delta = [delta[0]/distance, delta[1]/distance, delta[2]/distance];
					thePlayers[socket.client.id].position = [oldposition[0]+delta[0],
						oldposition[1]+delta[1],
						oldposition[2]+delta[2]];
				} else
*/
				{
					thePlayers[socket.client.id].position = newposition;
				}
				thePlayers[socket.client.id].orientation = orientation;
			} else {
				thePlayers[socket.client.id].position = [0,0,0];
				thePlayers[socket.client.id].orientation = orientation;
			}
			io.emit('serverupdate', thePlayers[socket.client.id].playerNumber, thePlayers[socket.client.id].position, thePlayers[socket.client.id].orientation);
			function close(v1, v2) {
				return Math.abs(v1 - v2) < 0.01;
			}
			function inRange(p1, p2) {
				return (close(p1.position[0], p2.position[0]) &&
					close(p1.position[1], p2.position[1]) &&
					close(p1.position[2], p2.position[2]));
			}
			for (var player in thePlayers) {
				// test collisions
				if (player != socket.client.id) {
					if (typeof thePlayers[player].position !== 'undefined') {
						// player has moved
						if (inRange(thePlayers[player], thePlayers[socket.client.id])) {
							// reset to beginning
							thePlayers[player].position = [0,0,0];
							thePlayers[socket.client.id].score++;
							io.emit('serverupdate', thePlayers[player].playerNumber, thePlayers[player].position, thePlayers[player].orientation);
							io.emit('serverscore', thePlayers[socket.client.id].playerNumber, thePlayers[socket.client.id].score);
						}
					}
				}
			}
		},

		clientshoot: function () {
		    console.log(arguments);
		},

		clientslash: function () {
		    console.log(arguments);
		},

		clientpowerplay: function () {
		    console.log(arguments);
		},

		clientcounter: function () {
		    console.log(arguments);
		},

		clientquit: function () {
		    console.log(arguments);
		},

		clientturnbegin: function () {
		    console.log(arguments);
		},

		clientturnend: function () {
		    console.log(arguments);
		},

		clientrejoin: function(socket, msg) {
			var i = msg[0].indexOf("#");
			if (i >= 0) {
				var id = msg[0].substring(i+1);
				if (typeof oldplayers[id] !== 'undefined') {
					thePlayers[socket.client.id] = { playerNumber: oldplayers[id].playerNumber, id: socket.client.id, score: oldplayers[id].score };
					var response = {
						playerNumber: thePlayers[socket.client.id].playerNumber,
						playerId: socket.client.id,
						previousId: id
					};
					socket.emit('serverrejoin', response);

					io.emit('servermessage', thePlayers[socket.client.id].playerNumber + " joined.");

					MultiplayerServer.prototype.reportPlayers();
					socket.emit('servercapability', thePlayers[socket.client.id]);
				} else {
					MultiplayerServer.prototype.clientjoin(socket);
				}
			} else {
				MultiplayerServer.prototype.clientjoin(socket);
			}
		},

		clientjoin: function(socket) {
			thePlayers[socket.client.id] = {playerNumber: maxplayers, id: socket.client.id, score:0};
			maxplayers++;
			
			var response = {
				playerNumber: thePlayers[socket.client.id].playerNumber,
				playerId: socket.client.id
			};
			socket.emit('serverjoin', response);

			io.emit('servermessage', thePlayers[socket.client.id].playerNumber + " joined.");
			
			MultiplayerServer.prototype.reportPlayers();
		    socket.emit('servercapability', thePlayers[socket.client.id]);
		}
	};

	console.log(MultiplayerServer);
	return MultiplayerServer;
});
