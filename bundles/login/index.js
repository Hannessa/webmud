const chalk = require("chalk");
const config = require.main.require('./config.js');
const server = require.main.require('./bundles/server.js');
const bcrypt = require('bcrypt');

// this bundle is called from the "welcome" bundle and gives step-by-step instructions for logging in or creating
// a new account.
module.exports = {
	// called when bundle is loaded
	init : function () {
		// nothing to do
	},
	
	// called when bundle is run
	run : function (socket) {
		this.enterEmail(socket);
	},
	
	enterEmail : function (socket) {
		socket.emit('output', { msg: "Enter your e-mail:" });
		
		socket.once('input', function (data) {
			// email should always be lowercase.
			data.msg = data.msg.toLowerCase();
			if (validateEmail(data.msg)) {
				this.confirmEmail(socket, data.msg);
			} else {
				this.enterEmail(socket);
			}
		}.bind(this));
	},
	
	confirmEmail : function (socket, email) {
		// check if account already exists for this email in database
		const rows = server.db.query('accounts', {'email': email});
		
		if (rows.length === 1) {
			// account exists, so ask for password.
			this.enterPassword(socket, rows[0]);
		} else {
			// account doesn't exist, so create a new one.
			socket.emit('output', {
				msg: "Are you sure this is the right e-mail: "
					+ chalk.bgBlue.black(email)
					+ "?\nType "
					+ chalk.bgWhite.black('yes')
					+ " or "
					+ chalk.bgWhite.black('no')
			});
			
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
		socket.emit('output', { msg: chalk.white("Enter your password:"), password: true });
		
		socket.once('input', function (data) {
			const password = data.msg;

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
		socket.emit('output', { msg: chalk.white("Create a password (6+ characters):"), password: true });
		
		socket.once('input', function (data) {
			const password = data.msg;

			if (/^.{6,}$/.test(password)) {
				// Password chosen, so save account to database
				const passwordHashed = this.hashPassword(password);

				let role = "user";
				if (server.db.count('accounts') === 0) {
					// First account, so set role to superuser.
					role = "superuser";
					socket.emit('output', { msg: "First account on server, so has been set to " + chalk.underline("Superuser") + "." });
				}

				// Save user with encrypted password
				const account = server.db.insert("accounts", {
					email: email,
					password: passwordHashed,
					role: role
				});

				socket.emit('output', { msg: "Account created." });

				socket.account = account; // Bind socket to account
				
				// Run the character creator
				server.runBundle("character-creator", socket);
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
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}