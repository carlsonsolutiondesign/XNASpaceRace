pc.script.attribute('connection', 'string', 'http://localhost:51000',
{
    displayName: "Remote Game Connection"
});
pc.script.create('PlayerClient', function(context) {
	var PlayerClient = function (entity) {
		this.entity = entity;
		this.position = [0,0,0,0]; // x, y, z, time
		this.orientation = [0,0,0]; // x, y, z
	};

	PlayerClient.prototype = {
	    initialize: function () {
		console.log(this.connection);
		var connection = "missing socket.io script in index.html";
		if (typeof io !== 'undefined') {
            		connection = context.root.findByName(this.connection);
			this.socket = io.connect(connection);
		}
		if (this.socket) {
			this.socket.on('servermessage', this.servermessage, this);
			this.socket.on('serverupdate', this.serverupdate, this);
			this.socket.on('serverscore', this.serverscore, this);
			this.socket.on('servercapability', this.servercapability, this);
			this.socket.emit('clientrejoin', location.href);
		} else {
			console.log("Failed to connect to "+connection);
		}
	        this.on('serverspawn', this.serverspawn, this);
	    },

		servermessage: function(msg) {
			console.log(msg);
		},

		serverspawn: function (playernumber, position, orientation) {
		    console.log('Respawn: playerId: ' + playernumber
                      + '  position: (' + position.x.toFixed(3) + ', ' + position.y.toFixed(3) + ', ' + position.z.toFixed(3) + ')'
                      + '  orientation: (' + orientation.x.toFixed(3) + ', ' + orientation.y.toFixed(3) + ', ' + orientation.z.toFixed(3) + ')');

		    this.position = position;
		    this.orientation = orientation;
		    this.move(this.position, this.orientation);
		},

		serverupdate: function (playernumber, position, orientation) {
			console.log(playernumber);
			console.log(position);
			this.position = position;
			console.log(orientation);
			this.orientation = orientation;
		},

		serverscore: function (playernumber, score) {
			console.log(playernumber + " " + score);
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

