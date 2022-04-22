var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = [".set", ".s"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Admin";
		command["helpSyntax"] = [".set <object>.<property> <value>"];		
		command["helpExample"] = [".set room.name The Dining Hall"];		
		command["helpText"] = "Sets <property> of <object> to <value>.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// Try to split argument string
		var argumentsSplit = arguments.split(/\s(.+)/);
		
		// No target argument
		if (!argumentsSplit[0]) {
			socket.emit('output', { msg: 'What property do you want to set?' });
			return;
		}
		
		// No value argument
		if (!argumentsSplit[1]) {
			socket.emit('output', { msg: 'What value do you want to set it to?' });
			return;
		}
		
		// Property and value arguments are okay
		var property = argumentsSplit[0];
		var value = argumentsSplit[1];

		// Try to split property by "."
		var propertySplit = property.split(".");
		
		// First split is assumed to be the property's object.
		var propertyObject = propertySplit[0];
		var currentSplit = 1;
		
		// If first split is actually a number, then this is a number selector, (e.g. "2.chair" to target the second chair in the room). 
		if (!isNaN(Number(propertyObject))) {
			// First split is a number, so assume that second split is actual object
			propertyObject += "." + propertySplit[1];
			currentSplit++;
		}
		
		// We also need the actualy property names
		if (!propertySplit[currentSplit]) {
			socket.emit('output', { msg: 'You need to specify both an object and a property to set, in the format: .set <object>.<property> <value>' });
			return;
		}
		
		// Try to find actual object
		var object = server.bundles.world.findTargetObject(propertyObject, character);
		
		if (!object) {
			socket.emit('output', { msg: 'No object found with that name.' });
			return;
		}
		
		// If value starts with anything other than a [, { or a number, assume it's a string
		var valueParsed;
		if (value.match(/^[^\[{0-9]/i)) {
			valueParsed = value;
		} else {
			// Not a string, so try to parse value as JSON.
			try {
				valueParsed = JSON.parse(value);
			} catch(e) {
				socket.emit('output', { msg: "The value you're trying to set has an invalid format. It must be valid JSON." });
				return;
			}
		}

		// Finally, set the new property value
		var newProperty = false;
		if (propertySplit.length - currentSplit == 1) {
			if (!object[propertySplit[currentSplit]]) {
				newProperty = true;
			}
			
			object[propertySplit[currentSplit]] = valueParsed;
		}
		else if (propertySplit.length - currentSplit == 2) {
			if (!object[propertySplit[currentSplit]]) {
				object[propertySplit[currentSplit]] = {};
			}
			
			if (!object[propertySplit[currentSplit]][propertySplit[currentSplit+1]]) {
				newProperty = true;
			}
			
			object[propertySplit[currentSplit]][propertySplit[currentSplit+1]] = valueParsed;
		}
		else if (propertySplit.length - currentSplit == 3) {
			if (!object[propertySplit[currentSplit]]) {
				object[propertySplit[currentSplit]] = {};
			}
			
			if (!object[propertySplit[currentSplit]][propertySplit[currentSplit+1]]) {
				object[propertySplit[currentSplit]][propertySplit[currentSplit+1]] = {};
			}
			
			if (!object[propertySplit[currentSplit]][propertySplit[currentSplit+1]][propertySplit[currentSplit+2]]) {
				newProperty = true;
			}
			
			object[propertySplit[currentSplit]][propertySplit[currentSplit+1]][propertySplit[currentSplit+2]] = valueParsed;
		}
		else if (propertySplit.length - currentSplit == 4) {
			socket.emit('output', { msg: "Cannot set property of that nested depth." });
			return
		}

		if (newProperty) {
			socket.emit('output', { msg: "New property created: '" + property + "'" });
		} else {
			socket.emit('output', { msg: "Property has been changed." });
		}

		// Restart timers for this entity (if there are any)
		world.restartEntityTimers(object)
		
	}
}