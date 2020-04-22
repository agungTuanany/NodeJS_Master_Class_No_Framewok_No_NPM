"use strict"
/*
 * Frontend logic for te Application
 *
*/

const app = {}

// Config
app.config = {
	"sessionToken"		  : false
}

// AJAX Client (for the RESTFUL API)
app.client = {}

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {

	// Set defaults | sanity checks
	headers			  = typeof (headers) === "object" && headers !== null ? headers : {}
	path			  = typeof (path) === "string" ? path : "/"
	method			  = typeof (method) === "string" && ["POST", "GET", "PUT", "DELETE"].indexOf (method.toUpperCase ()) > -1 ? method.toUpperCase () : "GET"
	queryStringObject = typeof (queryStringObject) === "object" && queryStringObject !== null ? queryStringObject : {}
	payload			  = typeof (payload) === "object" && payload !== null ? payload : {}
	callback		  = typeof (callback) === "function" ? callback : false

	// For each query parameter sent, add it to the path
	const requestUrl  = path+"?"
	let counter	  = 0

	for (let queryKey in queryStringObject) {
		if (queryStringObject.hasOwnProperty (queryKey)) {
			counter++

			// If at least one query string parameter has already been added, prepend new ones with an ampresand (&)
			if (counter > 1) {
				requestUrl+= "&"
			}
			// Add the key and value
			requestUrl+= queryKey+"="+queryStringObject[queryKey]
		}
	}

	// Form the http request as JSON type
	const xhr = new XMLHttpRequest ()
	xhr.open (method, requestUrl, true)
	xhr.setRequestHeader ("Content-Type", "application/json")

	// For each header sent, add it to the request
	for (let headerKey in headers) {
		if (headers.hasOwnProperty (headerKey)) {
			xhr.setRequestHeader (headerKey, headers[headerKey])
		}
	}

	// If there is a current session token set, and that as a header
	if (app.config.sessionToken) {
		xhr.setRequestHeader ("token", app.config.sessionToken.id)
	}

	// When the request comes back, handle the response
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			const statusCode		= xhr.status
			const responseReturned	= xhr.responseText

			// Callback if requested
			if (callback) {
				try {
					const parsedResponse = JSON.parse (responseReturned)
					callback (statusCode, parsedResponse)
				}
				catch (e) {
					callback (statusCode, false)
				}
			}
		}
	}

	// Send the payload as JSON
	const payloadString = JSON.stringify (payload)
	xhr.send (payloadString)

}
