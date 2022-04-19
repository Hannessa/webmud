const chalk = require("chalk");
const config = require.main.require('./config.js');
const server = require.main.require('./bundles/server.js');
const uuidv4 = require('uuid').v4;

// after logging in, this bundle is run to help you create and choose an in-game character to play with.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		// nothing to do
	},
	
	// called when bundle is run
	run : function (socket) {
		this.chooseCharacter(socket);
	},
	
	// show "Choose character" selection screen
	chooseCharacter : function (socket) {
		// make sure that the account has a characters array.
		if (!("characters" in socket.account)) {
			socket.account.characters = [];
		}

		let output = chalk.white("Choose bot (enter number):\n");

		// also show option for creating new character
		output += "0) " + chalk.yellow("[Register new bot]\n")
		
		// list all characters on this account as 1) <character name>, 2) <character name> etc
		for (let i = 0; i < socket.account.characters.length; i++) {
			const characterId = socket.account.characters[i];
			const character = server.db.getEntity(characterId);
			output += (i+1) + ") " + chalk.greenBright(character.name) + "\n"
		}
		output += "\n"

		socket.emit('output', { msg: output });

		// listen for input from user
		socket.once('input', function (data) {
			// check if we got a valid character index from the user
			const characterIndex = parseInt(data.msg) - 1;
			if (parseInt(data.msg) === 0) {
				this.createCharacter(socket);
			} else if (typeof socket.account.characters[characterIndex] != "undefined") {
				// valid character choice, so login to world with this character
				const characterId = socket.account.characters[characterIndex];
				this.loginWithCharacter(socket, server.db.getEntity(characterId));
			} else {
				// invalid character choice
				this.chooseCharacter(socket);
			}
		}.bind(this));
	},
	
	// create a new character
	createCharacter : function (socket) {
		const name = this.botNamesFirst[Math.floor(Math.random() * this.botNamesFirst.length)]
			+ ' ' + this.botNamesSecond[Math.floor(Math.random() * this.botNamesSecond.length)];
		const uuid = uuidv4();
		socket.emit('output', { msg: "You have been assigned bot: " + chalk.green(name) + ' / ' + chalk.gray(uuid) });

		const character = server.db.insertEntity({
			name: name,
			uuid: uuid,
			type: "og-bot",
			level: 1,
			playerCharacter: true
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
