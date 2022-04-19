const config = require.main.require('./config.js');
const server = require.main.require('./bundles/server.js');

// command for disconnecting from a character.
module.exports = {
	// called when bundle is loaded
	init : function () {
		const command = {};

		command["keywords"] = ["quit", "q", "exit"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Meta";
		command["helpSyntax"] = ["quit"];		
		command["helpText"] = "Quits the game and disconnects from your character.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character) {
		// try to get socket if character has a player connected
		const socket = server.bundles.world.getSocketFromCharacter(character);

		// Command is only interesting for player characters
		if (!socket) { return; }
		
		// Disconnect character
		server.bundles.world.disconnectPlayerCharacter(socket);
	}
}