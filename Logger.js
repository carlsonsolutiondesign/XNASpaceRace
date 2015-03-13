
var fs = require('fs');

function Log() {

	this.debugLevel = null;

	this.isOkay = false;
	this.fileStream = null;

	this.logFilename = null;
}


Log.debugLevel = Object.freeze({
	All: {name: 'All', enabled: false },
	Connection: { name: 'Connection', enabled: true },
	Disconnect: { name: 'Disconnect', enabled: true },
	UnrecognizedClient: { name: 'UnrecognizedClient', enabled: true },
	ReportPlayers: { name: 'ReportPlayers', enabled: false },
	ClientMessage: { name: 'ClientMessage', enabled: false },
	ClientJoin: { name: 'ClientJoin', enabled: true },
	ClientRejoin: { name: 'ClientRejoin', enabled: true },
	ClientSpawn: { name: 'ClientSpawn', enabled: true },
	ClientUpdate: { name: 'ClientUpdate', enabled: false },
	ClientQuit: { name: 'ClientQuit', enabled: true },
	ClientSimulate: { name: 'ClientSimulate', enabled: true },
	DispatchMessages: { name: 'DispatchMessages', enabled: false },
	NoDispatchMessages: { name: 'NoDispatchMessages', enabled: false },
	DispatchNMessages: { name: 'DispatchNMessages', enabled: false },
	WritePacket: { name: 'WritePacket', enabled: true },
	AppendMessage: { name: 'AppendMessage', enabled: false }
});


Log.init = function (logFilename) {
	try {
		this.logFilename = logFilename;
		this.fileStream = fs.createWriteStream(this.logFilename);
		this.isOkay = true;
	} catch (err) {
		console.log('Log.init error: ' + err.message);
	}
}


Log.write = function (level, message) {
	
	if (typeof message === 'undefined')
		message = '';

	if (level.enabled || this.debugLevel.All.enabled) {

		if (typeof message !== 'string') {
			message = JSON.stringify(message);
			
			if (this.isOkay) {
				this.fileStream.write(message + '\n');
			}
		}
		
		console.log(level.name + ": " + message);
	}
}

module.exports = Log;
