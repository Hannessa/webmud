var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = [".create",];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Admin";
		command["helpSyntax"] = [".create <templateName>", ".create object <name>", ".create character <name>"];		
		command["helpExample"] = [".create chair", ".create cat", ".create object table", ".create"];		
		command["helpText"] = "Creates an object/character by the name of <name> and places it in the current room. If template is found, use this. Otherwise, offer to create object or character from scratch.";
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Make arguments case insensitive
		arguments = arguments.toLowerCase().split(/\s(.+)/);

		var entity = {};

		if (arguments[0] == "object" || arguments[0] == "character") {
			// Create new object/character from scratch (not from template)
			var type = arguments[0];

			var name = "Unnamed " + type;
			if (arguments[1]) {
				name = arguments[1];
			}
			
			entity = {
				"type": type,
				"name": name,
			}

			world.sendMessage("Created " + type + " from scratch with name " + name, character);


		} else {
			// Create new object/character from template
			var templateName = arguments[0];

			//if (config.templates[templateName]) {
			//	entity = config.templates[templateName];
			//} else {
				// Template not found
				world.sendMessage("No template found by that name. To create a completely new object or character, type: .create object <name> or .create character <name>", character);
				return;
			//}
		}

		entity = server.db.insertEntity(entity);

		// Move new object to current room
		currentRoom = server.db.getEntity(character.location);
		world.moveObject(entity, currentRoom);

	}
}