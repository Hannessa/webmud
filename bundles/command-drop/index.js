var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

// Command to look at the room you're standing in or examine an object.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["drop",];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["drop <object>"];		
		command["helpText"] = "Drop <object> from your inventory into the current room.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {		
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// Make arguments case insensitive
		arguments = arguments.toLowerCase();
		
		// "Get" without arguments
		if (arguments == "") {
			world.sendMessage("What do you want to drop?", character);
			return;
		}
		
		// Get current room
		var room = server.db.getEntity(character.location);

		// Try to find target object
		var object = world.findTargetInObject(arguments, character);

		if (!object) {
			// No object found
			world.sendMessage('There is no object called "' + arguments + '" in your inventory.', character);
			return
		}

		// Place object in room
		world.moveObject(object, room);

		world.sendMessage("You drop " + object.name + ".", character);
	},
}
