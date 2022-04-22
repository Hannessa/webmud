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

		var room = server.db.getEntity(socket.character.location);

		// "Look". No arguments (i.e. "look" or "look room"), so view current room
		if (arguments == "" || arguments == "room") {
			if (!room) {
				world.sendMessage('You are floating in empty space. There is no room to look at.', character);
				return;
			}
			
			// Room description
			var output = "";
			output += '<span class="roomTitle">' + room.name + '</span>';
			if (room.desc) {
				output += '<br><span class="roomDesc">' + room.desc + '</span>';
			}
			
			// Exits
			if (room.exits && Object.keys(room.exits).length > 0) {
				output += '<div class="roomExits">'

				if (room.exits.n) {
					var targetRoom = server.db.getEntity(room.exits.n.target);
					output += '<span class="exit">North -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';
				}
				
				if (room.exits.e) {
					var targetRoom = server.db.getEntity(room.exits.e.target);
					output += '<span class="exit">East -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';
				}

				if (room.exits.w) {
					var targetRoom = server.db.getEntity(room.exits.w.target);
					output += '<span class="exit">West -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';
				}				

				if (room.exits.s) {
					var targetRoom = server.db.getEntity(room.exits.s.target);
					output += '<span class="exit">South -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';
				}
				
				if (room.exits.u) {
					var targetRoom = server.db.getEntity(room.exits.u.target);
					output += '<span class="exit">Up -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';
				}
				
				if (room.exits.d) {
					var targetRoom = server.db.getEntity(room.exits.d.target);
					output += '<span class="exit">Down -</span> ' + '<span class="exitTitle">' + targetRoom.name + '</span><br>';

				}

				output += '</div>'

				/*var validExits = [];
				
				if (room.exits.n) { validExits.push("North"); }
				if (room.exits.e) { validExits.push("East"); }
				if (room.exits.s) { validExits.push("South"); }
				if (room.exits.w) { validExits.push("West"); }
				if (room.exits.u) { validExits.push("Up"); }
				if (room.exits.d) { validExits.push("Down"); }

				if (validExits.length) {
					output += '<div class="roomExits">Exits: ' + validExits.join(", ") + '</div>';
				}*/
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
					output += '<div class="roomContents">'
					output += contents.join(", ");
					output += '</div>'
				}
			}
			
			
			
			world.sendMessage(output, character);

		}
		// "Look <object>". Examine a specific object
		else if (arguments) {
			// Look at sky to see time
			if (arguments == "sky") {
				if (server.bundles['command-time']) {
					world.runCommand("time", character);
					return
				}
			}

			// Try to find target object in room
			var object = server.bundles.world.findTargetInObject(arguments, room);

			// Try to find target object in inventory
			if (!object) {
				var object = server.bundles.world.findTargetInObject(arguments, character);
			}

			// If we're looking at self
			if (arguments == "self") {
				object = character;
			}

			if (!object) {
				world.sendMessage('You do not see that here.', character);
				//world.sendMessage('There is nothing called "' + arguments + '" nearby.', character);
				return;
			}

			// We found an object!
			var message = "<div class='" + object.type + "-info'>";
			message += "<div class='name'>" + object.name + "</div>";

			if (object.desc) {
				message += "<div class='desc'>" + object.desc + "</div>";
			}

			if (object.weight) {
				message += "<div class='weight'>Weight: " + object.weight + " kg</div>";
			}

			// Contents in object (not characters as they should have hidden inventory)
			if (object.contents && object.type == "object") {
				var contents = [];
				for (var i = 0; i < object.contents.length; i++) {
					var objectId = object.contents[i];
					var entity = server.db.getEntity(objectId);
					
					// If object is yourself, don't draw it
					if (entity == socket.character) {
						continue;
					}
					
					// Don't display hidden objects
					if (!server.bundles.world.isObjectVisible(entity)) {
						continue;
					}
					
					if (entity.type == "object") {
						contents.push('<span class="object">' + entity.name + '</span>');
					} else if (entity.type == "character") {
						contents.push('<span class="character">' + entity.name + '</span>');
					}
					
				}
				
				if (contents.length > 0) {
					output += '<div class="contentsTitle">Contents:</div>'
					output += '<div class="contents">'
					output += contents.join(", ");
					output += '</div>'
				}
			}

			// Equipment on characters should be visible
			if (object.equipment) {
				var equipment = [];
				for (var i = 0; i < object.equipment.length; i++) {
					var objectId = object.equipment[i];
					var entity = server.db.getEntity(objectId);
					
					// If object is yourself, don't draw it
					if (entity == socket.character) {
						continue;
					}
					
					// Don't display hidden objects
					if (!server.bundles.world.isObjectVisible(entity)) {
						continue;
					}
					
					equipment.push('<span class="' + entity.type + '">' + entity.name + '</span>'); // TODO: Also display where is equipped (finger, head, etc) or possibly item type (ring, helmet, etc)
					
				}

				if (equipment.length > 0) {
					output += '<div class="equipmentTitle">Equipment:</div>'
					output += '<div class="equipment">'
					output += equipment.join("");
					output += '</div>'
				}
				message += "<div class='equipped'>Equipped</div>";
			}

			world.sendMessage(message, character);
		}
	},
}
