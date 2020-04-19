"use strict"

/*
 * Primary file for the API
 *
 */

// Dependencies
const server	= require ("./lib/server")
const workers	= require ("./lib/workers")


// Declare the app
const app = {}


// init function
app.init = () => {
	// Start the server
	server.init ()

	// Start the workers
	workers.init ()
}

// Execute
app.init ()


// Export the app. Usefull in testing
module.exports = app
