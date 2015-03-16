if (!pc) {
	var pc = {};
	pc.script = (function() {
		var script = {
			 create: function (name, callback) {
				console.log(name);
				callback()();
			},
			attribute: function() {
			}
		};
		return script;
	}());
}

pc.script.attribute('metaServer', 'string', 'http://xnaspacerace-44001.onmodulus.net',
{
    displayName: "Metaserver Connect String"
});

pc.script.create('MetaClient', function (context) {
	var MetaClient = function (entity) {
		this.entity = entity;
		if (typeof io !== 'undefined') {
			this.socket = io('http://xnaspacerace-44001.onmodulus.net:80');
		}
		if (this.socket) {
			// report on game servers from meta server
			this.socket.on('Stats', function(gameServers) {
			    // build table headers
			    var columnSet = [];
			    var headerTr$ = $('<tr/>');

			    var key = "Connect String";
			    columnSet.push(key);
			    headerTr$.append($('<th/>').html(key));

			    key = "# of Players";
			    columnSet.push(key);
			    headerTr$.append($('<th/>').html(key));

			    $("#metaServerTable").append(headerTr$);


			    // build table body
			    for (var host in gameServers) {
				var row$ = $('<tr/>');

				var cellValue = host;
				var td = $('<td/>');
				var anchor = $('<a/>');
				anchor.attr('href', cellValue);
				anchor.html(cellValue);
				td.append(anchor);
 				row$.append(td);

				var cellValue = gameServers[host];
				row$.append($('<td/>').html(cellValue));

				$("#metaServerTable").append(row$);
			    }
			});
			// request game servers from meta server
			this.socket.emit('PlayerInstanceRequest');
		} else {
			alert("Failed to connect to meta server");
		}
	};
	return MetaClient;
});
