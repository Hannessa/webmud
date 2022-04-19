const chalk = require("chalk");

module.exports = {
	// name of this project
	name: 'RSB',

	// welcome message to be displayed when the user first connects to the MUD
	welcomeMessage: chalk.yellow("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n")
		+ "You have logged into the " + chalk.cyanBright("Remote SpaceBot") + " controller tool.",

	// if true, will show general server info on welcome screen
	showServerInfo: true,

	// Port of web server
	port: 3000,

	// date and time in world
	timeUpdateRate: 2500, // in milliseconds, how fast one game minute passes. 2.5 sec means one hour is 2.5 minutes,
							// a day is 60 minutes
	startingYear: 4291, // year the game starts in
	yearNames: [
		'Three-Headed Monkey',
		'Seven Moons',
		'Dolphin',
		'Three Suns',
		'Goat',
		'Happy Farmer',
		'Worm',
		'Lute',
		'Snake',
		'Elephant King',
		'Leopard God',
		'Pig'
	],

	// bundles to load (loaded sequentially)
	"bundles" : [
		"database-lokijs",
		"welcome",
		"login",
		"character-creator",
		"world",
		//"command-look",
		"command-quit",
		//"commands-movement",
		//"command-admin-set",
		//"command-admin-view",
		//"command-admin-dig",
		//"command-admin-delete",
		//"command-admin-create",
		"command-help",
		//"command-say",
		//"command-smile",
		//"command-time",
		//"command-inventory",
		//"command-get",
		//"command-drop",
		"command-status",
	],

	// initial bundle to run
	"welcomeBundle" : "welcome",

	// database settings
	"databasePath" : "database.json",
	"databaseSaveDelay" : 4000, // frequency of DB save, in milliseconds
	"securityKey": "AvqaKuKfWMiAUd8ctAG4xVrAv6be*rT7", // should be unique for better password encryption
}
