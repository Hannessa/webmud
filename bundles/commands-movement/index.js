var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

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
		
		var currentRoom = server.db.getCollection('objects').get(character.location);
		
		var targetRoom;
		if (currentRoom.exits) {
			if (currentRoom.exits[direction]) {
				// Todo: Also check if direction is closed (i.e. a door)
				var targetRoomId = currentRoom.exits[direction].target;
				targetRoom = server.db.getCollection('objects').get(targetRoomId);

			}
		}
		
		if (targetRoom) {
			// Valid direction, move character
			server.bundles.world.moveObject(character, targetRoom);
			
			if (socket) {
				socket.emit('output', { msg: 'You move in that direction.' }); // Todo: Specify direction
			}
			
			// Todo: Also display to other characters in room that you moved
			
			// Run "look" command to look at the room we're standing in
			server.bundles.world.runCommand("look", character);
			
		}
		else {
			// Invalid direction
			if (socket) {
				socket.emit('output', { msg: 'You cannot move in that direction.' }); // Todo: Specify direction
			}
		}
		

	},
		
	
}
