module.exports = {
	"info" : {
		name: 'WebMUD',
	},
	"bundles" : ["database-lokijs", "welcome", "login", "character-creator", "world", "command-look", "command-quit", "commands-movement", "command-admin-set", "command-admin-view", "command-admin-dig", "command-help", "command-say",], //, "world"
	"startBundle" : "welcome",
	"databasePath" : "database.json",
	"databaseSaveDelay" : 4000, // How often the database is saved, in milliseconds
	
	/*"species" {
		"human" : {
			singular : "human",
			plural : "humans",
			shortDescription : "Humans are famous for their ",
			longDescription : "Humans are famous for their ",
		},
		"gnome" : {
			singular : "human",
			plural : "humans",
			description : "Humans are famous for their ",
		},
		
	}*/
}
