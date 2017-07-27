
# WebMUD

A modular MUD framework based on [Socket.IO](https://socket.io/) instead of Telnet. It uses [LokiJS](http://lokijs.org) for fast persistant in-memory storage, which stores all data into a database.json file in the project folder.

## Features

- Sets up a simple web server with an interface for connecting to the MUD right through your browser.
- A modular approach from the ground up, allowing it to be used as a micro framework for any type of MUD.
- Includes basic MUD objects and commands such as rooms, characters and NPC:s.

## Installation

```
$ Clone the repository into a local folder and go into that folder.
$ Type 'npm install' in the terminal to install all required packages.
$ Type 'npm start' to start the web server.
```

Point your browser to `http://localhost:3000` to connect to your MUD.
