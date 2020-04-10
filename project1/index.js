/*
 * Primary file for the API
 *
 */

// Dependencies
const http	  = require ("http")
const url	  = require ('url')

//
const port = 8080

// The server should respond to all request with a string
const server = http.createServer ((req, res) => {

	// Get the URL and parse it
	let parsedUrl =url.parse(req.url, true)

	// Get the path
	let path = parsedUrl.pathname
	let trimmedPath = path.replace(/^\/+|\/+$/g, "")

	// Send the response
	res.end ("Hello world\n")

	// log the request path
	console.log (`Request recieved on path ${trimmedPath}`)
})







// Start the server, and have it listen on port
server.listen (port, () => {
	console.log (`The server is listening on port ${port} now`)
})
