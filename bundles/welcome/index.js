var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

// Displays a welcome message to the user and then runs bundle "login". This is the default starting bundle that is run when a user first connects to the MUD.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		this.serverStartTime = new Date();
	},
	
	// Called when bundle is run
	run : function (socket) {
		socket.emit('output', { msg: "Hello adventurer! Welcome to <strong>" + config.info.name + "</strong>.<br><br>" });
		socket.emit('output', { msg: "<strong>Server info</strong>" });
		socket.emit('output', { msg: "Active players: " + server.activePlayers });
		if (server.db.isLoaded) {
			socket.emit('output', { msg: "World: " + server.db.getEntitiesByType('room').length + " rooms, " + server.db.getEntitiesByType('character').length + " characters, " + server.db.getEntitiesByType('object').length + " objects"});
		}
		socket.emit('output', { msg: "Commands supported: " + server.commands.length });
		socket.emit('output', { msg: "Uptime: " + getDuration(this.serverStartTime, new Date()) });
		socket.emit('output', { msg: "<br>" });

		server.runBundle("login", socket);
	},
}

function getDuration(startDate, endDate) {
	return msToHMS(endDate - startDate);
}

function msToHMS( ms ) {
    // 1- Convert to seconds:
    var seconds = ms / 1000;
    // 2- Extract hours:
    var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return hours+" hours, "+minutes+" minutes, "+ Math.round(seconds)+ " seconds";
}