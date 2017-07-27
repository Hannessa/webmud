
# WebMUD

A modular MUD framework based on [Socket.IO](https://socket.io/) instead of Telnet, with a web-based client for connecting to the MUD through your browser. It uses [LokiJS](http://lokijs.org) for fast persistant in-memory storage, which works with the database in memory, but saves it to a database.json file at regular intervals.

## Features

- Sets up a simple web server (Express) with an interface for connecting to the MUD right through your browser.
- A modular approach from the ground up, allowing it to be used as a micro framework for any type of MUD.
- Includes basic MUD objects and commands such as rooms, characters and NPC:s.

## Bundles

The modules in WebMUD are called *bundles* and are placed in the "/bundles" directory, and can be anything from a parser for a login screen to an in-game command, or an entire combat engine. What bundles are loaded at startup is set in config.js, as well as what initial bundle to run.

A bundle can have both an init() method that is run as soon as the server starts, and a run() method if you want to run it later. The following bundles are included by default:
* database: Sets up a LokiJS database.
* welcome: The first bundle that is run that displays a welcome message to the user.
* login: This bundle is called from the "welcome" bundle and gives step-by-step instructions for logging in or creating a new account.
* character-creator: After logging in, this bundle is run to help you create an in-game character.
* world: After choosing a character, you're sent into the game world. This bundle also handles parsing of in-game commands.
* command-*: The bundles named "command-" adds support for a command that can be used in the game world. For example "command-look" adds support for the "look" command, which you can type to look at the room you're standing in or examine an object.

## Installation

1. Clone the repository into a local folder and go into that folder.
2. Type `npm install` in the terminal to install all required packages.
3. Type `npm start` to start the web server.

Point your browser to `http://localhost:3000` to connect to your MUD.
