const chalk = require("chalk");
const config = require.main.require('./config.js');
const server = require.main.require('./bundles/server.js');

module.exports = {
	// called when bundle is loaded
	init : function () {
		const command = {};

		command["keywords"] = ["help", "h"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Meta";
		command["helpSyntax"] = ["help", "help <command>"];		
		command["helpText"] = "Shows a list of all available commands ('help'), or information about a specific command ('help <command>').";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		let content;
		let i;
// command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		arguments = arguments.toLowerCase();
		
		// "help" without argument. Display all available commands. 
		if (arguments === "") {
			const categories = [];
			const commandList = {};
			const commandOrder = [];
			const commandsByCategory = {};
			for (i = 0; i < server.commands.length; i++) {
				let command = server.commands[i];
				commandList[command.keywords[0]] = command;
				commandOrder.push(command.keywords[0]);
				if (command.helpCategory && categories.indexOf(command.helpCategory) === -1) {
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
			
			
			content = chalk.bold("Available commands") + "\nType \"help <command>\" for additional information.\n\n";

			for (i = 0; i < categories.length; i++) {
				const category = categories[i];
				content += chalk.bold(category) + " - ";
				content += commandsByCategory[category].join(", ");
				content += "\n";
			}

			socket.emit('output', { msg: content });
		} else {
			// "help <command>" with argument. Display info about a specific command.

			// loop through all commands until we have a match
			let hasMatch = false;
			let command;
			for (i = 0; i < server.commands.length; i++) {
				command = server.commands[i];

				// Check if the typed in command matches any of the current command's keywords
				if (command.keywords.indexOf(arguments) !== -1) {
					// and exit from loop, we don't want more matches.
					hasMatch = true;
					break;
				}
			}
			
			if (!hasMatch) {
				socket.emit('output', {
					msg: "That's not a valid command. Type "
						+ chalk.bgWhite.black("help")
						+ " for a list of commands."
				});
				return;
			}
			
			// display command information
			content = "";
			content += chalk.bold(command.keywords[0]) + "\n";
			if (command.keywords[1]) {
				content += "Aliases: " + command.keywords.join(", ") + "\n";
			}
			content += "Category: " + command.helpCategory + "\n";
			content += "Syntax: " + command.helpSyntax.join(", ") + "\n";
			if (command.helpExample) {
				content += "Example use: " + command.helpExample.join(", ") + "\n";
			}
			content += "\n" + command.helpText + "\n";
			socket.emit('output', { msg: content });
		}
	}
}
