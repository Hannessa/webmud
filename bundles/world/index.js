var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

module.exports = {	
	// Called when bundle is loaded
	init : function () {
		// Load all commands
		if (!("commands" in server)) { server.commands = []; }
		
		
	},
	

	// Called when bundle is run
	run : function (socket) {
		
		this.connectPlayerToWorld(socket);
		
		// Parse commands
		socket.on('input', function (data) {
			this.runCommand(data.msg, socket);
		}.bind(this));
	},
	
	connectPlayerToWorld : function (socket) {
		socket.emit('output', { msg: "Logged into the world as <strong>" + socket.character.name + "</strong>.<br><br>" });
		
		// If no location is set on character, find room with tag "startLocation" and move it there.
		if (!("location" in socket.character)) {
			var startRoom = server.db.getCollection("objects").find({ 'tags' : { '$contains' : 'startLocation' } })[0];
			this.moveObject(socket.character, startRoom);
		};
		
		// Run "look" command to look at the room we're standing in
		this.runCommand("look", socket);
	},
	
	runCommand : function (message, socket) {
		// Places first parameter in [1] and remaining string in [2]
		var parsedInput = message.match(/^(\S+)(?:\s+(.+))?/i);
		var commandString = parsedInput[1].toLowerCase(); // Commands are always lower case
		var argumentsString = parsedInput[2] ? parsedInput[2] : "";
		
		//this.socket.emit('output', { msg: "Command entered in world" });
		//socket.emit('output', { msg: "Command: " + command });
		//socket.emit('output', { msg: "Arguments: " + arguments });
		
		// Loop through all commands until we have a match
		var hasMatch = false;
		for (var i = 0; i < server.commands.length; i++) {
			var command = server.commands[i];

			// Check if the typed in command matches any of the current command's keywords
			if (command.keywords.indexOf(commandString) != -1) {
				// We have a match! Run command
				command.run(argumentsString, socket);
				
				// And exit from loop, we don't want more matches.
				hasMatch = true;
				break;
			}
		}
		
		if (!hasMatch) {
			socket.emit('output', { msg: "That's not a valid command. Type 'help' for a list of commands." });
		}
	},
	
	// Move an object to targetObject
	moveObject : function (object, targetObject) {
		// Check if the object is at any location currently
		if ("location" in object.location) {
			// Get current location object
			var currentObject = server.db.getCollection("objects").get(object.location);
			// Remove us from current location
			var index = currentObject.contents.indexOf(object.$loki);
			currentObject.contents.splice(index, 1);
		}
		
		// Set new location
		object.location = targetObject.$loki;
		
		// If we're not already at the new location's contents, add us there
		if (targetObject.contents.indexOf(object.$loki) == -1) {
			targetObject.contents.push(object.$loki);
		}
	},
	
	
}

/*setInterval(() => {
			socket.character.name += "a";
			socket.emit('output', { msg: "Changed character name to  <strong>" + socket.character.name + "</strong>." });

		}, 1000);*/