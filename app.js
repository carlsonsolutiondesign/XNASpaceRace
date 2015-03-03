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
var mps = require('./MultiplayerServer');
mps(pc);
