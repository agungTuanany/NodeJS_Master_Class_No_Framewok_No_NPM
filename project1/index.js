/*
 * Primary file for the API
 *
 */

// Dependencies
const http			  = require ("http")
const url			  = require ("url")
const stringDecoder	  = require ("string_decoder").StringDecoder

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

	// Get the Payload, if any
	const decoder				= new StringDecoder ("utf-8")
	let buffer					= ""	// just placeholder for string

	// using Stream
	req.on ("data", data => {
		buffer += decoder.write (data)
	})

	req.on ("end", () => {
		buffer += decoder.end ()

		// Send the response
		res.end ("Hello world\n")

		// log the request path
		//	console.log (`Request recieved on path: "${trimmedPath}" with method: "${method}"`)
		//	console.log ("Query string parameters:", queryStringObject)
		//	console.log ("Request recieved with thsese headers: ", header)
		console.log ("Reqest recived with this payload: ", buffer)
	})
})







// Start the server, and have it listen on port
server.listen (port, () => {
	console.log (`The server is listening on port ${port} now`)
})
