
var log = require('./Logger');
log.init('rvbgames.log');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname));

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

	
AppServer.prototype.ReportPlayers = function () {

	log.write(log.debugLevel.ReportPlayers, 'ReportPlayers');

	var numPlayers = 0;
	
	for (var p in this.thePlayers) {
		numPlayers++;
	}
	this.AppendMessage('ServerMessage', "The game has " + numPlayers + " player" + (numPlayers > 1 ? "s." : "."));
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
}
	
	
AppServer.prototype.ClientRejoin = function (socket, packet) {

	log.write(log.debugLevel.ClientRejoin, socket.client.id);
	
	var i = packet[0].indexOf("#");
	
	if (i >= 0) {
		var id = packeet[0].substring(i + 1);
		
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
	
	log.write(log.debugLevel.ClientQuit, socket.client.id);

	console.log(packet);
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
			log.write(log.debugLevel.UnrecognizedClient, +socket.client.id);
			socket.disconnect();
        }
    });
			
	
	socket.on('ClientUpdate', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
            appServer.ClientUpdate(socket, packet);
        } else {
			log.write(log.debugLevel.UnrecognizedClient, +socket.client.id);
			socket.disconnect();
        }
    });

	
	socket.on('ClientQuit', function (packet) {
        appServer.ClientQuit(socket, packet);
    });

	
	socket.on('disconnect', function () {
		log.write(log.debugLevel.Disconnect, socket.client.id);

        if (appServer.thePlayers[socket.client.id]) {
            var response = {
                playerId: socket.client.id,
                playerNumber: appServer.thePlayers[socket.client.id].playerNumber
            };
			appServer.AppendMessage('ServerQuit', response);

            appServer.oldplayers[socket.client.id] = appServer.thePlayers[socket.client.id];
            delete appServer.thePlayers[socket.client.id];
        }
    });
});
