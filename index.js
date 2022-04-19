const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const config = require.main.require('./config.js');
const bundleServer = require.main.require('./bundles/server.js');

// Setup basic express server
const app = express();
const port = config.port;

// Express middleware routing for static files
app.use(express.static(path.join(__dirname, "public")));

// Start Express-server
const server = app.listen(port, () => {
	console.log('Server listening at port %d', port);
});

// Start socket.io server
const io = socketIo(server);

// Start bundle server
bundleServer.start(io);
