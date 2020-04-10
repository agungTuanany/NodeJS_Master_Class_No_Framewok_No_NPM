/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require ("http")

//
const port = 8080

// The server should respond to all request with a string
const server = http.createServer ((req, res) => {
	res.end ("Hello world")
})

// Start the server, and have it listen on port
server.listen (port, () => {
	console.log (`The server is listening on port ${port}`)
})
