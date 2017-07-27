var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["look", "l"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["look", "look <object>"];		
		command["helpText"] = "Examine the current room or a specific object.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, socket) {
		arguments = arguments.toLowerCase(); // We want case insensitive arguments
		
		// Look. No arguments (i.e. "look"), so just view current room
		if (arguments == "") {
			var room = server.db.getCollection('objects').get(socket.character.location);
			
			// Room description
			socket.emit('output', { msg: '<span class="roomTitle">' + room.name + '</span>' });
			socket.emit('output', { msg: '<span class="roomDesc">' + room.desc + '</span>' });
			
			// Contents
			if (room.contents) {
				var contents = [];
				for (var i = 0; i < room.contents.length; i++) {
					var objectId = room.contents[i];
					var object = server.db.getCollection("objects").get(objectId);
					
					if (object.type == "object") {
						contents.push('<span class="object">' + object.name + '</span>');
					} else if (object.type == "character") {
						contents.push('<span class="character">' + object.name + '</span>');

					}
					
				}
				socket.emit('output', { msg: contents.join(", ") });
			}
		}
		
		// Look <object>
		if (arguments) {
			// Find objects in your inventory
			console.log("Todo: Look at object");
			
			var room = server.db.getCollection('objects').get(socket.character.location);
			
			// Find possible objects to look at
		}
	}
}