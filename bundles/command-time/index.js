var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var world = server.bundles.world;
var db = server.db;

module.exports = {
	// Called when bundle is loaded
	init : function () {
		var command = {};
		
		command["keywords"] = ["time", "t"];
		command["run"] = this.runCommand.bind(this);
		command["helpCategory"] = "Environment";
		command["helpSyntax"] = ["time",];		
		command["helpText"] = "Look at the sky to determine time of day.";		
		
		server.commands.push(command);

		// Create time object in database
		if (!db.global.time) {
			db.global.time = {};
			db.global.time.hour = 0;
			db.global.time.minute = 0;
			db.global.time.day = 1;
			db.global.time.week = 1;
			db.global.time.month = 1;
			db.global.time.year = 1;
		}

		// Start world time
		this.startTime()
	},
	
	startTime() {
		this.interval = setInterval(function() {
			this.updateTime();
		}
		.bind(this), config.timeUpdateRate);

	},

	updateTime() {
		// Update time
		db.global.time.minute ++;
		if (db.global.time.minute >= 60) {
			db.global.time.minute = 0;
			db.global.time.hour++;
		}
		if (db.global.time.hour >= 24) {
			db.global.time.hour = 0;
			db.global.time.day++;
		}
		if (db.global.time.day >= 7) {
			db.global.time.day = 1;
			db.global.time.week++;
		}
		if (db.global.time.week >= 4) {
			db.global.time.week = 1;
			db.global.time.month++;
		}
		if (db.global.time.month >= 12) {
			db.global.time.month = 1;
			db.global.time.year++;
		}

		this.informPlayers()
	},

	informPlayers: function() {
		// Only inform on hour change
		if (db.global.time.minute != 0) {
			return
		}

		// Prepare message to send
		var message = "";
		if (db.global.time.hour == 0) {
			message = "It's midnight. The darkness has reached its peak.";
		}
		if (db.global.time.hour == 4) {
			message = "The first light of dawn is hanging in the air. The sun will soon go up.";
		}
		if (db.global.time.hour == 6) {
			message = "The sun is rising.";
		}
		if (db.global.time.hour == 12) {
			message = "The sun has reached zenith. It's midday.";
		}
		if (db.global.time.hour == 16) {
			message = "It's getting darker outside. The sun is going down.";
		}
		if (db.global.time.hour == 18) {
			message = "The sun disappears over the horizon.";
		}
		if (db.global.time.hour == 20) {
			message = "The last light of day is gone. The night has begun.";
		}

		// Don't send if no message
		if (!message) {
			return
		}

		// If we have a message, send it to all players in outside rooms
		var playerCharacters = world.getActivePlayerCharacters()
		for (var i in playerCharacters) {
			var character = playerCharacters[i];
			var room = db.getEntity(character.location);
			if (room.tags.includes("outside")) {

				world.sendMessage(message, character);
			}

		}
	},

	runCommand : function (arguments, character, socket) {
		// Get current room
		var room = db.getEntity(character.location);
		
		if (!room.tags.includes("outside")) {
			world.sendMessage("You cannot see the sky from here. You're unsure what time it is.", character);
			return;
		}

		var message = "";
		if (db.global.time.hour == 0) {
			message = "It's the middle of the night. The darkness is overwhelming."
		} else if (db.global.time.hour == 1) {
			message = "It's past midnight. It's dark outside."
		} else if (db.global.time.hour == 2) {
			message = "It's late night. The darkness is getting lighter."
		} else if (db.global.time.hour == 3) {
			message = "The night is soon over. The darkness is struggeling."
		} else if (db.global.time.hour == 4) {
			message = "The first light of dawn is hanging in the air."
		} else if (db.global.time.hour == 5) {
			message = "The twilight of dawn lights up the sky. The sun will soon rise."
		} else if (db.global.time.hour == 6 && db.global.time.minute < 30) {
			message = "The sun has just appeared above the horizon. The sky is red."
		} else if (db.global.time.hour == 6 && db.global.time.minute >= 30) {
			message = "The sun is rising. The sky is sparkling with colors."
		} else if (db.global.time.hour == 7) {
			message = "It's early morning. The sun is still low."
		} else if (db.global.time.hour == 8) {
			message = "It's morning. The sun is rising quickly."
		} else if (db.global.time.hour == 9) {
			message = "It's late morning. The sun is halfway to zenith."
		} else if (db.global.time.hour == 10) {
			message = "It's full daylight. The sun is climbing higher."
		} else if (db.global.time.hour == 11) {
			message = "It's forenoon, approaching midday. The sun is almost at zenith."
		} else if (db.global.time.hour == 12) {
			message = "It's midday. The sun is right above you."
		} else if (db.global.time.hour == 13) {
			message = "It's early afternoon. The sun is leaving zenith."
		} else if (db.global.time.hour == 14) {
			message = "It's late afternoon. The sun is half-way to the horizon."
		} else if (db.global.time.hour == 15) {
			message = "It's early evening. The sun is approaching the horizon."
		} else if (db.global.time.hour == 16) {
			message = "It's late evening. The sun is soon setting."
		} else if (db.global.time.hour == 17 && db.global.time.minute < 30) {
			message = "Sunset has begun. Orange colors are lighting up the sky."
		} else if (db.global.time.hour == 17 && db.global.time.minute >= 30) {
			message = "The sun has almost disappeared. The sky is burning red."
		} else if (db.global.time.hour == 18) {
			message = "The sun has just set. Purple colors of dusk are glowing in the sky."
		} else if (db.global.time.hour == 19) {
			message = "The last light is leaving the sky, giving way to night."
		} else if (db.global.time.hour == 20) {
			message = "The night has just begun."
		} else if (db.global.time.hour == 21) {
			message = "The night is growing darker."
		} else if (db.global.time.hour == 22) {
			message = "The night is very dark, but not at its darkest."
		} else if (db.global.time.hour == 23) {
			message = "It's right before midnight. The darkness is reaching its peak."
		}

		var days = {
			1: "Monday",
			2: "Tuesday",
			3: "Wednesday",
			4: "Thursday",
			5: "Friday",
			6: "Saturday",
			7: "Sunday"
		}

		message += `<br>${days[db.global.time.day]}, Week ${db.global.time.week}, Month ${db.global.time.month}, Year ${config.startingYear + db.global.time.year-1}, Year of the ${config.yearNames[(db.global.time.year-1)%config.yearNames.length]}<br>`

		world.sendMessage(message, character);
	},
}