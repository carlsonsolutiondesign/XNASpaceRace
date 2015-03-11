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
		metaServer = "http://xnaspacerace-44001.onmodulus.net";
		var Client = require('node-rest-client').Client;
		client = new Client();
 

		this.io.on('connection', function (socket) {

            socket.on('ClientMessage', function () {
                if (thePlayers[socket.client.id]) {
                    MultiplayerServer.prototype.ClientMessage(socket, arguments);
                } else {
                    socket.emit('ServerMessage', "You need to join before sending messages");
                }
            });

			socket.on('ClientJoin', function () {
				if (thePlayers[socket.client.id]) {
				} else {
					MultiplayerServer.prototype.ClientJoin(socket, metaServer);
				}
			});
			
			socket.on('ClientRejoin', function () {
				if (thePlayers[socket.client.id]) {
				} else {
					MultiplayerServer.prototype.ClientRejoin(socket, arguments, metaServer);
				}
			});
			
			socket.on('ClientSpawn', function () {
				if (thePlayers[socket.client.id]) { // if joined
					MultiplayerServer.prototype.ClientSpawn(socket, arguments);
				} else {
					console.log("Unrecognized client " + socket.client.id);
				}
			});
			
            socket.on('ClientUpdate', function () {
                if (thePlayers[socket.client.id]) { // if joined
                    MultiplayerServer.prototype.ClientUpdate(socket, arguments);
                } else {
                    console.log("Unrecognized client " + socket.client.id);
                }
            });

            socket.on('clientshoot', MultiplayerServer.prototype.clientshoot);
            socket.on('clientslash', MultiplayerServer.prototype.clientslash);
            socket.on('clientpowerplay', MultiplayerServer.prototype.clientpowerplay);
            socket.on('clientcounter', MultiplayerServer.prototype.clientcounter);
            socket.on('ClientQuit', MultiplayerServer.prototype.ClientQuit);
            socket.on('clientturnbegin', MultiplayerServer.prototype.clientturnbegin);
            socket.on('clientturnend', MultiplayerServer.prototype.clientturnend);

            socket.on('disconnect', function () {
				if (thePlayers[socket.client.id]) {
					var response = {
						playerNumber: thePlayers[socket.client.id].playerNumber,
						playerId: socket.client.id
					};
					io.emit('ServerQuit', response);

					io.emit('ServerMessage', thePlayers[socket.client.id].playerNumber + " quit.");

                    oldplayers[socket.client.id] = thePlayers[socket.client.id];
                    delete thePlayers[socket.client.id];
                    MultiplayerServer.prototype.reportPlayers(socket, metaServer);
                }
            });
		});

		// http://azure.microsoft.com/en-us/documentation/articles/web-sites-nodejs-develop-deploy-mac/
		//var defaultPort = 8088;
		var defaultPort = 1337;
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

		reportPlayers: function(socket, metaServer) {
		    var numPlayers = 0;

			for (var p in thePlayers) {
				numPlayers++;
			}
			io.emit('ServerMessage', "The game has "+numPlayers+" player"+(numPlayers > 1 ? "s." : "."));

			var uri = socket.handshake.headers.referer;
			var hostIndex =uri.indexOf("//")+2;
			var trailing = uri.indexOf("/", hostIndex)-hostIndex;
			var hostport = uri.substr(hostIndex, trailing);
			var portIndex = -1;
			portIndex = hostport.indexOf(":");
			var host = "localhost";
			var port = 51000;
			if (portIndex >= 0) {
				var host = hostport.substr(0, portIndex);
				var port = hostport.substr(portIndex+1);
			} else {
				host = hostport;
				port = 80;
			}
			args ={ path:{"host": host, port: port, players: numPlayers}};
			client.get(metaServer+"/api/servers/${host}/${port}/${players}", args, function(data, response){
				    console.log(data);
			});
 
		},

		ClientMessage: function(socket, msg) {
			io.emit('ServerMessage', "<" + thePlayers[socket.client.id].playerNumber + "> " + msg[0]);
		},

		ClientJoin: function (socket, metaServer) {
			thePlayers[socket.client.id] = { playerNumber: maxplayers, id: socket.client.id, score: 0 };
			maxplayers++;
			
			var response = {
				playerNumber: thePlayers[socket.client.id].playerNumber,
				playerId: socket.client.id
			};
			socket.emit('ServerJoin', response);
			
			io.emit('ServerMessage', thePlayers[socket.client.id].playerNumber + " joined.");
			
			MultiplayerServer.prototype.reportPlayers(socket, metaServer);
			socket.emit('ServerCapability', thePlayers[socket.client.id]);
		},

		ClientRejoin: function (socket, msg, metaServer) {
			var i = msg[0].indexOf("#");
			if (i >= 0) {
				var id = msg[0].substring(i + 1);
				if (typeof oldplayers[id] !== 'undefined') {
					thePlayers[socket.client.id] = { playerNumber: oldplayers[id].playerNumber, id: socket.client.id, score: oldplayers[id].score };
					var response = {
						playerNumber: thePlayers[socket.client.id].playerNumber,
						playerId: socket.client.id,
						previousId: id
					};
					socket.emit('ServerRejoin', response);
					
					io.emit('ServerMessage', thePlayers[socket.client.id].playerNumber + " joined.");
					
					MultiplayerServer.prototype.reportPlayers(socket, metaServer);
					socket.emit('ServerCapability', thePlayers[socket.client.id]);
				} else {
					MultiplayerServer.prototype.ClientJoin(socket, metaServer);
				}
			} else {
				MultiplayerServer.prototype.ClientJoin(socket, metaServer);
			}
		},

		ClientSpawn: function (socket, arguments) {

			thePlayers[socket.client.id].shipId = arguments[0];
			thePlayers[socket.client.id].position = arguments[1];
			thePlayers[socket.client.id].orientation = arguments[2];

			var response = {
				playerId: socket.client.id,
				playerNumber: thePlayers[socket.client.id].playerNumber,
				shipId: thePlayers[socket.client.id].shipId,
				position: thePlayers[socket.client.id].position,
				orientation: thePlayers[socket.client.id].orientation
			};
			
			io.emit('ServerSpawn', response);
		},

		ClientUpdate: function(socket, arguments) {
			console.log('clientupdate');
			thePlayers[socket.client.id].shipId = arguments[0];
			thePlayers[socket.client.id].position = arguments[1];
			thePlayers[socket.client.id].orientation = arguments[2];

			var response = {
				playerId: socket.client.id,
				playerNumber: thePlayers[socket.client.id].playerNumber,
				shipId: thePlayers[socket.client.id].shipId,
				position: thePlayers[socket.client.id].position,
				orientation: thePlayers[socket.client.id].orientation
			};
			
			io.emit('ServerUpdate', response);
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

		ClientQuit: function () {
		    console.log(arguments);
		},

		clientturnbegin: function () {
		    console.log(arguments);
		},

		clientturnend: function () {
		    console.log(arguments);
		}
	};

	return MultiplayerServer;
});
