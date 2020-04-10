/*
 * Primary file for the API
 *
 */

// Dependencies
const http			  = require ("http")
const url			  = require ("url")
const stringDecoder	  = require ("string_decoder").StringDecoder
const config		  = require ("./config.js")

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
	const headers				= req.headers

	// Get the Payload, if any
	const decoder				= new stringDecoder ("utf-8")
	let buffer					= ""	// just placeholder for string

	// using Stream
	req.on ("data", data => {
		buffer += decoder.write (data)
	})

	req.on ("end", () => {
		buffer += decoder.end ()

		// Choose the handler this request should go to. If one is not found,  use notFound handlers
		let choosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

		// Construct the data object to send to the handler
		let data = {
			"trimmedPath"			  : trimmedPath,
			"queryStringObject"		  : queryStringObject,
			"method"				  : method,
			"headers"				  : headers,
			"payload"				  : buffer
		}

		// Route the request to the handler specified in the router
		choosenHandler (data, function (statusCode, payload) {
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof (statusCode) === "number" ? statusCode : 200

			// Use the payload called back the handler, or default to an empty object
			payload = typeof (payload) === "object" ? payload : {}

			// Convert the payload to a string
			const payloadString = JSON.stringify (payload)

			// Return the response
			res.setHeader ("Content-Type", "application/json")
			res.writeHead (statusCode)
			res.end (payloadString)

			// Log the request path
			console.log ("Returning this response: ", statusCode, payloadString)
		})
	})
})

// Start the server, and have it listen on port
server.listen (config.port, () => {
	console.log (`The server is listening on port "${config.port}" in "${config.envName}" mode `)
})

// Define the handlers
let handlers = {}

// Sample handlers
handlers.sample = function (data, callback) {
	// callback a HTTP status code, and a payload object
	callback (406, {
		"name"	  : "sample handler",
		"Group"	  : "FOO"
	})
}

handlers.foo = (data, callback) => {
	callback (200, {
		"name"	  : "foo handler",
		"Group"	  : "FOO"
	})
}

// Not Found handler
handlers.notFound = function (data, callback) {
	callback (404)
}

// Define a Request Router
const router = {
	'sample'	: handlers.sample,
	"foo"		: handlers.foo
}
