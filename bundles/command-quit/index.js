var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');

// Command for disconnecting from a character.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["quit", "q", "exit"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Meta";
		command["helpSyntax"] = ["quit"];		
		command["helpText"] = "Quits the game and disconnects from your character.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character) {
		// Try to get socket if character has a player connected
		var socket = server.bundles.world.getSocketFromCharacter(character);
		
		// Command is only interesting for player characters
		if (!socket) { return; }
		
		// Disconnect character
		server.bundles.world.disconnectPlayerCharacter(socket);
		
	}
}