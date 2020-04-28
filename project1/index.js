"use strict"

/*
 * Primary file for the API
 *
 */

// Dependencies
const server	= require ("./lib/server")
const workers	= require ("./lib/workers")
const cli		= require ("./lib/cli")


// Declare the app
const app = {}


// init function
app.init = () => {
	// Start the server
	server.init ()

	// Start the workers
	workers.init ()

	// Start the cli, but make sure it start last
	setTimeout ( () => [
		cli.init ()
	], 50)
}

// Execute
app.init ()


// Export the app. Usefull in testing
module.exports = app
