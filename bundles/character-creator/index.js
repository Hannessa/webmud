var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
	},
	
	// Called when bundle is run
	run : function (socket) {
		this.chooseCharacter(socket);
	},
	
	chooseCharacter : function (socket) {
		// Check how many characters exist on this account
		//var characterCount = 0;
		//if ("characters" in socket.account && socket.account.characters.length > 0) {
			// There are some characters on this. List them.
		
		if (!("characters" in socket.account)) {
			socket.account.characters = [];
		}
		
			socket.emit('output', { msg: "Choose character:" });
			
			var selections = '<div class="selections">';
			selections += "0) [Create new character]<br>"
			
			for (var i = 0; i < socket.account.characters.length; i++) {
				var characterId = socket.account.characters[i];
				var character = server.db.getCollection('objects').get(characterId);
				selections += (i+1) + ") " + character.name + "<br>"

			}
			selections += "</div>"

			socket.emit('output', { msg: selections });

			socket.once('input', function (data) {
				// Check if we got a valid character index from the user
				var characterIndex = parseInt(data.msg)-1;
				if (parseInt(data.msg) == "0") {
					// Input was "0" so create new character.
					this.createCharacter(socket);
				}
				else if (typeof socket.account.characters[characterIndex] != "undefined") {
					// Valid index, login to world
					var characterId = socket.account.characters[characterIndex];
					this.loginWithCharacter(socket, server.db.getCollection('objects').get(characterId));
				} else {
					// Invalid index
					this.chooseCharacter(socket);
				}
			}.bind(this));
			
		/*} else {
			// No characters found, create a new one
			socket.account.characters = [];
			this.createCharacter(socket);
		}*/
		
		//if (socket.account.characters.length == 0) {
		
		//}
	},
	
	createCharacter : function (socket) {
		socket.emit('output', { msg: "Name your character:" });
		
		socket.once('input', function (data) {
			var character = server.db.getCollection("objects").insert({
				name : data.msg,
				type : "character",
				species : "human",
				age : 25,
				playerCharacter : true,
				
			});
			
			socket.account.characters.push(character.$loki);
			
			this.chooseCharacter(socket);
			
			//this.chooseSpecies(socket, character);
			
			
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
