var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = [".delete",];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Admin";
		command["helpSyntax"] = [".delete <target>"];		
		command["helpExample"] = [".delete room", ".delete chair"];		
		command["helpText"] = "Deletes an object or room as specified in <target>.";
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {		
		// Make arguments case insensitive
		arguments = arguments.toLowerCase();
		
		// Try to find target object
		var object = world.findTargetObject(arguments, character);

		// Make sure target object was found
		if (!object) {
			world.sendMessage("There's no object/room by that name.", character);
			return
		}

		// Cannot delete player characters
		if (object.type == "character") {
			var socket = world.getSocketFromCharacter(object);
			if (socket) {
				world.sendMessage("You cannot delete player characters.", character);
				return;
			}
		}

		// If object is a room, delete its exits in adjecent rooms as well
		if (object.type == "room") {
			var exits = object.exits;
			var adjecentRoom = null;
			for (var exit in exits) {
				adjecentRoom = server.db.getEntity(exits[exit].target);
				if (adjecentRoom) {
					for (var exit2 in adjecentRoom.exits) {
						if (adjecentRoom.exits[exit2].target == object.$loki) {
							delete adjecentRoom.exits[exit2];
							break;
						}
					}
				}
			}

			// Make sure to move all contents of the room to an adjacent room
			if (adjecentRoom) {
				world.sendMessage("Room was deleted and you and all its contents were moved to an adjecent room.", character);
			} else {
				// No adjecent room found, so move to start location instead
				adjecentRoom = server.db.getEntitiesByTag('startLocation')[0];
				world.sendMessage("Room was deleted and you and all its contents were moved to the starting room.", character);
			}

			// Loop through all contents of the room and move them to the adjecent room
			for (var i = 0; i < object.contents.length; i++) {
				var content = server.db.getEntity(object.contents[i]);
				if (content) {
					// Move content to the adjecent room
					world.moveObject(content, adjecentRoom);

					// Run "look" command to look at the room we're standing in.
					//world.runCommand("look", content);
					if (content != character) {
						world.sendMessage("The current room was deleted so you have been moved to another.", content);
					}
				}
			}

		}

		// Delete object
		server.db.deleteEntity(object);
	}
}