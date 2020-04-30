"use strict"

/*
 * Primary file for the API
 *
 */

// Dependencies
const cluster	= require ("cluster")
const os		= require ("os")

const server	= require ("./lib/server")
const workers	= require ("./lib/workers")
const cli		= require ("./lib/cli")


// Declare the app
const app = {}


// init function
app.init = (callback) => {

	// If we're on the master thread, start the background workers and the CLI
	if (cluster.isMaster) {

		// Start the workers
		workers.init ()

		// Start the cli, but make sure it start last
		setTimeout ( () => {
			cli.init ()
			callback ()
		}, 50)

		// Fork the process
		for (let i = 0; i < os.cpus ().length; i++) {
			cluster.fork ()
		}
	}
	else {

		// If we're not on the master thread, Start the HTTP server
		server.init ()
	}

}

// Self invoking onlty if required directly
if (require.main === module) {
	app.init (function (){} )
}


// Export the app. Usefull in testing
module.exports = app
