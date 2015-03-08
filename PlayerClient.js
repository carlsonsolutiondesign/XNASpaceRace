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
		this.host = "localhost";
		this.port = 8088;
		players = [];
	};

	PlayerClient.prototype = {

	    initialize: function () {
		    this.port = context.root.findByName('port')||this.port;
		    this.host = context.root.findByName('host') || this.host;

		    if (typeof io !== 'undefined') {
			    this.socket = io("http://"+this.host+":"+this.port, { hostname: this.host, host: this.host, port : this.port });
		    }

		    if (this.socket) {
			    this.socket.on('servermessage', this.servermessage, this);
			    this.socket.on('serverupdate', this.serverupdate, this);
			    this.socket.on('serverscore', this.serverscore, this);
			    this.socket.on('servercapability', this.servercapability, this);
			    this.socket.on('serverspawn', this.serverspawn, this, arguments);
			    this.socket.emit('clientrejoin', location.href);
		    } else {
			    console.log("Failed to connect to "+this.host+":"+this.port);
		    }

		    this.on('spawn', this.spawn, this);
	    },

		servermessage: function(msg) {
			console.log(msg);
		},

		serverspawn: function (arguments) {
		    console.log('serverspawn:');
		    console.log(arguments);

		    var playerNumber = 0;
		    var shipId = 0;
		    var position = new pc.Vec3(); //new pc.Vec3(arguments[2].data[0], arguments[2].data[1], arguments[2].data[2]);
		    var orientation = new pc.Vec3(); //new pc.Vec3(arguments[3].data[0], arguments[3].data[1], arguments[3].data[2]);

		    console.log('Respawn: playerId: ' + playerNumber
                      + ' ship id ' + shipId
                      + '  position: (' + position.x.toFixed(3) + ', ' + position.y.toFixed(3) + ', ' + position.z.toFixed(3) + ')'
                      + '  orientation: (' + orientation.x.toFixed(3) + ', ' + orientation.y.toFixed(3) + ', ' + orientation.z.toFixed(3) + ')');

			players[playerNumber] = {
				position: position,
				orientation: orientation
			};

			// create new ship for other player
		},

		serverupdate: function (playerNumber, position, orientation) {
			// $('#messages').append($('<li>').text(playerNumber+" at "+position+" turns "+orientation));
			if (typeof players[playerNumber] === 'undefined') {
				console.log("Player needs to spawn first before sending updates");
			} else {
				players[playerNumber].position = position;
				players[playerNumber].orientation = orientation;
			}
			if (this.player == playerNumber) {
				if (position[0] === 0 && position[1] === 0 && position[2] === 0) {
					// alert("Beginning again");
				}
			}
		},

		serverscore: function (playerNumber, score) {
			console.log(playerNumber + " " + score);
		},

		servercapability: function () {
			if ( history.pushState ) {
				var href = location.href;
				var i = href.indexOf("#");
				if (i >= 0) {
					href = href.substring(0, i);
				}
				history.pushState( {}, document.title, href+"#"+arguments[0].id );
			}
			this.player = arguments[1];
		},

		spawn: function(shipId, position, orientation) {
			if (this.socket) {
				console.log("Spawning "+shipId);
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
