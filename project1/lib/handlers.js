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
// @TODO only let an authenticated user access their object. Don't let them access anyone else's
handlers._users.get = (data, callback) => {

	// Check that the phone number is valid
	const phone = typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 13 ? data.queryStringObject.phone.trim () : false

	if (phone) {
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
		callback (400, {"Error": "GET method: Missing required field"})
	}

}

// User - put
// Required data : phone
// optional data : firtsName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user update their object, Don't let them access update less
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
			callback (400, {"Error": "PUT method: Missing fields to update"})
		}
	}
	else {
		callback (400, {"Error": "PUT method: Missing required fields"})
	}

}

// User - delete
// Required field : phone
// @TODO Only let an authenticated user delete their object. Don't let them delete any one else
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {

	// Check that the phone number is valid
	const phone = typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 13 ? data.queryStringObject.phone.trim () : false

	if (phone) {
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
		callback (400, {"Error": "Missing required field"})
	}
}

//////////////////////////////////////////////////////////////////////////////

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
	callback (404, {"Error": "User you request not in database"})
}


// Export the handlers
module.exports = handlers
