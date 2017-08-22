var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = [".view", ".v"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Admin";
		command["helpSyntax"] = [".view <object>", ".view <object>.<property>"];		
		command["helpExample"] = [".view room"];		
		command["helpText"] = "Views all properties or a specific property on an object.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// No target argument
		if (!arguments) {
			socket.emit('output', { msg: 'What object or property do you want to view?' });
			return;
		}

		// Try to split property by "."
		var propertySplit = arguments.split(".");
		
		// First split is assumed to be the property's object.
		var propertyObject = propertySplit[0];
		var currentSplit = 1;
		
		// If first split is actually a number, then this is a number selector, (e.g. "2.chair" to target the second chair in the room). 
		if (!isNaN(Number(propertyObject))) {
			// First split is a number, so assume that second split is actual object
			propertyObject += "." + propertySplit[1];
			currentSplit++;
		}
		
		// Try to find actual object
		var object = server.bundles.world.findTargetObject(propertyObject, character);
		
		if (!object) {
			socket.emit('output', { msg: 'No object found with that name.' });
			return;
		}
		
		while (propertySplit[currentSplit]) {
			if (object[propertySplit[currentSplit]]) {
				object = object[propertySplit[currentSplit]];
			} else {
				socket.emit('output', { msg: "That property was not found on this object." });
				return;
			}
			
			currentSplit++;
		}
		
		var objectAsString = JSON.stringify(object, null, 2);
		socket.emit('output', { msg: '<pre class="box">' + objectAsString + '</pre>' });
		
	}
}