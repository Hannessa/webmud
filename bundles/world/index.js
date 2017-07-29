var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

// After choosing a character, you're sent into the game world. This bundle also handles parsing of in-game commands, so should be loaded before any other commands bundles.
module.exports = {	
	// Called when bundle is loaded
	init : function () {
		// Prepare commands array.
		if (!("commands" in server)) { server.commands = []; }
		
		// Prepare active player count.
		server.activePlayers = 0;
		
		// Object to keep track of player controlled characters.
		server.characterToPlayer = {};
	},
	
	// This is called when a user has chosen a character and enters the game world.
	run : function (socket) {
		// Connect player to world
		this.connectPlayerCharacter(socket);
		
		// Start parsing commands
		socket.on('input', function (data) {
			this.runCommand(data.msg, socket.character);
		}.bind(this));
		
		// Listener for when user disconnects
		socket.on('disconnect', function () {
			this.disconnectPlayerCharacter(socket);
		}.bind(this));
	},
	
	// Connect player character to the world
	connectPlayerCharacter : function (socket) {
		// Increase active player count
		server.activePlayers++;

		// Connect character to player socket.
		server.characterToPlayer[socket.character.$loki] = socket;
		
		// If no location is set on character, find room with tag "startLocation" and move character there.
		if (!("location" in socket.character)) {
			var startRoom = server.db.getCollection("objects").find({ 'tags' : { '$contains' : 'startLocation' } })[0];
			this.moveObject(socket.character, startRoom);
		};
		
		socket.emit('output', { msg: "Logged into the world as <strong>" + socket.character.name + "</strong>.<br><br>" });

		// Run "look" command to look at the room we're standing in
		this.runCommand("look", socket.character);
	},
	
	// Disconnect player character
	disconnectPlayerCharacter : function (socket) {
		// Decrease active players count
		server.activePlayers--;
		
		// Disconnect character from player
		server.characterToPlayer[socket.character.$loki] = null;
		
		// Remove player from character
		socket.character = null;
		
		// Go to the character-creator
		server.runBundle("character-creator", socket);
	},
	
	// Get socket from character
	getSocketFromCharacter : function (character) {
		return server.characterToPlayer[character.$loki];
	},
	
	// Check if game object is visible
	isObjectVisible : function (object) {
		isVisible = true;
		
		// Player characters that don't have a player connected should not be visible
		if (object.playerCharacter && !this.getSocketFromCharacter(object)) {
			isVisible = false;
		}
		
		return isVisible;
	},
	
	// Run a command for a specific character
	runCommand : function (message, character) {
		
		
		// Try to get socket if character has a player connected
		var socket = this.getSocketFromCharacter(character);
		
		// Places first parameter in [1] and remaining string in [2]
		var parsedInput = message.trim().match(/^(\S+)(?:\s+(.+))?/i);
		var commandString = parsedInput && parsedInput[1] ? parsedInput[1].toLowerCase() : ""; // Commands are always lower case
		var argumentsString = parsedInput && parsedInput[2] ? parsedInput[2] : "";
		
		// Loop through all commands until we have a match
		var hasMatch = false;
		for (var i = 0; i < server.commands.length; i++) {
			var command = server.commands[i];

			// Check if the typed in command matches any of the current command's keywords
			if (command.keywords.indexOf(commandString) != -1) {
				// We have a match! Run command
				command.run(argumentsString, character);
				
				// And exit from loop, we don't want more matches.
				hasMatch = true;
				break;
			}
		}
		
		if (!hasMatch && socket) {
			socket.emit('output', { msg: "That's not a valid command. Type 'help' for a list of commands." });
		}
	},
	
	// Move an object to targetObject
	moveObject : function (object, targetObject) {
		// Check if the object is at any location currently
		if ("location" in object) {
			// Get current location object
			var currentObject = server.db.getCollection("objects").get(object.location);
			// Remove us from current location
			var index = currentObject.contents.indexOf(object.$loki);
			currentObject.contents.splice(index, 1);
		}
		
		// Set new location
		object.location = targetObject.$loki;
		
		// If we're not already at the new location's contents, add us there
		if (!("contents" in targetObject)) {
			targetObject.contents = [];
		}
		
		if (targetObject.contents.indexOf(object.$loki) == -1) {
			targetObject.contents.push(object.$loki);
		}
	},
	
	
}

/*setInterval(() => {
			socket.character.name += "a";
			socket.emit('output', { msg: "Changed character name to  <strong>" + socket.character.name + "</strong>." });

		}, 1000);*/