var config = require.main.require('./config.js');
var server = require.main.require('./utils/socket-server.js');

module.exports = {
	// Called when bundle is loaded
	init : function () {
		server.connections = 0;
	},
	
	// Called when bundle is run
	run : function (socket) {
		server.connections++; // Increase number of connections.


		// Listener for when user disconnects
		/*socket.on('disconnect', function () {
			this.connections--; // Decrease connection count
		});*/

		this.enterEmail(socket);

	},
	
	enterEmail : function (socket) {
		socket.emit('output', { msg: "Please enter your e-mail to login:" });
		
		socket.once('input', function (data) {
			if (validateEmail(data.msg)) {
				this.confirmEmail(socket, data.msg);
			} else {
				this.enterEmail(socket);
			}
		}.bind(this));
	},
	
	confirmEmail : function (socket, email) {
		// Check if account already exists for this email in database
		var rows = server.db.getCollection('accounts').find( {'email': email } ) //var rows = server.accounts.where(function(obj){ return obj.email == email; });
		
		if (rows.length == 1) {
			// Account exists, so ask for password.
			this.enterPassword(socket, rows[0]);
		}
		else {
			// Account doesn't exist, so create a new one.
			socket.emit('output', { msg: "Do you want to create a new account with the e-mail <strong>" + email + "</strong>? Type 'yes' or 'no'" });
			
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
		socket.emit('output', { msg: "Please enter your password:" });
		
		socket.once('input', function (data) {
			if (data.msg == account.password) {
				// The password was correct
				socket.account = account; // Bind socket to account
				server.runBundle("character-creator", socket); // Run the character creator
			} else {
				// The password was incorrect
				socket.emit('output', { msg: "Wrong password." });
				this.enterEmail(socket);
			}
		}.bind(this));
	},
	
	choosePassword : function (socket, email) {
		socket.emit('output', { msg: "Choose a password (at least 8 characters, no spaces):" });
		
		socket.once('input', function (data) {
			if (/^\S{8,}$/.test(data.msg)) {
				// Password chosen, so save account to database
				var role = "user";
				if (server.db.getCollection('accounts').count() == 0) {
					// First account, so set role to superuser.
					role = "superuser";
					socket.emit('output', { msg: "First account on server, so has been set to Superuser." });
				}
				var account = server.db.getCollection('accounts').insert( { email: email, password: data.msg, role: role } );

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
}

// Validate email. Source: https://stackoverflow.com/a/46181
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}