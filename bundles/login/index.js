const chalk = require("chalk");
var config = require.main.require('./config.js');
var server = require.main.require('./bundles/server.js');
var bcrypt = require('bcrypt');

// This bundle is called from the "welcome" bundle and gives step-by-step instructions for logging in or creating a new account.
module.exports = {
	// Called when bundle is loaded
	init : function () {
	},
	
	// Called when bundle is run
	run : function (socket) {
		this.enterEmail(socket);
	},
	
	enterEmail : function (socket) {
		socket.emit('output', { msg: "Enter your e-mail:" });
		
		socket.once('input', function (data) {
			// Email should always be lowercase.
			data.msg = data.msg.toLowerCase();
			if (validateEmail(data.msg)) {
				this.confirmEmail(socket, data.msg);
			} else {
				this.enterEmail(socket);
			}
		}.bind(this));
	},
	
	confirmEmail : function (socket, email) {
		// Check if account already exists for this email in database
		var rows = server.db.query('accounts', {'email': email } ); //var rows = server.accounts.where(function(obj){ return obj.email == email; });
		
		if (rows.length == 1) {
			// Account exists, so ask for password.
			this.enterPassword(socket, rows[0]);
		}
		else {
			// Account doesn't exist, so create a new one.
			socket.emit('output', { msg: "Are you sure this is the right e-mail: " + chalk.bgBlue(email) + "?\nType " + chalk.bgWhite('yes') + " or " + chalk.bgWhite('no') });
			
			socket.once('input', function (data) {
				if (/^y(es)?$/i.test(data.msg)) {
					this.choosePassword(socket, email);
				} else if (/^n(o)?$/i.test(data.msg)) {
					this.enterEmail(socket);
				} else {
					this.confirmEmail(socket, email);
				}
			}.bind(this));
		}
	},
	
	enterPassword: function(socket, account) {
		socket.emit('output', { msg: "Enter your password:", password: true });
		
		socket.once('input', function (data) {
			var password = data.msg

			// Compare stored password with entered password (hashed)
			if (this.checkPassword(password, account.password)) {
				// The password was correct
				socket.account = account; // Bind socket to account
				server.runBundle("character-creator", socket); // Run the character creator
			} else {
				// The password was incorrect
				socket.emit('output', { msg: chalk.red("Wrong password.") });
				this.enterEmail(socket);
			}
		}.bind(this));
	},
	
	choosePassword : function (socket, email) {
		socket.emit('output', { msg: "Create a password (6+ characters):", password: true });
		
		socket.once('input', function (data) {
			var password = data.msg

			if (/^.{6,}$/.test(password)) {
				// Password chosen, so save account to database
				var passwordHashed = this.hashPassword(password);

				var role = "user";
				if (server.db.count('accounts') == 0) {
					// First account, so set role to superuser.
					role = "superuser";
					socket.emit('output', { msg: "First account on server, so has been set to " + chalk.underline("Superuser") + "." });
				}

				// Save user with encrypted password
				var account = server.db.insert("accounts", {
					email: email,
					password: passwordHashed,
					role: role
				});

				socket.emit('output', { msg: "Account created." });

				socket.account = account; // Bind socket to account
				
				// Run the character creator
				server.runBundle("character-creator", socket);
				
				//this.createCharacter(socket);
			} else {
				this.choosePassword(socket);
			}

		}.bind(this));
	},

	hashPassword(password) {
		return bcrypt.hashSync(password + config.securityKey, 10);
	},

	checkPassword(password, storedPassword) {
		return bcrypt.compareSync(password + config.securityKey, storedPassword);
	},
}

// Validate email. Source: https://stackoverflow.com/a/46181
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}