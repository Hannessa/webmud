var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var uuidv4 = require('uuid').v4;

// After logging in, this bundle is run to help you create and choose an in-game character to play with.
module.exports = {
	// Called when bundle is loaded
	init : function () {
	},
	
	// Called when bundle is run
	run : function (socket) {
		this.chooseCharacter(socket);
	},
	
	// Show "Choose character" selection screen
	chooseCharacter : function (socket) {
		// Make sure that the account has a characters array.
		if (!("characters" in socket.account)) {
			socket.account.characters = [];
		}
		
		var output = "Choose bot (enter number):\n";
		
		// Also show option for creating new character
		output += "0) [Register new bot]\n"
		
		// List all characters on this account as 1) <character name>, 2) <character name> etc
		for (var i = 0; i < socket.account.characters.length; i++) {
			var characterId = socket.account.characters[i];
			var character = server.db.getEntity(characterId);
			output += (i+1) + ") " + character.name + "\n"

		}
		output += "\n"

		socket.emit('output', { msg: output });

		// Listen for input from user
		socket.once('input', function (data) {
			// Check if we got a valid character index from the user
			var characterIndex = parseInt(data.msg)-1;
			if (parseInt(data.msg) == "0") {
				// Input was "0" so create new character.
				this.createCharacter(socket);
			}
			else if (typeof socket.account.characters[characterIndex] != "undefined") {
				// Valid character choice, so login to world with this character
				var characterId = socket.account.characters[characterIndex];
				this.loginWithCharacter(socket, server.db.getEntity(characterId));
			} else {
				// Invalid character choice
				this.chooseCharacter(socket);
			}
		}.bind(this));
	},
	
	// Create a new character
	createCharacter : function (socket) {
		var name = this.botNamesFirst[Math.floor(Math.random() * this.botNamesFirst.length)]
			+ ' ' + this.botNamesSecond[Math.floor(Math.random() * this.botNamesSecond.length)];
		var uuid = uuidv4()
		socket.emit('output', { msg: "You have been assigned bot: " + name + ' / ' + uuid });
		
		var character = server.db.insertEntity({
			name : name,
			uuid : uuid,
			type : "og-bot",
			level : 1,
			playerCharacter : true,
			
		});
		
		socket.account.characters.push(server.db.getId(character));
		
		this.chooseCharacter(socket);
	},
	
	loginWithCharacter : function (socket, character) {		
		socket.character = character;
		
		server.runBundle("world", socket);
	},

	"botNamesFirst": [
		"Scan",
		"Displace",
		"Reduction",
		"Ridge",
		"Soap",
		"Stab",
		"Dull",
		"Polish",
		"Dash",
		"Remain",
		"Light",
		"Squash",
		"Cherry",
		"Rational",
		"Mystery",
		"Tough",
		"Glare",
		"Denial",
		"Jest",
		"Polite",
		"Spite",
		"Complex",
		"Raw",
		"Fast",
		"Spy",
		"Distant",
		"Lawful",
		"Techno",
		"Neon"
	],

	"botNamesSecond": [
		"Sun",
		"Hiccup",
		"Carrot",
		"Motor",
		"Cave",
		"Pig",
		"Ant",
		"Rise",
		"Hold",
		"Spectrum",
		"Wing",
		"Stitch",
		"Score",
		"Clone",
		"Deed"
	]
}
