var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

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
		
		var output = "<div>Choose character (enter number):</div>";
		
		output += '<div class="selections">';
		
		// Also show option for creating new character
		output += "0) [Create new character]<br>"
		
		// List all characters on this account as 1) <character name>, 2) <character name> etc
		for (var i = 0; i < socket.account.characters.length; i++) {
			var characterId = socket.account.characters[i];
			var character = server.db.getEntity(characterId);
			output += (i+1) + ") " + character.name + "<br>"

		}
		output += "</div>"

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
		socket.emit('output', { msg: "Name your character:" });
		
		socket.once('input', function (data) {
			var character = server.db.insertEntity({
				name : data.msg,
				type : "character",
				species : "human",
				age : 25,
				playerCharacter : true,
				
			});
			
			socket.account.characters.push(server.db.getId(character));
			
			//this.chooseSpecies(socket, character);
			this.chooseCharacter(socket);
			
		}.bind(this));
	},
	/*
	chooseSpecies : function (socket) {
		socket.emit('output', { msg: "Choose your species:" });
		socket.emit('output', { msg: "1) Human " });
		
		socket.once('input', function (data) {
			var character = {
				name : data.msg,
			}
			
			this.chooseSpecies(socket, character);
			
			
		}.bind(this));
	},
	*/
	
	
	
	loginWithCharacter : function (socket, character) {		
		socket.character = character;
		
		server.runBundle("world", socket);
	}
}
