const chalk = require("chalk");
var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');

// Displays a welcome message to the user and then runs bundle "login". This is the default starting bundle that is run when a user first connects to the MUD.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		this.serverStartTime = new Date();
	},
	
	// Called when bundle is run
	run : function (socket) {
		var output = "";
		
		output += config.welcomeMessage;

		if (config.showServerInfo) {
			output += "\n\n" + chalk.bold("Server info") + "\n";
			output += "Logged in workers: " + server.activePlayers + " of " + server.db.count('accounts') + "\n";
			if (server.db.isLoaded) {
				output += "BotNet: " + server.db.getEntitiesByType('room').length + " locations, " + server.db.getEntitiesByType('character').length + " bots, " + server.db.getEntitiesByType('object').length + " discoveries\n";
			}
			output += "Commands supported: " + server.commands.length + "\n";
			output += "Uptime: " + getDuration(this.serverStartTime, new Date()) + "\n";
		}

		socket.emit('output', { msg: output });
		
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

	// Extract days
    var days = parseInt( hours / 24 );
	hours = hours % 24;

    return days + " days, "+hours+" hours, "+minutes+" minutes, "+ Math.round(seconds)+ " seconds";
}