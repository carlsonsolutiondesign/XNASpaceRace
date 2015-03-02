pc.script.create('PlayerClient', function(context) {
	var PlayerClient = function (entity) {
		var socket = io();
		this.entity = entity;
		this.socket = socket;
		this.position = [0,0,0,0]; // x, y, z, time
		this.orientation = [0,0,0]; // x, y, z
	};
	PlayerClient.prototype = {
		serverupdate: function(playernumber, position, orientation) {
			console.log(playernumber);
			console.log(position);
			this.position = position;
			console.log(orientation);
			this.orientation = orientation;
		},
		servercapability: function() {
			if ( history.pushState ) {
				var href = location.href;
				var i = href.indexOf("?");
				if (i >= 0) {
					href = href.substring(0, i);
				}
				history.pushState( {}, document.title, href+"?"+arguments[0].id );
			}
			this.player = arguments[1];
		},
		move: function(position, orientation) {
			socket.emit('clientmove', position, orientation);
		},
		delta: function(deltaposition, deltaorientation) {
			this.position[0] += deltaposition[0];
			this.position[1] += deltaposition[1];
			this.position[2] += deltaposition[2];
			this.position[3] += deltaposition[3];
			this.orientation[0] += deltaorientation[0];
			this.orientation[1] += deltaorientation[1];
			this.orientation[2] += deltaorientation[2];
			move(position, orientation);
		}
	};
	socket.on('servercapability', PlayerClient.prototype.servercapability);
	socket.emit('clientrejoin', location.href);
});

