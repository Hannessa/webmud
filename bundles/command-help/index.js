var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["help", "h"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Meta";
		command["helpSyntax"] = ["help", "help <command>"];		
		command["helpText"] = "Shows a list of all available commands ('help'), or information about a specific command ('help <command>').";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		arguments = arguments.toLowerCase();
		
		// "help" without argument. Display all available commands. 
		if (arguments == "") {
			// Todo: Also display and sort by categories!
			var categories = [];
			var commandList = {};
			var commandOrder = [];
			var commandsByCategory = {};
			for (var i = 0; i < server.commands.length; i++) {
				var command = server.commands[i];
				commandList[command.keywords[0]] = command;
				commandOrder.push(command.keywords[0]);
				if (command.helpCategory && categories.indexOf(command.helpCategory) == -1) {
					categories.push(command.helpCategory);
				}

				if (!commandsByCategory[command.helpCategory]) {
					commandsByCategory[command.helpCategory] = [];
				}
				commandsByCategory[command.helpCategory].push(command.keywords[0]);
				commandsByCategory[command.helpCategory].sort()
			}
			commandOrder.sort();
			categories.sort();
			
			
			var content = "<strong>Available commands</strong><br>Type \"help &lt;command&gt;\" for additional information.<br><br>";
			/*for (var i = 0; i < commandOrder.length; i++) {
				var commandName = commandOrder[i];
				var command = commandList[commandName];
				
				var maxDescLength = 100;
				if (command.helpText.length < maxDescLength) {
					var truncatedDesc = command.helpText;
				}
				else {
					var truncatedDesc = command.helpText.substring(0,maxDescLength) + "...";
				}
				
				content += commandName + " - " + this.htmlEntities(truncatedDesc) + "<br>";

			}*/

			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];
				content += "<strong>" + category + "</strong> - ";
				content += commandsByCategory[category].join(", ");
				content += "<br>";
			}
				/*for (var j = 0; j < commandsByCategory[category].length; j++) {
					var commandName = commandsByCategory[category][j];
					var command = commandList[commandName];
					content += commandName + " - " + this.htmlEntities(truncatedDesc) + "<br>";*/


			socket.emit('output', { msg: content });
		}
		// "help <command>" with argument. Display info about a specific command.
		else {
			// Loop through all commands until we have a match
			var hasMatch = false;
			var command;
			for (var i = 0; i < server.commands.length; i++) {
				command = server.commands[i];

				// Check if the typed in command matches any of the current command's keywords
				if (command.keywords.indexOf(arguments) != -1) {
					// And exit from loop, we don't want more matches.
					hasMatch = true;
					break;
				}
			}
			
			if (!hasMatch) {
				socket.emit('output', { msg: "That's not a valid command. Type 'help' for a list of commands." });
				return;
			}
			
			// Display command information
			var content = "";
			content += "<strong>" + command.keywords[0] + "</strong><br>";
			if (command.keywords[1]) {
				content += "Aliases: " + command.keywords.join(", ") + "<br>";
			}
			content += "Category: " + command.helpCategory + "<br>";
			content += "Syntax: " + this.htmlEntities(command.helpSyntax.join(", ")) + "<br>";
			if (command.helpExample) {
				content += "Example use: " + this.htmlEntities(command.helpExample.join(", ")) + "<br>";
			}
			content += "<br>" + this.htmlEntities(command.helpText) + "<br>";
			socket.emit('output', { msg: content });
		}
	},
	
	htmlEntities : function(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
}
