var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

// Command to look at the room you're standing in or examine an object.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["get", "g"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Interaction";
		command["helpSyntax"] = ["get <object>"];		
		command["helpText"] = "Try to pick up <object> into your inventory.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {		
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// Make arguments case insensitive
		arguments = arguments.toLowerCase();
		
		// "Get" without arguments
		if (arguments == "") {
			world.sendMessage("What do you want to get?", character);
			return;
		}
		
		// Get current room
		var room = server.db.getEntity(character.location);

		// Try to find target object
		var object = world.findTargetInObject(arguments, room);

		if (!object) {
			// No object found
			world.sendMessage('There is no object called "' + arguments + '" nearby.', character);
			return
		}


		// TODO: Check object's weight
		//if (object.weight && character.contentsMaxWeight &&  > character.inventory.getFreeSpace()) {
		//	world.sendMessage("That is too heavy to pick up.", character);
		//}

		if (object == character) {
			world.sendMessage("You can't pick yourself up.", character);
			return
		}

		// Place object in character inventory instead
		world.moveObject(object, character);

		world.sendMessage("You pick up " + object.name + ".", character);
	},
}
