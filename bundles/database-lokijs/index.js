var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var loki = require('lokijs');
var fs = require('fs');

// Sets up a LokiJS database
module.exports = {
	// Called when bundle is loaded
	init : function () {
		// Setup abstract database layer
		server.db = this.db;		
		
		// Setup loki database
		server.lokijs = new loki(config.databasePath, {
			//autoload: true, // Load database now into memory
			//autoloadCallback: this.databaseInit.bind(this),
			serializationMethod: 'pretty',
			//autosave: true, // Save database at predefined intervals
			//autosaveInterval: config.databaseSaveDelay, // Save database every 4000 ms (4 seconds)
			//saveCallback: function() { console.log('World saved.'); },
		});

		// Load database
		this.databaseInit();
	},
	
	// Load database
	databaseInit : function () {
		// Attempt to load database file into loki
		if (fs.existsSync(config.databasePath)) {
			// Make sure global variables are preserved by setting it after load
			var json = JSON.parse(fs.readFileSync(config.databasePath))
			var global = json.global
			server.lokijs.loadJSONObject(json);
			server.lokijs.global = global
		}

		if (server.lokijs.getCollection("accounts") == null) {
			// No data found in database, check if backup file is found.
			if (fs.existsSync(config.databasePath + '.bak')) {
				// Backup file found. Try to replace new database file with this one.
				console.log("No data found in database but backup file found. Restoring from backup file.");
				fs.renameSync(config.databasePath + '.bak', config.databasePath);
				this.databaseInit()
				return;
			}
			else {
				// No backup file, so create new database
				console.log("No database found, creating new database.");
				server.lokijsData = {};
				
				// Create "accounts" collection for user accounts
				if (server.lokijs.getCollection("accounts") == null) {
					server.lokijsData["accounts"] = server.lokijs.addCollection('accounts', {}); //  indices: ['email'] 
				}
				
				// Create "entity" collection for all game entities (characters, rooms, objects)
				if (server.lokijs.getCollection("entities") == null) {
					server.lokijsData["entities"] = server.lokijs.addCollection('entities', {});
				}
				
				// Save new database to file
				server.lokijs.saveDatabase();
			}
		}
		else {
			// Data was found in database, so just load collections
			server.lokijsData = {};
			server.lokijsData["accounts"] = server.lokijs.getCollection('accounts'); //  indices: ['email'] 
			server.lokijsData["entities"] = server.lokijs.getCollection('entities'); //  indices: ['email'] 
		}
		
		server.db.isLoaded = true;

		// Setup global scope
		if (!server.lokijs.global) {
			server.lokijs.global = {};
		}
		server.db.global = server.lokijs.global;

		// Setup autosave at regular intervals
		setInterval(() => {
			// Save old file as backup, then save database
			try {
				fs.copyFileSync(config.databasePath, config.databasePath + '.bak')
				server.lokijs.saveDatabase();
			} catch (err) {
		  		console.error(err)
			}
		}, config.databaseSaveDelay);
	},
	
	// ************ Abstract database functions ************ //
	db : {
		isLoaded : false,
		
		count : function(type) {
			return server.lokijsData[type].count();
		},
		
		insert : function(type, data) {
			return server.lokijsData[type].insert(data);
		},

		deleteEntity: function(object) {
			return server.lokijsData["entities"].remove(object);
		},
		
		insertEntity : function(data) {
			return server.lokijsData["entities"].insert(data);
		},
		
		insertAccount : function(data) {
			return server.lokijsData["accounts"].insert(data);
		},
		
		get : function(type, id) {
			return server.lokijsData[type].get(id);
		},
		
		getEntity : function(id) {
			return server.lokijsData["entities"].get(id);
		},
		
		getAccount : function(id) {
			return server.lokijsData["accounts"].get(id);
		},
		
		getEntitiesByTag : function(tagName) {
			return server.lokijsData["entities"].find({ 'tags' : { '$contains' : tagName } });
		},
		
		getEntitiesByType : function(type) {
			return server.lokijsData["entities"].find({'type': type});
		},
		
		query : function(type, query) {
			return server.lokijsData[type].find(query);
		},

		queryEntities : function(query) {
			return server.lokijsData["entities"].find(query);
		},

		getId : function(object) {
			return object.$loki;
		},

		//getRoomAtLocation(x, y, z) {
		//	server.db.query('entities', {'x': x,  } );
		//}
	
	}
}

