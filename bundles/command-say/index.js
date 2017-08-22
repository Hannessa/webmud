var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');
var world = server.bundles.world;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["say"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Social";
		command["helpSyntax"] = ["say <message>"];		
		command["helpText"] = "Say something to the other characters in the room.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Must have message to say
		if (!arguments) {
			world.sendMessage("Say what?", character);
			return;
		}
		
		// Prepare message
		var message = this.addTrailingPeriod(this.capitalizeFirstLetter(arguments));
		
		// Send message to your own character
		world.sendMessage('You say, "' + message + '"', character);
		
		// Send message to other characters in the room (exclude your own character)
		var room = server.db.getEntity(character.location);
		world.sendMessage(character.name + ' says, "' + message + '"', room, character);
		
		// Todo: Possible add support for format keyword. See: https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
		
		/*world.sendMessage('You say, "{0}"'.format(message), character.location, character);
		world.sendMessage('{0} says, "{1}"'.format(character.name, message), character.location, character);

		world.sendMessage(character.name + ' says: "' + message + '"', character.location, character);

		world.sendMessage(utils.format('{0} says, "{1}"', character.name, message), character.location, character);
		world.sendMessage('{name} says, "{msg}"'.format({name: character.name, msg: message}), character.location, character);
		*/
		
	},
	
	// Make first letter uppercase
	capitalizeFirstLetter : function(string) {
		return string[0].toUpperCase() + string.substr(1);
	},
	
	// Add a period (.) to the end of the sentence
	addTrailingPeriod : function(string) {
		var lastCharacter = string.substr(string.length-1);
		var goodPunctuation = [".", "-", "!", "?", ":", ";"];
		
		// If last character is not in list of good punctuations, add period
		if (goodPunctuation.indexOf(lastCharacter) == -1) {
			string += ".";
		}
		
		return string;
	},
}