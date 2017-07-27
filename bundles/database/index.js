var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');
var loki = require('lokijs')

module.exports = {
	// Called when bundle is loaded
	init : function () {
		server.db = new loki(config.databasePath, {
			autoload: true, // Load database now into memory
			//autosave: true, // Save database at predefined intervals
			//autosaveInterval: config.databaseSaveDelay, // Save database every 4000 ms (4 seconds)
			autoloadCallback: this.databaseSetup,
			//saveCallback: function() { console.log('World saved.'); },
		}); // , { autoupdate: true } // , {autosave: true, autosaveInterval: 5000, autoload: true}
		
	},
	
	
	databaseSetup : function () {
		if (server.db.getCollection("accounts") == null) {
			server.accounts = server.db.addCollection('accounts', {}); //  indices: ['email'] 
		}
		
		if (server.db.getCollection("objects") == null) {
			server.objects = server.db.addCollection('objects', {});
		}
		
		// If no room objects are found, create starting room
		var numRooms = server.db.getCollection('objects').find( {'type':'room'} ).length;
		if (numRooms == 0) {
			var room = server.db.getCollection("objects").insert({
				type : "room",
				name : "Starting Room",
				desc : "Welcome to your first room in WebMUD. This is just an example of what can be created.",
				tags : ["startLocation"],
				coordinates : { x: 0, y: 0, z: 0 },
				isOutdoor : true,
			});
			
			console.log("No rooms found. Created starting room.");
		}

		// Auto save option does not seem to work, so we do our own autosave
		setInterval(() => {
			server.db.saveDatabase();
			//console.log("Database saved");
		}, config.databaseSaveDelay);
	}
	
}