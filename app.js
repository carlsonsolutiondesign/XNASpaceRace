
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname));

http.listen(port, function () {
    console.log('listening on *:' + port);
});

var showDebug = Object.freeze({
	All: false,
	Connection: true,
	Disconnect: true,
	ReportPlayers: false,
	ClientMessage: false,
	ClientJoin: true,
	ClientRejoin: true,
	ClientSpawn: true,
	ClientUpdate: false,
	ClientQuit: true,
	DispatchMessages: false,
	NoDispatchMessages: false,
	DispatchNMessages: false,
	AppendMessage: false
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

	if(showDebug.ReportPlayers || showDebug.All)
		console.log('ReportPlayers');

	var numPlayers = 0;
	
	for (var p in this.thePlayers) {
		numPlayers++;
	}
	this.AppendMessage('ServerMessage', "The game has " + numPlayers + " player" + (numPlayers > 1 ? "s." : "."));
}
	
	
AppServer.prototype.ClientMessage = function (socket, msg) {

	if (showDebug.ClientMessage || showDebug.All)
		console.log('ClientMessage ' + socket.client.id);

	this.AppendMessage('ServerMessage', "<" + this.thePlayers[socket.client.id].playerNumber + "> " + msg[0]);
}
	
	
AppServer.prototype.ClientJoin = function (socket, packet) {

	if (showDebug.ClientJoin || showDebug.All)
		console.log('ClientJoin ' + socket.client.id);
	
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

	if (showDebug.ClientRejoin || showDebug.All)
		console.log('ClientRejoin ' + socket.client.id);
	
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

	if (showDebug.ClientSpawn || showDebug.All)
		console.log('ClientSpawn ' + socket.client.id);
	
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

	if (showDebug.ClientUpdate || showDebug.All)
		console.log('ClientUpdate ' + socket.client.id);
	
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
	
	if (showDebug.ClientQuit || showDebug.All)
		console.log('ClientQuit ' + socket.client.id);

	console.log(packet);
}


AppServer.prototype.DispatchMessages = function () {

	if (showDebug.DispatchMessages || showDebug.All)
		console.log('DispatchMessages');

	var len = this.messages.length;
	if (len === 0) {
		if (showDebug.NoDispatchMessages || showDebug.All)
			console.log('No messages to dispatch');
		return;
	}

	if (showDebug.DispatchNMessages || showDebug.All)
		console.log('Dispatching ' + len + ' message(s)');

	io.emit('ServerPackets', this.messages);

	this.messages = [];
}


AppServer.prototype.AppendMessage = function (msg, packet) {

	if (showDebug.AppendMessage || showDebug.All)
		console.log('Append message: ' + msg);

	this.messages[this.messages.length] = { Msg: msg, Packet: packet };
}


appServer = new AppServer();
appServer.timer = setInterval(function () { appServer.DispatchMessages.call(appServer); }, appServer.timerDelay);


io.on('connection', function (socket) {
	
	if (showDebug.Connection || showDebug.All)
		console.log('connection made ' + socket.client.id);

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
            console.log("Unrecognized client " + socket.client.id);
        }
    });
			
	
	socket.on('ClientUpdate', function (packet) {
        if (appServer.thePlayers[socket.client.id]) {
            appServer.ClientUpdate(socket, packet);
        } else {
            console.log("Unrecognized client " + socket.client.id);
        }
    });

	
	socket.on('ClientQuit', function (packet) {
        appServer.ClientQuit(socket, packet);
    });

	
	socket.on('disconnect', function () {
		if (showDebug.Disconnect|| showDebug.All)
			console.log('disconnect ' + socket.client.id);

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
