var fs = require('fs');

var log = require('./Logger');
log.init('xnaspacerace.rvbgames.log');

var simulationPath = './simulationlogs/';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;
var metaServer = "http://xnaspacerace-44001.onmodulus.net";
var Client = require('node-rest-client').Client;
var client = new Client();
app.use(express.static(__dirname));
var router = express.Router();
router.route('/servers')
	.get(function(req, res) {
		client.get(metaServer+"/api/servers/", function(gameServers, response){
			console.log(gameServers);
			res.json(JSON.parse(gameServers));
		});
	});
app.use('/api', router);



http.listen(port, function () {
    console.log('listening on *:' + port);
});

function AppServer() {
	
	this.maxplayers = 0;
	this.thePlayers = [];
	this.oldplayers = [];
	
	this.timerDelay = 20;
	this.timer = null;
	
	this.messages = [];
};

	
AppServer.prototype.ReportPlayers = function (socket) {

	log.write(log.debugLevel.ReportPlayers, 'ReportPlayers');

	var numPlayers = 0;
	
	for (var p in this.thePlayers) {
		numPlayers++;
	}
	this.AppendMessage('ServerMessage', "The game has " + numPlayers + " player" + (numPlayers > 1 ? "s." : "."));

	var uri = socket.handshake.headers.referer;
	var hostIndex = uri.indexOf("//")+2;
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
	var args = { path:{"host": host, port: port, players: numPlayers}};
	client.get(metaServer+"/api/servers/${host}/${port}/${players}", args, function(data, response){
		    console.log(data);
	});
}
	
	
AppServer.prototype.ClientMessage = function (socket, msg) {

	log.write(log.debugLevel.ClientMessage, socket.client.id);

	this.AppendMessage('ServerMessage', "<" + this.thePlayers[socket.client.id].playerNumber + "> " + msg[0]);
}
	
	
AppServer.prototype.ClientJoin = function (socket, packet) {

	log.write(log.debugLevel.ClientJoin, socket.client.id);
	
	this.thePlayers[socket.client.id] = {
		playerNumber: this.maxplayers,
		id: socket.client.id,
		score: 0
	};
	
	this.maxplayers++;
	
	var response = {
		playerNumber: this.thePlayers[socket.client.id].playerNumber,
		playerId: socket.client.id
	};
	socket.emit('ServerJoin', response);
	
	this.AppendMessage('ServerMessage', this.thePlayers[socket.client.id].playerNumber + " joined.");
	this.ReportPlayers(socket);
}
	
	
AppServer.prototype.ClientRejoin = function (socket, packet) {

	log.write(log.debugLevel.ClientRejoin, socket.client.id);
	
	var i = packet[0].indexOf("#");
	
	if (i >= 0) {
		var id = packet[0].substring(i + 1);
		
		if (typeof this.oldplayers[id] !== 'undefined') {
			
			this.thePlayers[socket.client.id] = {
				playerNumber: this.oldplayers[id].playerNumber,
				id: socket.client.id,
				score: this.oldplayers[id].score
			};
			
			var response = {
				playerId: socket.client.id,
				playerNumber: this.thePlayers[socket.client.id].playerNumber,
				previousId: id
			};
			socket.emit('ServerRejoin', response);
			
			this.AppendMessage('ServerMessage', this.thePlayers[socket.client.id].playerNumber + " joined.");
			this.ReportPlayers(socket);
		} else {
			this.ClientJoin(socket, packet);
		}
	} else {
		this.ClientJoin(socket, packet);
	}
}
	
	
AppServer.prototype.ClientSpawn = function (socket, packet) {

	log.write(log.debugLevel.ClientSpawn, socket.client.id);
	
	this.thePlayers[socket.client.id].shipId = packet.shipId;
	this.thePlayers[socket.client.id].position = packet.position;
	this.thePlayers[socket.client.id].orientation = packet.orientation;
	
	var response = {
		playerId: socket.client.id,
		playerNumber: this.thePlayers[socket.client.id].playerNumber,
		shipId: this.thePlayers[socket.client.id].shipId,
		position: this.thePlayers[socket.client.id].position,
		orientation: this.thePlayers[socket.client.id].orientation
	};
	
	this.AppendMessage('ServerSpawn', response);
}
	
	
AppServer.prototype.ClientUpdate = function (socket, packet) {

	log.write(log.debugLevel.ClientUpdate, socket.client.id);
	
	this.thePlayers[socket.client.id].shipId = packet.shipId;
	this.thePlayers[socket.client.id].position = packet.position;
	this.thePlayers[socket.client.id].orientation = packet.orientation;
	
	var response = {
		playerId: socket.client.id,
		playerNumber: this.thePlayers[socket.client.id].playerNumber,
		shipId: this.thePlayers[socket.client.id].shipId,
		position: this.thePlayers[socket.client.id].position,
		orientation: this.thePlayers[socket.client.id].orientation
	};
	
	this.AppendMessage('ServerUpdate', response);
}
	
	
AppServer.prototype.ClientQuit = function (socket, packet) {

	log.write(log.debugLevel.ClientUpdate, socket.client.id);

	var response = {
		playerId: socket.client.id,
		playerNumber: appServer.thePlayers[socket.client.id].playerNumber
	};
	this.AppendMessage('ServerQuit', response);

	this.oldplayers[socket.client.id] = appServer.thePlayers[socket.client.id];
	delete this.thePlayers[socket.client.id];
	this.ReportPlayers(socket);
}


AppServer.prototype.DispatchMessages = function () {

	log.write(log.debugLevel.DispatchMessages);

	var len = this.messages.length;
	if (len === 0) {
		log.write(log.debugLevel.NoDispatchMessages, 'No messages to dispatch');
		return;
	}

	log.write(log.debugLevel.DispatchNMessages, 'Dispatching ' + len + ' message(s)');

	if (log.debugLevel.WritePacket) {
		for (var i = 0; i < len; i++) {
			log.write(log.debugLevel.WritePacket, this.messages[i]);
		}
	}
	
	io.emit('ServerPackets', this.messages);

	this.messages = [];
}


AppServer.prototype.AppendMessage = function (msg, packet) {

	log.write(log.debugLevel.AppendMessage, msg);

	this.messages[this.messages.length] = { Msg: msg, Packet: packet };
}


appServer = new AppServer();
appServer.timer = setInterval(function () { appServer.DispatchMessages.call(appServer); }, appServer.timerDelay);


io.on('connection', function (socket) {
	
	log.write(log.debugLevel.Connection, socket.client.id);

	socket.on('ClientMessage', function (msg) {
        if (appServer.thePlayers[socket.client.id]) {
            appServer.ClientMessage(socket, msg);
        } else {
            socket.emit('ServerMessage', "You need to join before sending messages");
        }
    });


	socket.on('ClientJoin', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
        } else {
            appServer.ClientJoin(socket, packet);
        }
    });
			

	socket.on('ClientRejoin', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
        } else {
            appServer.ClientRejoin(socket, packet);
        }
    });


	socket.on('ClientSpawn', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
            appServer.ClientSpawn(socket, packet);
        } else {
			log.write(log.debugLevel.UnrecognizedClient, socket.client.id);
			socket.disconnect();
        }
    });
			
	
	socket.on('ClientUpdate', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
            appServer.ClientUpdate(socket, packet);
        } else {
			log.write(log.debugLevel.UnrecognizedClient, socket.client.id);
			socket.disconnect();
        }
    });

	
	socket.on('ClientQuit', function (packet) {
		if (appServer.thePlayers[socket.client.id]) {
			appServer.ClientQuit(socket, packet);
		} else {
			log.write(log.debugLevel.UnrecognizedClient, socket.client.id);
			socket.disconnect();
		}
    });

	
	socket.on('ClientSimulate', function (packet) {
		try {
			var filename = packet.filename;
			var filters = packet.filters;
			
			var fileStream = fs.readFile(simulationPath + filename, { encoding: 'utf-8' }, function (err, data) {
				// split the file into individual text lines
				var messages = data.split('\n');
				
				// loop through the messages and play them back at roughly the same time
				var startTime = null;
				var simulateTime = null;

				for (var i = 0; i < messages.length; i++) {
					// make sure that there is a text line to process
					if (messages[i].length > 0) {
						// convert the text line to JSON
						var msg = JSON.parse(messages[i]);
						
						// if the are no filters or the Msg is in the filters then process it
						if (!filters || filters.indexOf(msg.Message.Msg) >= 0) {
							
							// if the startTime is null, meaning nothing has been processed yet, get the time from the Msg
							if (startTime === null) {
								startTime = new Date(msg.DateTime);
							}
							
							// read the simulation time from the Msg
							simulateTime = new Date(msg.DateTime);
							
							var delta = (simulateTime - startTime);
							
							// set a timer based on (simulationTime - startTime)
							setTimeout(function (msg) {
								var packet = msg.Message.Packet;
								
								if (typeof packet !== 'string')
									packet = JSON.stringify(msg.Message.Packet);
								
								io.emit(msg.Message.Msg, msg.Message.Packet);
							
							}, (delta), msg);
						}
					}
				}
			});
			
		} catch (err) {
			console.log('ClientSimulate error: ' + err.message);
		}
	});


	socket.on('disconnect', function (packet) {
		log.write(log.debugLevel.Disconnect, socket.client.id);

		if (appServer.thePlayers[socket.client.id]) {
			appServer.ClientQuit(socket, packet);
		} else {
			log.write(log.debugLevel.UnrecognizedClient, socket.client.id);
		}
    });
});
