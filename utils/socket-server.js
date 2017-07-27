var config = require.main.require('./config.js');

// Custom socket server with support for bundles, i.e. extensions
module.exports = {
	bundles: {},
	
	// Start socket server
	start: function(io) {
		// Load bundles
		this.loadBundles();
		
		// Listener for new connections to the socket server
		io.on('connection', function (socket) {			
			// As soon as we get a new connection, run the starting bundle
			this.runBundle(config.startBundle, socket);
		}.bind(this));
	},
	
	// Load all bundles that are defined in the config-file 
	loadBundles: function() {
		for (var i = 0; i < config.bundles.length; i++) {
			var bundleName = config.bundles[i];
			this.loadBundle(bundleName);
		}
	},
	
	// Loads a specific bundle by name
	loadBundle: function(bundleName) {
		this.bundles[bundleName] = require.main.require('./bundles/' + bundleName);
			
		// If bundle has an init function, then call it.
		if ("init" in this.bundles[bundleName]) {
			this.bundles[bundleName].init();
		}
	},
	
	// Calls a bundle's run() method
	runBundle: function(bundleName, socket) {
		if (!("run" in this.bundles[bundleName])) {
			throw new Error('No run() method exists for bundle: ' + bundleName + ". Change config.startBundle.");
		}
		
		socket.removeAllListeners(); // Remove all listeners from previous bundle
		this.bundles[bundleName].run(socket); // Call run() method on bundle
	},
}
