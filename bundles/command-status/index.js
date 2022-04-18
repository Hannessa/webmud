var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;

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
				"status": "CRITICAL - REDUCED CAPACTITY: 128 bytes",
				"active": true,
				"error": true,
				"level": 1,
				"max": 1048576, //2^20
				"min": 0,
				"current": 128
			},
			{
				"name": "Temperature",
				"type": "Sensor",
				"description": "Temperature of bot. Must be kept within operational bounds.",
				"status": "UNKNOWN - ERROR: UNKNOWN",
				"active": false,
				"error": true,
				"level": 0,
				"max": 3000, //2^20
				"min": -273.15,
				"current": 0
			},
			{
				"name": "Legs",
				"type": "Actuator",
				"description": "Claw-like legs. Faciliate latching onto objects and movement against objects.",
				"status": "Latched - ERROR: motor stuck",
				"active": false,
				"error": true,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Arms",
				"type": "Actuator",
				"description": "Clamps on arms. May manipulate close-by objects and materials.",
				"status": "Idle - Operational",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Mouth",
				"type": "Intake",
				"description": "Materials injestion. Allows materials to be injested and processed.",
				"status": "Idle - Operational",
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
				"status": "Idle - Operational",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Metals extractor",
				"type": "Module",
				"description": "Materials processing for metals, extracting from rocks and debris.",
				"status": "Idle - Operational",
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
				"status": "Idle - Operational",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
			{
				"name": "Solar panel",
				"type": "Energy",
				"description": "Energy harvesting from light energy.",
				"status": "CRITICAL - ERROR: panel damage",
				"active": true,
				"error": true,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 5
			},
			{
				"name": "Battery",
				"type": "Energy",
				"description": "Energy storage for bot computer, sensors and actuators.",
				"status": "WARNING - ERROR: leak detected",
				"active": true,
				"error": true,
				"level": 1,
				"max": 20,
				"min": 0,
				"current": 20
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
				"current": 0
			},
			{
				"name": "Ion Engine",
				"type": "Engine",
				"description": "Propulsion engine for slow, long journeys.",
				"status": "Empty",
				"active": false,
				"error": false,
				"level": 1,
				"max": 100,
				"min": 0,
				"current": 0
			},
		]

		// "Status". No arguments (i.e. "status" or "status bot"), so status of bot
		if (arguments == "" || arguments == "bot") {
			output = '<table><tr><th>Name</th><th>Type</th><th>Status</th><th>Value</th></tr>'
			statuses.forEach(status => {
				output += '<tr><th>' + status.name + '</th><td>' + status.type + '</td><td>' + (status.active ? '[ACTIVE]' : '[INACTIVE]') + ' ' + status.status + ' ' + (status.error ? '[ERROR!]' : '') + '</td><td>' + status.current + '/' + status.max + (status.min != 0 ? ' (min ' + status.min + ')' : '')  + '</td></tr>';
			})
			output += '</table>'
			
			//world.sendMessage(output, character);
			socket.emit('output', { msg: output });

		}
		// "Status <object>". Get a specific status
		else if (arguments) {
			var status = statuses.find(el => el.name.toLowerCase() === arguments)

			var output = "";

			if (status) {
				output += '<span class="name"><strong>Name: ' + status.name + '</strong></span><br>';
				output += '<span class="description">Type: ' + status.type + '</span><br>';
				output += '<span class="description">Description: ' + status.description + '</span><br>';
				output += '<span class="description">Status: ' + status.status + '</span><br>';
				output += '<span class="description">Is Active?: ' + (status.active ? 'YES' : 'NO') + '</span><br>';
				output += '<span class="description">Has Error?: ' + (status.error ? 'YES' : 'NO') + '</span><br>';
				output += '<span class="description">Value: ' + status.current + ' of (min)' + status.min + '/(max)' + status.max  + '</span><br>';
				output += '<br>';
			}
			else {
				output += "Status not found for area \"" + arguments + "\""
			}
			socket.emit('output', { msg: output });
		}
	},
}
