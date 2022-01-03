module.exports = {
	"info" : {
		name: 'WebMUD',
	},
	"bundles" : ["database-lokijs", "welcome", "login", "character-creator", "world", "command-look", "command-quit", "commands-movement", "command-admin-set", "command-admin-view", "command-admin-dig", "command-help", "command-say", "command-smile"], //, "world"
	"startBundle" : "welcome",
	"databasePath" : "database.json",
	"databaseSaveDelay" : 4000, // How often the database is saved, in milliseconds
	"securityKey": "A8fS2jvx39Vmc7eS", // Should be unique for better password encryption
			

	"species": {
		"human" : {
			singular : "human",
			plural : "humans",
			shortDescription : "Humans are famous for their ",
			longDescription : "Humans are famous for their ",
			"stats" : {
				"strength" : 10,
				"dexterity" : 10,
				"constitution" : 10,
				"intelligence" : 10,
				"wisdom" : 10,
				"charisma" : 10
			}
		},
		"gnome" : {
			singular : "human",
			plural : "humans",
			description : "Humans are famous for their ",
			"stats" : {
				"strength" : 10,
				"dexterity" : 10,
				"constitution" : 10,
				"intelligence" : 10,
				"wisdom" : 10,
				"charisma" : 10
			}
		},
		
	}
}
