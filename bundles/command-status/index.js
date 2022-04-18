const chalk = require("chalk");
var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;
const colors = {
	"red": "#FF0000",
	"green": "#00FF00",
	"orange": "#FF9933",
	"blue": "#0000FF",
	"magenta": "#FF00FF",
	"cyan": "#00FFFF",
	"white": "#FFFFFF"
}

// Command to get the status of the currnet bot.
module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["status", "s"];
		command["run"] = this.runCommand;
		command["helpCategory"] = "Information";
		command["helpSyntax"] = ["status", "status <area>"];
		command["helpText"] = "Display the current bot status.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {		
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		// Make arguments case insensitive
		arguments = arguments.toLowerCase();

		//var room = server.db.getEntity(socket.character.location);

		// TODO : move to DB
		var statuses = [
			{
				"name": "Memory",
				"type": "Internal",
				"description": "Onboard computer memory. Capacity limits operations.",
				"status": "Functional but reduced capacity",
				"active": true,
				"error": false,
				"level": 1,
				"max": 1048576, //2^20
				"min": 0,
				"current": 128,
				"warningBelow": 1024,
				"warningAbove": 1048576 //2^20
			},
			{
				"name": "Temperature",
				"type": "Sensor",
				"description": "Temperature of bot. Must be kept within operational bounds.",
				"status": "Disabled",
				"active": false,
				"error": true,
				"meaningfulEmpty": true,
				"level": 0,
				"max": 3000,
				"min": -273.15,
				"current": 0,
				"warningBelow": -200,
				"warningAbove": 500
			},
			{
				"name": "Legs",
				"type": "Actuator",
				"description": "Claw-like legs. Faciliate latching onto objects and movement against objects.",
				"status": "Latched to surface but motor stuck",
				"active": false,
				"error": true,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 0,
				"warningAbove": 100
			},
			{
				"name": "Arms",
				"type": "Actuator",
				"description": "Clamps on arms. May manipulate close-by objects and materials.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 0,
				"warningAbove": 100
			},
			{
				"name": "Mouth",
				"type": "Intake",
				"description": "Materials injestion. Allows materials to be injested and processed.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Silicon extractor",
				"type": "Module",
				"description": "Materials processing for silicon, extracting from rocks and debris.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 0,
				"warningAbove": 100
			},
			{
				"name": "Metals extractor",
				"type": "Module",
				"description": "Materials processing for metals, extracting from rocks and debris.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Module factory",
				"type": "Module",
				"description": "A module which can build other modules.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 0,
				"warningAbove": 100
			},
			{
				"name": "Solar panel",
				"type": "Energy",
				"description": "Energy harvesting from light energy.",
				"status": "Functional but panel damage",
				"active": true,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 5,
				"warningBelow": 20,
				"warningAbove": 100
			},
			{
				"name": "Battery",
				"type": "Energy",
				"description": "Energy storage for bot computer, sensors and actuators.",
				"status": "Low capacity, needs repair",
				"active": true,
				"error": false,
				"level": 1,
				"max": 20,
				"min": 0,
				"current": 20,
				"warningBelow": 15,
				"warningAbove": 100
			},
			{
				"name": "Fuel",
				"type": "Energy",
				"description": "Fuel storage for engines.",
				"status": "Empty",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 40,
				"warningAbove": 100
			},
			{
				"name": "Ion Engine",
				"type": "Engine",
				"description": "Propulsion engine for slow, long journeys.",
				"status": "Unknown damage",
				"active": false,
				"error": true,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0,
				"warningBelow": 0,
				"warningAbove": 100
			},
		]

		socket.emit('output', { msg: "Bot status:" });

		// "Status". No arguments (i.e. "status" or "status bot"), so status of bot
		if (arguments == "" || arguments == "bot") {
			output = ''
			statuses.forEach(status => {
				var col = colors.cyan
				if (status.error) col = colors.red
				else if (status.current < status.warningBelow || status.current > status.warningAbove) col = colors.orange
				else if (status.active) col = colors.green
				const colText = chalk.hex(col)
				output += colText.bold(status.name) + colText('(' + status.type + ') ' + (status.active ? '[ACTIVE]' : '[INACTIVE]') + ' ' + status.status + '' + (status.error ? ' [ERROR!]' : '') + ', ' + status.current + '/' + status.max + (status.min != 0 ? ' (min ' + status.min + ')' : '')  + '\n');
			})
			output += '\n'
			
			//world.sendMessage(output, character);
			socket.emit('output', { msg: output });

		}
		// "Status <object>". Get a specific status
		else if (arguments) {
			var status = statuses.find(el => el.name.toLowerCase() === arguments)

			var output = "";
			var col = colors.cyan
			if (status.error) col = colors.red
			else if (status.current < status.warningBelow || status.current > status.warningAbove) col = colors.orange
			else if (status.active) col = colors.green
			const colText = chalk.hex(col)

			if (status) {
				output += 'Name: ' + colText.bold(status.name) + '\n';
				output += 'Type: ' + colText(status.type) + '\n';
				output += 'Description: ' + colText(status.description) + '\n';
				output += 'Status: ' + colText(status.status) + '\n';
				output += 'Is Active?: ' + colText(status.active ? 'YES' : 'NO') + '\n';
				output += 'Has Error?: ' + colText(status.error ? 'YES' : 'NO') + '\n';
				output += 'Value: ' + colText(status.current + ' of (min)' + status.min + '/(max)' + status.max)  + '\n';
				output += '\n';
			}
			else {
				output += "Status not found for area " + chalk.bgRed(arguments)
			}
			socket.emit('output', { msg: output });
		}
	},
}
