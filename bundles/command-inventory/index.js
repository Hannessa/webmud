var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;
var db = server.db;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["inventory", "i", "inv"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Interaction";
		command["helpSyntax"] = ["inventory"];		
		command["helpText"] = "View what you're carrying in your inventory.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (args, character, socket) {
		// Contents in room
		if (!character.contents) {
			world.sendMessage('You are carrying nothing.', character);
			return;
		}


		var contents = [];
		var contentsWeight = 0;
		var output = "";
		for (var i = 0; i < character.contents.length; i++) {
			var objectId = room.contents[i];
			var object = server.db.getEntity(objectId);
			var weight = 0;
			if (object.weight) {
				weight = object.weight;
			}
			contentsWeight += weight;

			// Don't display hidden objects
			if (!server.bundles.world.isObjectVisible(object)) {
				continue;
			}
			
			if (object.type == "object") {
				contents.push('<span class="object">' + object.name + '</span> - ' + weight + ' kg');
			} else if (object.type == "character") {
				contents.push('<span class="character">' + object.name + '</span> - ' + weight + ' kg');
			}
		}
		
		if (character.contentsMaxWeight) {
			output += "You are carrying " + contentsWeight + " of " + character.contentsMaxWeight + " kg:<br><br>";
		} else {
			output += "You are carrying " + contentsWeight + " kg:<br><br>";
		}
		output += contents.join("<br>");

	},
}