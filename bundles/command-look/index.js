var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

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
			var room = server.db.getEntity(socket.character.location);
			
			if (!room) {
				world.sendMessage('You are floating in empty space. There is no room to look at.', character);
				return;
			}
			
			// Room description
			var output = "";
			output += '<span class="roomTitle">' + room.name + '</span><br>';
			output += '<span class="roomDesc">' + room.desc + '</span><br>';
			
			// Exits
			if (room.exits) {
				/*if (room.exits.n) {
					var targetRoom = server.db.getEntity(room.exits.n.target);
					socket.emit('output', { msg: 'North: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.s) {
					var targetRoom = server.db.getEntity(room.exits.s.target);
					socket.emit('output', { msg: 'South: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.w) {
					var targetRoom = server.db.getEntity(room.exits.w.target);
					socket.emit('output', { msg: 'West: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.e) {
					var targetRoom = server.db.getEntity(room.exits.e.target);
					socket.emit('output', { msg: 'East: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.u) {
					var targetRoom = server.db.getEntity(room.exits.u.target);
					socket.emit('output', { msg: 'Up: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}
				
				if (room.exits.d) {
					var targetRoom = server.db.getEntity(room.exits.d.target);
					socket.emit('output', { msg: 'Down: ' + '<span class="roomTitle">' + targetRoom.name + '</span>' });
				}*/
				
				var validExits = [];
				
				if (room.exits.n) { validExits.push("North"); }
				if (room.exits.e) { validExits.push("East"); }
				if (room.exits.s) { validExits.push("South"); }
				if (room.exits.w) { validExits.push("West"); }
				if (room.exits.u) { validExits.push("Up"); }
				if (room.exits.d) { validExits.push("Down"); }

				if (validExits.length) {
					output += '<div class="roomExits">Exits: ' + validExits.join(", ") + '</div>';
				}
			}
			
			// Contents in room
			if (room.contents) {
				var contents = [];
				for (var i = 0; i < room.contents.length; i++) {
					var objectId = room.contents[i];
					var object = server.db.getEntity(objectId);
					
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
				
				if (contents.length > 0) {
					output += "<br>" + contents.join(", ");
				}
			}
			
			
			
			world.sendMessage(output, character);

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
