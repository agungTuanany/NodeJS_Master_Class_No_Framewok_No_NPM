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
	const parsedUrl =url.parse(req.url, true)

	// Get the path
	const path					= parsedUrl.pathname
	const trimmedPath 			= path.replace(/^\/+|\/+$/g, "")

	// Get the query string as an object
	const queryStringObject		= parsedUrl.query

	// Get the HTTP Method
	const method				= req.method.toLowerCase ()

	// Get the headers as an object
	const header				= req.headers

	// Send the response
	res.end ("Hello world\n")

	// log the request path
	console.log (`Request recieved on path: "${trimmedPath}" with method: "${method}"`)
	console.log ("Query string parameters:", queryStringObject)
	console.log ("request recieved with thsese headers: ", header)
})







// Start the server, and have it listen on port
server.listen (port, () => {
	console.log (`The server is listening on port ${port} now`)
})
