module.exports = {

	// Name of MUD
	name: 'WebMUD',

	// Welcome message to be displayed when the user first connects to the MUD
	welcomeMessage: "Hello adventurer! Welcome to <strong>WebMUD</strong>.",

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
		"command-look",
		"command-quit",
		"commands-movement",
		"command-admin-set",
		"command-admin-view",
		"command-admin-dig",
		"command-admin-delete",
		"command-help",
		"command-say",
		"command-smile",
		"command-time",
		"command-inventory",
	],

	// What bundle to run when a user first connection
	"welcomeBundle" : "welcome",

	// Database settings
	"databasePath" : "database.json",
	"databaseSaveDelay" : 4000, // How often the database is saved, in milliseconds
	"securityKey": "A8fS2jvx39Vmc7eS", // Should be unique for better password encryption
			
	"stats" : {
		"strength" : "Strength of muscles, bones, tendons and skin. Also adds to natural armor.",
		"agility" : "Movement speed, precision, balance and reaction time.",
		"endurance" : "Stamina and energy levels. Also resistance to poison and disease.",
		"intelligence" : "Cleverness and creativity. Ability to solve problems and come up with new ideas.",
		"willpower" : "Ability to maintain focus. Also resistance to social persuasion and charm.",
		"charisma" : "Social strength. Ability to get along with and influence others socially.",
	},

	"species": {
		"human" : {
			singular : "human",
			plural : "humans",
			desc: "Humans are a social species often organized in large, complex societies. They are average in most stats and abilities.",
			stats : {},
			startingSkills: [],
		},
		"elf" : {
			singular : "elf",
			plural : "elves",
			desc: "Elves normally live in forests with a close connection to nature. They are human-like in size, but more agile and less strong, with an exceptionally artistic and focused mind.",
			stats : {},
			startingSkills: [],
		},
		"dwarf": {
			singular : "dwarf",
			plural : "dwarves",
			desc: "Dwarves live in vast halls carved into mountains. They are amazing architects, miners and craftsmen, smaller but sturdier than humans, with a strong and steadfast mind.",
			stats : {},
			startingSkills: [],
		},
		"gnome" : {
			singular : "gnome",
			plural : "gnomes",
			desc: "Gnomes are small, agile cave dwellers that live in underground cities close to rare minerals. They have a magical connection to the subterranean rocks and minerals and are skilled in the arts of mining, science and alchemy.",
			stats : {},
			startingSkills: [],
		},
		"fairy" : {
			singular : "fairy",
			plural : "faries",
			desc: "Fairy are very small and delicate winged beings that live deep inside the largest forests in their own magical kingdoms. They are playful and have strong magical powers, but are also fragile and cannot fly very high.",
			stats : {},
			startingSkills: [],
		},
		"troll" : {
			singular : "troll",
			plural : "trolls",
			desc: "Trolls are large, slow creatures that live in forests, caves and mountains. They are physically strong, but lack the intelligence of the other species.",
			stats : {},
			startingSkills: [],
		},
		
	}
}
