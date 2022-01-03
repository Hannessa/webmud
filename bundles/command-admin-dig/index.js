var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = [".dig", ".d"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Admin";
		command["helpSyntax"] = [".dig <direction>", ".dig <direction> <room name>"];		
		command["helpExample"] = [".dig west"];		
		command["helpText"] = "Creates a new room at <direction>. Valid directions are: north, south, east, west, up, down.";		
		
		server.commands.push(command);
	},
	
	runCommand : function (arguments, character, socket) {
		// Command can only be used by player-controlled characters (not NPC:s)
		if (!socket) { return; }
		
		var argumentsSplit = arguments.split(/\s(.+)/);
		
		var validDirections = {
			"n" : "n",
			"s" : "s",
			"w" : "w",
			"e" : "e",
			"u" : "u",
			"d" : "d",
			"north" : "n",
			"south" : "s",
			"west" : "w",
			"east" : "e",
			"up" : "u",
			"down" : "d",
		};
		
		var coordinatesDelta = {
			"n" : { x: 0, y: 1, z: 0 },
			"s" : { x: 0, y: -1, z: 0 },
			"e" : { x: 1, y: 0, z: 0 },
			"w" : { x: -1, y: 0, z: 0 },
			"u" : { x: 0, y: 0, z: 1 },
			"d" : { x: 0, y: 0, z: -1 },
		};
		
		if (!validDirections[argumentsSplit[0]]) {
			socket.emit('output', { msg: "Invalid direction. Valid directions are: north, south, east, west, up, down." });
			return;
		}
		
		var direction = validDirections[argumentsSplit[0]];
		
		var fromRoom = server.db.getEntity(character.location);
		
		if (fromRoom.exits && fromRoom.exits[direction]) {
			socket.emit('output', { msg: "There's already a room in that direction." });
			return;
		}
		
		// TODO: Search for coordinates. If there's already a room at those coordinates, the just connect this to it.
		var toRoom = server.db.insertEntity({
			type : "room",
			name : argumentsSplit[1] ? argumentsSplit[1] : "New Room",
			desc : "This is a new room.",
			tags : [],
			coordinates : {
				x: fromRoom.coordinates.x + coordinatesDelta[direction].x,
				y: fromRoom.coordinates.y + coordinatesDelta[direction].y,
				z: fromRoom.coordinates.z + coordinatesDelta[direction].z
			},
		});
		
		this.addExit(direction, fromRoom, toRoom);
		
		socket.emit('output', { msg: "A new room has been created." });
	},
	
	addExit : function (direction, fromRoom, toRoom) {
		if (!fromRoom.exits) {
			fromRoom.exits = {};
		}
		
		if (!toRoom.exits) {
			toRoom.exits = {};
		}
		
		fromRoom.exits[direction] = { target : toRoom.$loki }; // , isDoor : true, isClosed : true
		
		var reverseDirections = {
			"n" : "s",
			"s" : "n",
			"w" : "e",
			"e" : "w",
			"d" : "u",
			"u" : "d",
		}
		
		var reverseDirection = reverseDirections[direction];
		
		toRoom.exits[reverseDirection] = { target : fromRoom.$loki }; // , isDoor : true, isClosed : true
	}
}