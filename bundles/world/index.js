var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');

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

		// Object to keep track of timers connected to entities.
		server.entityTimers = {};

		// Start all timers on all entities
		this.restartTimers()
	},

	restartTimers: function() {
		// Restart all timers on all entities.
		var entities = server.db.getAllEntities()
		for (var entityKey in entities) {
			this.restartEntityTimers(entities[entityKey]);
		}
	},

	// Restart all timers for an entity
	restartEntityTimers: function(entity) {
		var entityId = server.db.getId(entity)

		// Make sure to stop existing timers first
		this.stopTimers(entity);
		server.entityTimers[entityId] = [];

		// Start timers for entity
		// Timer for random movement
		if (entity.randomMovementMin) {
			this.newRandomMovementTimer(entity)
		}
	},

	newRandomMovementTimer: function(entity) {
		var entityId = server.db.getId(entity)

		var timerDelay = this.getRandomMovementTimerDelay(entity);

		var timerId = setTimeout(function() {
			// Move in a random direction, if current room has any exits
			var room = server.db.getEntity(entity.location);
			if (room && room.exits && Object.keys(room.exits).length > 0) {
				var exits = Object.keys(room.exits);

				// Get random direction (e, w, s, n, u or d)
				var direction = exits[Math.floor(exits.length * Math.random())];

				// Move in that direction by running it as a command
				this.runCommand(direction, entity);
			}

			// Remove old timer
			var index = server.entityTimers[entityId].indexOf(timerId)
			if (index > -1) {
				server.entityTimers[entityId].splice(index, 1);
			}

			// Start timer again
			this.newRandomMovementTimer(entity);
		}.bind(this), timerDelay);

		server.entityTimers[entityId].push(timerId);

		return timerId
	},

	getRandomMovementTimerDelay: function(entity) {
		var seconds = 1
		if (entity.randomMovementMin && entity.randomMovementMax) {
			seconds = Math.random() * (entity.randomMovementMax - entity.randomMovementMin) + entity.randomMovementMin;
		} else {
			seconds = entity.randomMovementMin;
		}
		return seconds * 1000
	},

	// Stop all timers for an entity
	stopTimers: function(entity) {
		var entityId = server.db.getId(entity)

		if (server.entityTimers[entityId]) {
			var timers = server.entityTimers[entityId];

			for (var i = 0; i < timers.length; i++) {
				clearTimeout(timers[i])
			}
		}

		server.entityTimers[entityId] = [];
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
		// Prepare database
		this.prepareDatabase();
		
		// Increase active player count
		server.activePlayers++;

		// Connect character to player socket.
		server.characterToPlayer[server.db.getId(socket.character)] = socket;
		
		// If no location is set on character, find room with tag "startLocation" and move character there.
		if (!("location" in socket.character)) {
			var startRoom = server.db.getEntitiesByTag('startLocation')[0];

			this.moveObject(socket.character, startRoom);
		};
		
		socket.emit('output', { msg: "Logged into the world as <strong>" + socket.character.name + "</strong>.<br><br>" });

		// Run "look" command to look at the room we're standing in
		this.runCommand("look", socket.character);
	},

	getActivePlayers : function() {
		return server.characterToPlayer;
	},

	getActivePlayerCharacters : function() {
		var characters = [];
		for (var i in server.characterToPlayer) {
			if (server.characterToPlayer[i] && server.characterToPlayer[i].character) {
				characters.push(server.characterToPlayer[i].character);
			}
		}
		return characters;
	},
	
	prepareDatabase : function() {
		var numRooms = server.db.getEntitiesByType("room").length;

		if (numRooms == 0) {

			var room1 = server.db.insertEntity({
					type : "room",
					name : "Starting Room",
					desc : "Welcome to your first room in WebMUD. This is just an example of what can be created.",
					tags : ["startLocation", "outside"],
					x: 0,
					y: 0,
					z: 0 ,
				}
			);
			
			/*var room1 = server.db.insert("objects", {
					type : "room",
					name : "Connected Room",
					desc : "This is a connected room.",
					tags : [],
					coordinates : { x: 0, y: 1, z: 0 },
				}
			);
			
			this.addExit("n", room1, room2);*/
		}
	},
	
	/*addExit : function(direction, fromRoom, toRoom) {
		if (!fromRoom.exits) {
			fromRoom.exits = {};
		}
		
		if (!toRoom.exits) {
			toRoom.exits = {};
		}
		
		fromRoom.exits[direction] = { target : toRoom.$loki }; // , isDoor : true, isClosed : true
		
		var reverseDirections = {
			"n" : "s",
			"s" : "n",
			"w" : "e",
			"e" : "w",
			"d" : "u",
			"u" : "d",
		}
		
		var reverseDirection = reverseDirections[direction];
		
		toRoom.exits[reverseDirection] = { target : fromRoom.$loki }; // , isDoor : true, isClosed : true
	},*/
	
	// Disconnect player character
	disconnectPlayerCharacter : function (socket) {
		// Decrease active players count
		server.activePlayers--;
		
		// Disconnect character from player
		server.characterToPlayer[server.db.getId(socket.character)] = null;
		
		// Remove player from character
		socket.character = null;
		
		// Go to the character-creator
		server.runBundle("character-creator", socket);
	},
	
	// Get socket from character
	getSocketFromCharacter : function (character) {
		return server.characterToPlayer[server.db.getId(character)];
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
				command.run(argumentsString, character, socket);
				
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
			// Get current location
			var currentLocation = server.db.getEntity(object.location);
			
			// Remove this object from current location
			var objectId = server.db.getId(object);
			var index = currentLocation.contents.indexOf(objectId);
			currentLocation.contents.splice(index, 1);
		}
		
		// Set new location
		object.location = server.db.getId(targetObject);
		
		// If we're not already at the new location's contents, add us there
		if (!("contents" in targetObject)) {
			targetObject.contents = [];
		}
		
		if (targetObject.contents.indexOf(server.db.getId(object)) == -1) {
			targetObject.contents.push(server.db.getId(object));
		}
	},
	
	// Find target object by string at character's location, or inventory
	findTargetObject : function (target, character) {
		target = target.toLowerCase(); 
		
		// "Room"
		if (target == "room") {
			return server.db.getEntity(character.location);
		}
		
		// "Self"
		else if (target == "self") {
			return character;
		}
		
		// Try to find object in room
		var room = server.db.getEntity(character.location);

		if (room.contents) {
			for (var i = 0; i < room.contents.length; i++) {
				var objectId = room.contents[i];
				var object = server.db.getEntity(objectId);
				
				// If object name contains target string, consider it a match and return it as target object
				// TODO: Change to match only each word in name (split by space), and only from start of string.
				if (object.name.toLowerCase().indexOf(target) > -1) {
					return object;
				}
			}
		}
		
		// TODO: Try to find object in inventory
	},

	findTargetInObject : function (target, parent) {
		if (parent.contents) {
			for (var i = 0; i < parent.contents.length; i++) {
				var objectId = parent.contents[i];
				var object = server.db.getEntity(objectId);
				
				// If object name contains target string, consider it a match and return it as target object
				// TODO: Change to match only each word in name (split by space), and only from start of string.
				if (object.name.toLowerCase().indexOf(target) > -1) {
					return object;
				}
			}
		}
		return null
	},

	
	// Method for returning gender words for a character. Using male as base to get difference between "his"/"him". (Potential problem: missing difference between "her" and "hers"?)
	getGenderWords : function (character) {
		if (!character.gender) {
			return {
				he : "it",
				his : "its",
				him : "it",
				himself : "itself",
				heCaps : "It",
				hisCaps : "Its",
				himCaps : "It",
				himselfCaps : "Itself",
			};
		} else if (character.gender == "female") {
			return {
				he : "she",
				his : "her",
				him : "her",
				himself : "herself",
				heCaps : "She",
				hisCaps : "Her",
				himCaps : "Her",
				himselfCaps : "Herself",
			};
		} else if (character.gender == "male") {
			return {
				he : "he",
				his : "his",
				him : "him",
				himself : "himself",
				heCaps : "He",
				hisCaps : "His",
				himCaps : "Him",
				himselfCaps : "himself",
			};
		}
	},
	
	// Send a message to a character or a room in the game world. If room, the "exclude" variable can be used to exclude characters from recieving the message
	sendMessage : function (message, target, exclude) {
		// Todo: Move "socket" to separate module, as to not depend on Sockets.IO and easily switch to others? Also add support for color codes in messages
		
		// If exclude is not an array, make it an array
		if (exclude && !Array.isArray(exclude)) {
			exclude = [exclude];
		}

		if (target.type == "character") {
			// If target is character, only send message if we have a player connected to the character
			var socket = this.getSocketFromCharacter(target);
			
			if (socket) {
				// Character has player, so send message
				socket.emit('output', { msg: message });
			}
			
		}
		else if (target.type == "room") {
			// If target is room, send message to all characters within the room, except those in the exclude variable
			for (var i = 0; i < target.contents.length; i++) {
				var object = server.db.getEntity(target.contents[i]);
				
				// Only send message if we have a character.
				if (object.type == "character") {
					// Only send if character is not equal to excluded variable, or is not contained in excluded variable (if it's an array).
					if (!exclude || (exclude.indexOf(object) == -1)) {
						this.sendMessage(message, object);
					}
				}
			}
		}
	},
}
