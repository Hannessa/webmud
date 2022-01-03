var express = require('express');
var path = require('path');
var socketio = require('socket.io')
var config = require.main.require('./config.js');
var bundleServer = require.main.require('./bundles/server.js');

// Setup basic express server
var app = express();
var port = config.port;

// Express middleware routing for static files
app.use(express.static(path.join(__dirname, "public")));

// Start Express-server
var server = app.listen(port, () => {
	console.log('Server listening at port %d', port);
})

// Start socket.io server
var io = socketio(server);

// Start bundle server
bundleServer.start(io);
