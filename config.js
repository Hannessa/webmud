module.exports = {
	"info" : {
		name: 'WebMUD',
	},
	"bundles" : ["database", "welcome", "login", "character-creator", "world", "command-look", "command-quit", "commands-movement"], //, "world"
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
