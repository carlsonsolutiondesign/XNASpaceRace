
var crypto = require('crypto');
var fs = require('fs');

var logPath = './logs/';

function Log() {

	this.debugLevel = null;

	this.isOkay = false;
	this.fileStream = null;

	this.logFilename = null;
}


Log.debugLevel = Object.freeze({
	All: {name: 'All', log: false, console: false },
	Connection: { name: 'Connection', log: true, console: true },
	Disconnect: { name: 'Disconnect', log: true, console: true },
	UnrecognizedClient: { name: 'UnrecognizedClient', log: true, console: true },
	ReportPlayers: { name: 'ReportPlayers', log: false, console: false },
	ClientMessage: { name: 'ClientMessage', log: false, console: false },
	ClientJoin: { name: 'ClientJoin', log: true, console: true },
	ClientRejoin: { name: 'ClientRejoin', log: true, console: true },
	ClientSpawn: { name: 'ClientSpawn', log: true, console: true },
	ClientUpdate: { name: 'ClientUpdate', log: true, console: false },
	ClientQuit: { name: 'ClientQuit', log: true, console: true },
	ClientSimulate: { name: 'ClientSimulate', log: true, console: false },
	DispatchMessages: { name: 'DispatchMessages', log: false, console: false },
	NoDispatchMessages: { name: 'NoDispatchMessages', log: false, console: false },
	DispatchNMessages: { name: 'DispatchNMessages', log: false, console: false },
	WritePacket: { name: 'WritePacket', log: true, console: false },
	AppendMessage: { name: 'AppendMessage', log: false, console: false }
});


Log.init = function (logFilename) {
	try {
		var ext = logFilename.substr(logFilename.lastIndexOf('.'));
		var tmpName = logFilename.substr(0, logFilename.lastIndexOf('.')+1) + crypto.randomBytes(8).readUInt32LE(0) + ext;
		fs.rename(logPath + logFilename, logPath + tmpName);

		this.logFilename = logFilename;
		this.fileStream = fs.createWriteStream(logPath + this.logFilename);
		this.isOkay = true;
	} catch (err) {
		console.log('Log.init error: ' + err.message);
	}
}


Log.write = function (level, message) {
	
	if (typeof message === 'undefined')
		message = '';

	if (typeof message !== 'string') {
		message = JSON.stringify(message);
	}
	else {
		message = '"' + message + '"';
	}
	
	if (level.log || this.debugLevel.All.log) {
			if (this.isOkay) {
			this.fileStream.write('{"DateTime": "' + new Date().toJSON() + '", "Message":' + message + '}\n');
		}
	}
	
	if (level.console || this.debugLevel.All.console) {
		console.log(level.name + ": " + message);
	}
}

module.exports = Log;
