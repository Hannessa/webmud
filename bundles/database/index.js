var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');
var loki = require('lokijs')

// Sets up a LokiJS database
module.exports = {
	// Called when bundle is loaded
	init : function () {
		// Load database json-file at config.databasePath
		server.db = new loki(config.databasePath, {
			autoload: true, // Load database now into memory
			autoloadCallback: this.databaseInit,
			//autosave: true, // Save database at predefined intervals
			//autosaveInterval: config.databaseSaveDelay, // Save database every 4000 ms (4 seconds)
			//saveCallback: function() { console.log('World saved.'); },
		});
	},
	
	// After database has been loaded or created, make preparations
	databaseInit : function () {
		// Create "accounts" collection for user accounts
		if (server.db.getCollection("accounts") == null) {
			server.accounts = server.db.addCollection('accounts', {}); //  indices: ['email'] 
		}
		
		// Create "accounts" collection for all game objects (characters, rooms, objects)
		if (server.db.getCollection("objects") == null) {
			server.objects = server.db.addCollection('objects', {});
		}
		
		// If no room objects are found, create starting room
		var numRooms = server.db.getCollection('objects').find( {'type':'room'} ).length;
		if (numRooms == 0) {
			var room1 = server.db.getCollection("objects").insert({
				type : "room",
				name : "Starting Room",
				desc : "Welcome to your first room in WebMUD. This is just an example of what can be created.",
				tags : ["startLocation", "outside"],
				coordinates : { x: 0, y: 0, z: 0 },
			});
			
			var room2 = server.db.getCollection("objects").insert({
				type : "room",
				name : "Connected Room",
				desc : "This is a connected room.",
				tags : [],
				coordinates : { x: 0, y: 1, z: 0 },
			});
			
			addExit("n", room1, room2);
			
			console.log("No rooms found. Created starting room.");
		}

		// Auto save option in LokiJS does not seem to work, so we use our own autosave instead
		setInterval(() => {
			server.db.saveDatabase();
			//console.log("Database saved");
		}, config.databaseSaveDelay);
	}
	
}

function addExit(direction, fromRoom, toRoom) {
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
}