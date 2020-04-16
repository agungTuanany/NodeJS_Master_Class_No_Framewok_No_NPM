"use strict"
/*
 * Request handlers
 *
 */

// Dependencies
const _data		  = require ("./data")
const helpers	  = require ("./helpers")

// Define the handlers
let handlers = {}

handlers.users = (data, callback) => {
	const acceptableMethod = ["post", "get", "put", "delete"]
	if (acceptableMethod.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback)
	}
	else {
		callback (405, {"Error": "Handlers does no exist"})
	}
}

//////////////////////////////////////////////////////////////////////////////

// Container for the users SUBMETHODS
handlers._users = {}

// User - post
// Required data : firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data, callback) => {

	// Check that all required fields are filled out
	const firstName		= typeof (data.payload.firstName) === "string" && data.payload.firstName.trim ().length > 0 ? data.payload.firstName.trim () : false
	const lastName		= typeof (data.payload.lastName) === "string" && data.payload.lastName.trim ().length > 0 ? data.payload.lastName.trim () : false
	// Phone number is area-code + 13 digit number
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 13 ? data.payload.phone.trim () : false
	const password		= typeof (data.payload.password) === "string" && data.payload.password.trim ().length > 0 ? data.payload.password.trim () : false
	const tosAgreement	= typeof (data.payload.tosAgreement) === "boolean" && data.payload.tosAgreement === true ? true : false

	if (firstName && lastName && phone && password && tosAgreement) {
		// Make sure the user doesn't already exist
		_data.read ("users", phone, (err, data) => {
			if (err) {
				// Hash the password
				const hashedPassword = helpers.hash (password)

				// Create the user object
				if (hashedPassword) {
					const userObject = {
						"firstName"			: firstName,
						"lastName"		  	: lastName,
						"phone"			  	: phone,
						"hashedPassword"  	: hashedPassword,
						"tosAgreement"	  	: true
					}

					// Store the user
					_data.create ("users", phone, userObject, (err) => {
						if (!err) {
							callback (200, {"POST": "Create new user success"})
						}
						else {
							console.log (err)
							callback (500, {"Error": "POST: Could not create the new user "})
						}
					})
				}
				else {
					callback (500, {"Error": "POST: could not hash the user's password"})
				}

			}
			else {
				// user already exist
				callback (400, {"Error": "POST: A user with that phone number already exist"})
			}
		})

	}
	else {
		//console.log (firstName, lastName, phone, password, tosAgreement)
		callback (400, {"Error": "POST: Missing required fields"})
	}
}

// User - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {

	// Check that the phone number is valid
	const phone			= typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 13 ? data.queryStringObject.phone.trim () : false

	if (phone) {
		// Get the token from the headers
		const token		= typeof (data.headers.token) === "string" ? data.headers.token : false

		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken (token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
				// Lookup the user
				_data.read ("users", phone, (err, data) => {
					if (!err && data) {
						// Remove the hashed password from the user object before returning it to the requester
						delete data.hashedPassword
						// The 'data' coming is not from _user.get () data object, it's from _data.read ()
						callback (200, data, {"GET result": "server cached"})
					}
					else {
						callback (404, {"Error": "GET method: Data you try to read is not exist"})
					}
				})
			}
			else {
				callback (403, {"Error": "GET User Method: Token invalid"})
			}
		})
	}
	else {
		callback (400, {"Error": "GET method: Missing required field"})
	}
}

// User - put
// Required data : phone
// optional data : firtsName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {

	// Check for required fields
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 13 ? data.payload.phone.trim () : false

	// Check for optional fields
	const firstName		= typeof (data.payload.firstName) === "string" && data.payload.firstName.trim ().length > 0 ? data.payload.firstName.trim () : false
	const lastName		= typeof (data.payload.lastName) === "string" && data.payload.lastName.trim ().length > 0 ? data.payload.lastName.trim () : false
	const password		= typeof (data.payload.password) === "string" && data.payload.password.trim ().length > 0 ? data.payload.password.trim () : false

	// Error if the phone is invalid
	if (phone) {

		// Error if nothing is sent to update
		if (firstName || lastName || password) {

			// Get the token from the headers
			const token		= typeof (data.headers.token) === "string" ? data.headers.token : false

			// Verify that given token is valid for the phone number
			handler._tokens.verifyToken (token, phone, (tokenIsValid) => {
				if (tokenIsValid) {
					// Lookup the user
					_data.read ("users", phone, (err, userData) => {
						if (!err && userData) {
							// Update the fields necessary
							if (firstName) {
								userData.firstNanme = firstName
							}
							if (lastName) {
								userData.lastName = lastName
							}
							if (password) {
								userData.hashedPassword = helpers.hash (password)
							}

							// Store the new update
							_data.update ("users", phone, userData, (err) => {
								if (!err) {
									callback (200, {"PUT method": "Update was successful"})
								}
								else {
									console.log (err)
									callback (500, {"Error": "PUT method: Could not update the user"})
								}
							})
						}
						else {
							callback (400, {"Error": "PUT method: The specified user does not exist"})
						}
					})
				}
				else {
					callback (403, {"Error" : "PUT User Method: Token is invalid"})
				}
			})
		}
		else {
			callback (400, {"Error": "PUT method: Missing fields to update"})
		}
	}
	else {
		callback (400, {"Error": "PUT method: Missing required fields"})
	}

}

// User - delete
// Required field : phone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {

	// Check that the phone number is valid
	const phone = typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 13 ? data.queryStringObject.phone.trim () : false

	if (phone) {
		// Get the token from the headers
		const token		= typeof (data.headers.token) === "string" ? data.headers.token : false

		handlers._token.verifyToken (token, phone, (tokenIsValid) => {
			if (tokenIsvalid) {
				// lookup the user
				_data.read ("users", phone, (err, data) => {
					if (!err && data) {
						_data.delete ("users", phone, (err) => {
							if (!err) {
								callback (200, data)
							}
							else {
								callback (500, {"Error": "Could not delete the specified user"})
							}
						})
					}
					else (400, {"Error": "Could not find the specified user"})
				})
			}
			else {
				callback (403, {"Error" : "PUT User Method: Token is invalid"})
			}
		})
	}
	else {
		callback (400, {"Error": "Missing required field"})
	}
}
//////////////////////////////////////////////////////////////////////////////

handlers.tokens = function (data, callback) {
	const acceptableMethod = ["post", "get", "put", "delete"]
	if (acceptableMethod.indexOf (data.method) > -1) {
		handlers._tokens[data.method] (data, callback)
	}
	else {
		callback (405, {"Error": "Handlers does no exist"})
	}
}

handlers._tokens = {}

// Token - post
// Required data : phone, password
// optional data : none
handlers._tokens.post = (data, callback) => {

	// Check that all required fields are filled out
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 13 ? data.payload.phone.trim () : false
	const password		= typeof (data.payload.password) === "string" && data.payload.password.trim ().length > 0 ? data.payload.password.trim () : false

	if (phone && data) {
		// lookup the user who matches that phone number
		_data.read ("users", phone, (err, userData) => {
			if (!err && userData) {
				// Has the sent password and compare it to the password stored in the user object
				const hashedPassword = helpers.hash (password)

				if (hashedPassword === userData.hashedPassword) {
					// if valid, create a new token with a random name, set expiration 1 hour in the future
					const tokenId = helpers.createRandomString(20)
					const expires = Date.now () + 1000 * 60 * 60
					const tokenObject = {
						"phone"		  : phone,
						"id"		  : tokenId,
						"expires"	  : expires
					}

					// Store the token
					_data.create ("tokens", tokenId, tokenObject, (err) => {
						if (!err) {
							callback (200, tokenObject)
						}
						else {
							callback (500, {"Error": "POST Method: Server Could not create the new token"})
						}
					})
				}
				else {
					callback (400, {"Error": "POST Method: Password did not match the specified user stored password"})
				}
			}
			else {
				callback (400, {"Error": "POST Method: Could not find specified user"})
			}
		})

	}
	else {
		callback (400, {"Error": "POST Method: Missing required fields"})
	}
}
// Token - get
// Required data : id
// Optional data : none
handlers._tokens.get = (data, callback) => {
	// Check that id is valid
	const id = typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim ().length === 20 ? data.queryStringObject.id.trim () : false

	if (id) {
		// Lookup the token
		_data.read ("tokens", id, (err, tokenData) => {
			if (!err && data) {
				callback (200, tokenData)
			}
			else {
				callback (400, {"Error": "GET Token Method: Token did not match the specified user stored password"})
			}
		})
	}
	else {
		callback (400, {"Error": "GET Token Method: Missing required field, or field invalid"})
	}

}

// Token - put
// Required data : id, extend
// Optional data : none
handlers._tokens.put = (data, callback) => {

	const id			= typeof (data.payload.id) === "string" && data.payload.id.trim ().length === 20 ? data.payload.id.trim () : false
	const extend		= typeof (data.payload.extend) === "boolean" && data.payload.extend === true ? true : false

	if (id && extend) {
		// Lookup the token
		_data.read ("tokens", id, (err, tokenData) => {
			if (!err && tokenData) {
				// Check to the token isn't already expired
				if (tokenData.expires > Date.now ()) {
					// Set the expiration an hour from now
					tokenData.expires = Date.now () + 1000 * 60 * 60

					// Store the new updates
					_data.update ("tokens", id, tokenData, (err) => {
						if (!err) {
							callback (200, tokenData)
						}
						else {
							callback (500, {"Error": "PUT Token Method: Could not update the tokens expiration"})
						}
					})
				}
				else {
					callback (400, {"Error": "PUT Token Method: The Token has already expired, and cannot be extended"})
				}
			}
			else {
				callback (400, {"Error": "PUT Token Method: Specified token does not exist"})
			}
		})

	}
	else {
		console.log (extend)
		callback (400, {"Error": "PUT Token Method: Missing required field(s) or field(s) are invalid"})
	}
}

// Token - delete
// Required data : id
// Optional data : none
handlers._tokens.delete = (data, callback) => {
	const id			= typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim ().length === 20 ? data.queryStringObject.id.trim () : false

	if (id) {
		// Lookup the token
		_data.read ("tokens", id, (err, tokenData) => {
			if (!err && tokenData) {
				// Delete the token
				_data.delete ("tokens", id, (err) => {
					if (!err) {
						callback (200, tokenData)
					}
					else {
						callback (500, {"Error": "DELETE Token Method: Could not delete the specified token"})
					}

				})

			}
			else {
				callback (400, {"Error": "DELETE Token Method: Could not find the specified token"})
			}
		})
	}
	else {
		callback (400, {"Error": "DELETE Token method: Missing required fields"})
	}
}


// General purpose function
// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
	// Lookup the token data
	_data.read ("tokens", id, (err, tokenData) => {
		if (!err && tokenData) {
			// Check that the token is for the given user and has not expired
			if (tokenData.phone === phone && tokenData.expires > Date.now ()) {
				callback (true)
			}
			else {
				callback (false)
			}
		}
		else {
			callback (false)
		}
	})
}

//////////////////////////////////////////////////////////////////////////////


// XXX XXX XXX TEST PURPOSE XXX XXX
// Since the read () method from data libs not responded well
handlers.sample = function (data, callback) {
	// Callback a http status code, and a payload objects
	callback (406, {"name": "Sample handler"})
}

//////////////////////////////////////////////////////////////////////////////

// Not Found handler
handlers.notFound = function (data, callback) {
	callback (404, {"Error": "NOT FOUND HANDLER"})
}


// Export the handlers
module.exports = handlers
