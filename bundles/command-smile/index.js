var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;
var db = server.db;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["smile"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Social";
		command["helpSyntax"] = ["smile", "smile <target>"];		
		command["helpText"] = "Make your character smile.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Get current room
		var room = db.getEntity(character.location);
		
		if (!arguments) {
			// Smile without target
			world.sendMessage('You smile.', character); // Message to you
			world.sendMessage(character.name + ' smiles.', room, character); // Message to others in room
		}
		else {
			// Smile with target
			
			// Try to find target object
			var target = world.findTargetObject(arguments, character);
			
			if (!target) {
				// Target object not found
				world.sendMessage("There is no one here by that name.", character);
				return;
			}
			else if (target == character) {
				// Smile at yourself
				world.sendMessage('You smile at yourself.', character); // Message to you
				world.sendMessage(character.name + ' smiles at ' + world.getGenderWords(character).himself + '.', room, character); // Message to others in room
			}
			else {
				// Smile at others
				world.sendMessage('You smile at ' + target.name + '.', character); // Message to you
				world.sendMessage(character.name + ' smiles at you.', target); // Message to target
				world.sendMessage(character.name + ' smiles at ' + target.name + '.', room, [character, target]); // Message to others in room
			}
		}
	},
}