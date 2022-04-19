const config = require.main.require('./config.js');

// custom socket server with support for bundles, i.e. extensions
module.exports = {
	bundles: {},
	
	// load bundles and prepare welcome bundle
	start: function(io) {
		// load bundles
		this.loadBundles();
		
		// Listener for new connections to the socket server
		io.on('connection', function (socket) {			
			// When a user connects, run the welcome bundle
			this.runBundle(config.welcomeBundle, socket);
		}.bind(this));
	},
	
	// load all bundles that are defined in the config-file
	loadBundles: function() {
		for (let i = 0; i < config.bundles.length; i++) {
			const bundleName = config.bundles[i];
			this.loadBundle(bundleName);
		}
	},
	
	// loads a specific bundle by name
	loadBundle: function(bundleName) {
		this.bundles[bundleName] = require.main.require('./bundles/' + bundleName);
			
		// if bundle has an init function, then call it.
		if ("init" in this.bundles[bundleName]) {
			this.bundles[bundleName].init();
		}
	},
	
	// calls a bundle's run() method
	runBundle: function(bundleName, socket) {
		if (!("run" in this.bundles[bundleName])) {
			throw new Error('No run() method exists for bundle: ' + bundleName + ". Change config.startBundle.");
		}
		
		socket.removeAllListeners(); // remove all listeners from previous bundle
		this.bundles[bundleName].run(socket); // call run() method on bundle
	},
}
