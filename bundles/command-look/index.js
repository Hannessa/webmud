var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

// Command to look at the room you're standing in or examine an object.
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
	
	runCommand : function (arguments, character, socket) {		
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// Make arguments case insensitive
		arguments = arguments.toLowerCase();
		
		// "Look". No arguments (i.e. "look" or "look room"), so view current room
		if (arguments == "" || arguments == "room") {
			var room = server.db.getCollection('objects').get(socket.character.location);
			
			if (!room) {
				socket.emit('output', { msg: 'You are floating in empty space. There is no room to look at.' });
				return;
			}
			
			// Room description
			socket.emit('output', { msg: '<span class="roomTitle">' + room.name + '</span>' });
			socket.emit('output', { msg: '<span class="roomDesc">' + room.desc + '</span>' });
			
			// Contents in room
			if (room.contents) {
				var contents = [];
				for (var i = 0; i < room.contents.length; i++) {
					var objectId = room.contents[i];
					var object = server.db.getCollection("objects").get(objectId);
					
					// If object is yourself, don't draw it
					if (object == socket.character) {
						continue;
					}
					
					// Don't display hidden objects
					if (!server.bundles.world.isObjectVisible(object)) {
						continue;
					}
					
					if (object.type == "object") {
						contents.push('<span class="object">' + object.name + '</span>');
					} else if (object.type == "character") {
						contents.push('<span class="character">' + object.name + '</span>');
					}
					
				}
				socket.emit('output', { msg: contents.join(", ") });
			}
			
			// Exits
			if (room.exits) {
				if (room.exits.n) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.n.target);
					socket.emit('output', { msg: 'North: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.s) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.s.target);
					socket.emit('output', { msg: 'South: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.w) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.w.target);
					socket.emit('output', { msg: 'West: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.e) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.e.target);
					socket.emit('output', { msg: 'East: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.u) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.u.target);
					socket.emit('output', { msg: 'Up: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.d) {
					var targetRoom = server.db.getCollection("objects").get(room.exits.d.target);
					socket.emit('output', { msg: 'Down: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
			}
		}
		// "Look <object>". Examine a specific object
		else if (arguments) {
			// Try to find target object
			var object = server.bundles.world.findTargetObject(arguments, character);

			if (object) {
				// We found an object!
				if (object.type == "character") {
					// Character
					socket.emit('output', { msg: '<span class="characterTitle">' + object.name + '</span>' });
					if (object.desc) {
						socket.emit('output', { msg: '<span class="characterDesc">' + object.desc + '</span>' });
					}
				} else {
					// Object
					socket.emit('output', { msg: '<span class="objectTitle">' + object.name + '</span>' });
					if (object.desc) {
						socket.emit('output', { msg: '<span class="objectDesc">' + object.desc + '</span>' });
					}
				}
			}
			else {
				// No object found
				socket.emit('output', { msg: 'There is no object called "' + arguments + '" nearby.' });
			}
		}
	},
}
