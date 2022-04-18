module.exports = {

	// Name of MUD
	name: 'RSB',

	// Welcome message to be displayed when the user first connects to the MUD
	welcomeMessage: "You have logged into the <strong>Remote SpaceBot</strong> controller tool.",

	// If true, will show general server info on welcome screen
	showServerInfo: true,

	// Port of web server
	port: 3000,

	// Date and time in world
	timeUpdateRate: 2500, // In milliseconds, how fast one game minute passes. 2.5 sec means one hour is 2.5 minutes, a day is 60 minutes
	startingYear: 4291, // Year the game starts in
	yearNames: ['Three-Headed Monkey', 'Seven Moons', 'Dolphin', 'Three Suns', 'Goat', 'Happy Farmer', 'Worm', 'Lute', 'Snake', 'Elephant King', 'Leopard God', 'Pig',],

	// What bundles to load (loaded in order from top to bottom)
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

	// What bundle to run when a user first connection
	"welcomeBundle" : "welcome",

	// Database settings
	"databasePath" : "database.json",
	"databaseSaveDelay" : 4000, // How often the database is saved, in milliseconds
	"securityKey": "AvqaKuKfWMiAUd8ctAG4xVrAv6be*rT7", // Should be unique for better password encryption
}
