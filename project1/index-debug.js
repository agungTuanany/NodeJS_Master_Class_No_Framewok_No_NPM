"use strict"

/*
 * Primary file for the API
 *
 */

// Dependencies
const server	= require ("./lib/server")
const workers	= require ("./lib/workers")
const cli		= require ("./lib/cli")
const exampleDebuggingProblem	= require ("./lib/exampleDebuggingProblem")


// Declare the app
const app = {}


// init function
app.init = () => {
	// Start the server
	debugger
	server.init ()
	debugger

	// Start the workers
	debugger
	workers.init ()
	debugger

	// Start the cli, but make sure it start last
	debugger
	setTimeout ( () => {
		cli.init ()
	debugger
	}, 50)
	debugger

/////////////////////////////////////////////////////////
// XXX TEST PURPOSE XXX

	// set foo at 1
	let foo = 1
	console.log ("Just aassigned 1 to foo")
	debugger

	// Increment foo
	foo ++
	console.log ("Just increment foo")
	debugger

	// Square foo
	foo = foo * foo
	console.log ("Just square a foo")
	debugger

	// Convert foo to a string
	foo = foo.toString ()
	console.log ("Just converted foo to string")
	debugger

/////////////////////////////////////////////////////////
	// Call the Debug script that will throw
	exampleDebuggingProblem.init ()
	console.log ("Just called the library")
	debugger
}

// Execute
app.init ()


// Export the app. Usefull in testing
module.exports = app
