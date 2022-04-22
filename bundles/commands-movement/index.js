var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

// Commands for moving in different directions.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		
		// West
		var command = {};
		command["keywords"] = ["west", "w"];
		command["run"] = this.runCommandWest.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["west"];		
		command["helpText"] = "Move to the west.";		
		server.commands.push(command);
		
		command = {};
		command["keywords"] = ["east", "e"];
		command["run"] = this.runCommandEast.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["east"];		
		command["helpText"] = "Move to the east.";		
		server.commands.push(command);
		
		command = {};
		command["keywords"] = ["north", "n"];
		command["run"] = this.runCommandNorth.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["north"];		
		command["helpText"] = "Move to the north.";		
		server.commands.push(command);
		
		command = {};
		command["keywords"] = ["south", "s"];
		command["run"] = this.runCommandSouth.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["south"];		
		command["helpText"] = "Move to the south.";		
		server.commands.push(command);
		
		command = {};
		command["keywords"] = ["up", "u"];
		command["run"] = this.runCommandUp.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["up"];		
		command["helpText"] = "Move up.";		
		server.commands.push(command);
		
		command = {};
		command["keywords"] = ["down", "d"];
		command["run"] = this.runCommandDown.bind(this);
		command["helpCategory"] = "Exploration";
		command["helpSyntax"] = ["down"];		
		command["helpText"] = "Move down.";		
		server.commands.push(command);
	},
	
	runCommandWest : function (arguments, character) {
		this.runCommand(arguments, character, "w");
	},
	
	runCommandEast : function (arguments, character) {
		this.runCommand(arguments, character, "e");
	},
	
	runCommandNorth : function (arguments, character) {
		this.runCommand(arguments, character, "n");
	},
	
	runCommandSouth : function (arguments, character) {
		this.runCommand(arguments, character, "s");
	},
	
	runCommandUp : function (arguments, character) {
		this.runCommand(arguments, character, "u");
	},
	
	runCommandDown : function (arguments, character) {
		this.runCommand(arguments, character, "d");
	},
	
	runCommand : function (arguments, character, direction) {
		// Try to get socket if character has a player connected
		var socket = server.bundles.world.getSocketFromCharacter(character);
		
		var currentRoom = server.db.getEntity(character.location);
		
		var targetRoom;
		if (currentRoom.exits) {
			if (currentRoom.exits[direction]) {
				// Todo: Also check if direction is closed (i.e. a door)
				var targetRoomId = currentRoom.exits[direction].target;
				targetRoom = server.db.getEntity(targetRoomId);

			}
		}

		var directions = {
			"w" : "west",
			"e" : "east",
			"n" : "north",
			"s" : "south",
			"u" : "up",
			"d" : "down"
		}
		var directionsOpposite = {
			"w" : "the east",
			"e" : "the west",
			"n" : "the south",
			"s" : "the north",
			"u" : "down",
			"d" : "up"
		}
		
		if (targetRoom) {
			// Valid direction, move character to new room
			world.moveObject(character, targetRoom);
			
			world.sendMessage(`You move ${directions[direction]}.`, character);
			world.sendMessage(`<div class="entityLeaves"><span class="${character.type}">${character.name}</span> moves ${directions[direction]}.</div>`, currentRoom, [character]); // Message to others in old room
			world.sendMessage(`<div class="entityArrives"><span class="${character.type}">${character.name}</span> arrives from ${directionsOpposite[direction]}.</div>`, targetRoom, [character]); // Message to others in new room
			
			// Run "look" command to look at the room we're standing in.
			world.runCommand("look", character);
			
		}
		else {
			// Invalid direction
			world.sendMessage(`You cannot move ${directions[direction]}.`, character);
		}
		

	},
		
	
}
