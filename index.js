// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var path = require('path');
var config = require.main.require('./config.js');
var socketServer = require.main.require('./utils/socket-server.js');

// Start HTTP-server
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Static file routing for HTTP-server using Express
app.use(express.static(path.join(__dirname, "public")));

// Start socket server
socketServer.start(io);
