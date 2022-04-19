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
				"name": "Radio",
				"type": "Circuitry",
				"description": "Allows for remote control and communication.",
				"status": "Fully functional",
				"active": true,
				"error": false,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 1,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": [],
				"energy": 3,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Memory",
				"type": "Circuitry",
				"description": "Onboard computer memory. Capacity limits operations.",
				"status": "Functional but reduced capacity",
				"active": true,
				"error": false,
				"level": 1,
				"max": 1048576, //2^20
				"min": 0,
				"current": 128,
				"valueTerm": "Bytes",
				"warningBelow": 1024,
				"warningAbove": 1048576, //2^20
				"actions": [],
				"energy": 2,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Legs",
				"type": "Actuator",
				"description": "Claw-like legs. Faciliate latching and movement.",
				"status": "Latched to surface but motor stuck",
				"active": false,
				"error": true,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": ["crawl", "push", "latch"],
				"energy": 10,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Arms",
				"type": "Actuator",
				"description": "Clamps on arms. May manipulate close-by objects and materials.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": ["harvest", "repair", "dig", "build"],
				"energy": 5,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Silicon extractor",
				"type": "Module",
				"description": "Materials processing for silicon, extracting from rocks and debris.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": [],
				"energy": 2,
				"yield": 1,
				"yeildType": "SIL"
			},
			{
				"name": "Metals extractor",
				"type": "Module",
				"description": "Materials processing for metals, extracting from rocks and debris.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": [],
				"energy": 3,
				"yield": 2,
				"yeildType": "MET"
			},
			{
				"name": "Materials storage",
				"type": "Module",
				"description": "General purpose storage for materials.",
				"status": "Working",
				"active": true,
				"error": false,
				"level": 1,
				"max": 40,
				"min": 0,
				"current": 0,
				"valueTerm": "Capacity",
				"warningBelow": 0,
				"warningAbove": 35,
				"actions": [],
				"energy": 0,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Module factory",
				"type": "Module",
				"description": "A module which can build other modules.",
				"status": "Idle",
				"active": false,
				"error": false,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": ["fabricate"],
				"energy": 40,
				"yield": 0.4,
				"yeildType": "MOD"
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
				"valueTerm": "Energy input",
				"warningBelow": 20,
				"warningAbove": 100,
				"actions": [],
				"energy": 0,
				"yield": 6,
				"yeildType": "NRG"
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
				"valueTerm": "Stored",
				"warningBelow": 50,
				"warningAbove": 100,
				"actions": [],
				"energy": -10,
				"yield": 0,
				"yeildType": ""
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
				"valueTerm": "Stored",
				"warningBelow": 40,
				"warningAbove": 100,
				"actions": [],
				"energy": 0,
				"yield": 0,
				"yeildType": ""
			},
			{
				"name": "Ion Engine",
				"type": "Engine",
				"description": "Propulsion engine for slow, long journeys.",
				"status": "Unknown damage",
				"active": false,
				"error": true,
				"level": 1,
				"max": 1,
				"min": 0,
				"current": 0,
				"valueTerm": "Thrust",
				"warningBelow": 0,
				"warningAbove": 1,
				"actions": ["fly"],
				"energy": 1000,
				"yield": 0,
				"yeildType": ""
			},
		]

		socket.emit('output', { msg: "Bot status:" });

		// "Status". No arguments (i.e. "status" or "status bot"), so status of bot
		if (arguments == "" || arguments == "bot") {
			var output = chalk.white("Energy\tYields\tDetails\n")
			var netEnergy = 0
			var availableEnergy = 0
			statuses.forEach(status => {
				var col = colors.cyan
				if (status.error) col = colors.red
				else if (status.current < status.warningBelow || status.current > status.warningAbove) col = colors.orange
				else if (status.active) col = colors.green
				const colText = chalk.hex(col)
				output += (status.active && !status.error && status.energy != 0 ? chalk.white(status.energy) : "  ") + "\t" + (status.active && !status.error && status.yeildType !== "" ? chalk.white(status.yield + " " + status.yeildType) : "    ") + "\t" + (status.active ? chalk.greenBright('[ACTIVE]   ') : chalk.gray('[INACTIVE] ')) + colText.bold(status.name) + '' + (status.error ? chalk.redBright(' [ERR]') : '') + '\n';
				availableEnergy += status.active && !status.error ? status.energy * -1 : 0
				if (status.active && !status.error && status.yeildType === "NRG") netEnergy += status.yield
				else if (status.active && !status.error && status.energy > 0) netEnergy -= status.energy
			})
			var col = colors.green
			if (availableEnergy < 5) col = colors.orange
			else if (availableEnergy < 0) col = colors.red
			var colText = chalk.hex(col)
			output += 'Available energy: ' + colText(availableEnergy) + "\n"

			col = colors.green
			if (netEnergy < 5) col = colors.orange
			else if (netEnergy < 0) col = colors.red
			colText = chalk.hex(col)
			output += 'Net energy: ' + colText(netEnergy) + ' - '
			if (netEnergy >= 0) output += chalk.green('positive net energy: battery will not deplete')
			else  output += chalk.hex(colors.orange)(' - NEGATIVE net energy: battery WILL deplete')
			
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
				output += chalk.white('Name: \t\t') + chalk.bold(status.name) + '\n';
				output += chalk.white('Type: \t\t') + status.type + '\n';
				output += chalk.white('Description: \t') + status.description + '\n';
				output += chalk.white('Status: \t') + colText(status.status) + '\n';
				output += chalk.white('Is Active?: \t') + (status.active ? chalk.greenBright('YES') : 'NO') + '\n';
				output += chalk.white('Has Error?: \t') + (status.error ? chalk.redBright('YES') : 'NO') + '\n';
				if (status.valueTerm !== "") output += chalk.white(status.valueTerm + ': \t') + (status.current < status.warningBelow || status.current > status.warningAbove ? chalk.yellow(status.current) : chalk.greenBright(status.current)) + (status.min != 0 ? ' / ' + status.max : ' of ' + status.min + ' to ' + status.max) + '\n';
				output += chalk.white('Energy usage: \t') + (status.energy <= 0 ? chalk.green(status.energy) : chalk.yellow(status.energy))  + '\n';
				if (status.yield > 0) output += chalk.white('Yield: \t\t') + chalk.bold(status.yield) + " units per hour" + '\n';
				output += chalk.white('Actions: \t')
				if (status.actions.length == 0) output += chalk.gray("None") + '\n';
				else output += status.actions.join(", ") + '\n';
				output += '\n';
			}
			else {
				output += "Status not found for area " + chalk.bgRed(arguments)
			}
			socket.emit('output', { msg: output });
		}
	},
}
