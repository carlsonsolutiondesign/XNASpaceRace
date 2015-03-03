var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname));


function Multiplayer() {
}

var maxplayers = 0;
var players = {};
var oldplayers = {};

function reportPlayers() {
	var numPlayers = 0;
	for (var p in players) {
		numPlayers++;
	}
	io.emit('servermessage', "The game has "+numPlayers+" player"+(numPlayers > 1 ? "s." : "."));
}

Multiplayer.prototype = {
	clientmessage: function(socket, msg) {
		io.emit('servermessage', "<"+players[socket.client.id].playernumber+"> "+msg[0]);
	},
	clientmove: function(socket, position, orientation) {
		console.log(position);
		console.log(orientation);
		if (typeof players[socket.client.id].position !== 'undefined') {
			var newposition = position;
			var oldposition = players[socket.client.id].position;
			var delta = [newposition[0] - oldposition[0], 
				newposition[1] - oldposition[1], 
				newposition[2] - oldposition[2]];
			var distance = Math.sqrt(delta[0]*delta[0]+delta[1]*delta[1]+delta[2]*delta[2]);
			if (distance > 1) { // maximum distance player can travel
				delta = [delta[0]/distance, delta[1]/distance, delta[2]/distance];
				players[socket.client.id].position = [oldposition[0]+delta[0],
					oldposition[1]+delta[1],
					oldposition[2]+delta[2]];
			} else {
				players[socket.client.id].position = newposition;
			}
			players[socket.client.id].orientation = orientation;
		} else {
			players[socket.client.id].position = [0,0,0];
			players[socket.client.id].orientation = orientation;
		}
		io.emit('serverupdate', players[socket.client.id].playernumber, players[socket.client.id].position, players[socket.client.id].orientation);
		function close(v1, v2) {
			return Math.abs(v1 - v2) < 0.01;
		}
		function inRange(p1, p2) {
			return (close(p1.position[0], p2.position[0]) &&
				close(p1.position[1], p2.position[1]) &&
				close(p1.position[2], p2.position[2]));
		}
		for (var player in players) {
			// test collisions
			if (player != socket.client.id) {
				if (typeof players[player].position !== 'undefined') {
					// player has moved
					if (inRange(players[player], players[socket.client.id])) {
						// reset to beginning
						players[player].position = [0,0,0];
						players[socket.client.id].score++;
						io.emit('serverupdate', players[player].playernumber, players[player].position, players[player].orientation);
						io.emit('serverscore', players[socket.client.id].playernumber, players[socket.client.id].score);
					}
				}
			}
		}
	},
	clientshoot: function() {console.log(arguments);},
	clientslash: function() {console.log(arguments);},
	clientpowerplay: function() {console.log(arguments);},
	clientcounter: function() {console.log(arguments);},
	clientquit: function() {console.log(arguments);},
	clientturnbegin: function() {console.log(arguments);},
	clientturnend: function() {console.log(arguments);},
	clientrejoin: function(socket, msg) {
		var i = msg[0].indexOf("?");
		if (i >= 0) {
			var id = msg[0].substring(i+1);
			if (typeof oldplayers[id] !== 'undefined') {
				players[socket.client.id] = { playernumber: oldplayers[id].playernumber, id: socket.client.id, score: oldplayers[id].score };
				socket.emit('servermessage', 'Your previous id was '+id);
				socket.emit('servermessage', 'Your current id is '+socket.client.id);
				console.log(players[socket.client.id]);
				io.emit('servermessage', players[socket.client.id].playernumber+" joined.");
				reportPlayers();
				socket.emit('servercapability', players[socket.client.id], players[socket.client.id].playernumber);
			} else {
				Multiplayer.prototype.clientjoin(socket);
			}
		} else {
			Multiplayer.prototype.clientjoin(socket);
		}
	},
	clientjoin: function(socket) {
		players[socket.client.id] = {playernumber: maxplayers, id: socket.client.id, score:0};
		console.log(players[socket.client.id]);
		maxplayers++;
		io.emit('servermessage', players[socket.client.id].playernumber+" joined.");
		reportPlayers();
		socket.emit('servercapability', players[socket.client.id], players[socket.client.id].playernumber); }
};

io.on('connection', function(socket){
  socket.on('clientmessage', function() {
	if (players[socket.client.id]) {
		Multiplayer.prototype.clientmessage(socket, arguments);
	} else {
		socket.emit('servermessage', "You need to join before sending messages");
	}
  });
  socket.on('clientmove', function() {
	if (players[socket.client.id]) { // if joined
		console.log(arguments);
		Multiplayer.prototype.clientmove(socket, arguments[0], arguments[1]);
	}
  });
  socket.on('clientshoot', Multiplayer.prototype.clientshoot);
  socket.on('clientslash', Multiplayer.prototype.clientslash);
  socket.on('clientpowerplay', Multiplayer.prototype.clientpowerplay);
  socket.on('clientcounter', Multiplayer.prototype.clientcounter);
  socket.on('clientquit', Multiplayer.prototype.clientquit);
  socket.on('clientturnbegin', Multiplayer.prototype.clientturnbegin);
  socket.on('clientturnend', Multiplayer.prototype.clientturnend);
  socket.on('clientrejoin', function () {
	if (players[socket.client.id]) {
	} else {
		Multiplayer.prototype.clientrejoin(socket, arguments);
	}
  });
  socket.on('clientjoin', function () {
	if (players[socket.client.id]) {
	} else {
		Multiplayer.prototype.clientjoin(socket);
	}
  });
  socket.on('disconnect', function(){
	if (players[socket.client.id]) {
		io.emit('servermessage', players[socket.client.id].playernumber+" quit.");
		oldplayers[socket.client.id] = players[socket.client.id];
		delete players[socket.client.id];
		reportPlayers();
	}
  });
});

var defaultPort = 8088;

module.exports = http.listen(process.env.PORT || defaultPort);

console.log('express server started on port %s', process.env.PORT || defaultPort);

http.on('error', function (e) {
  if (e.code == 'EADDRINUSE') {
    console.log('Address in use, exiting...');
  }
});
