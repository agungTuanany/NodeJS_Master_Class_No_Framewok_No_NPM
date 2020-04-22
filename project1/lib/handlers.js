"use strict"
/*
 * Request handlers
 *
 */

// Dependencies
const _data		  = require ("./data")
const helpers	  = require ("./helpers")
const config	  = require ("./config")

// Define the handlers
let handlers = {}


/*
 * HTML Handlers
*/

// Index handler
handlers.index = (data, callback) => {
	// Reject any request that isn't a GET
	if (data.method === "get") {

		// Prepare data for interpolation
		const templateData = {
			"head.title"		: "This is the title",
			"head.description"	: "This is the meta description",
			"body.title"		: "Hello template wolrd!",
			"body.class"		: "index"
		}

		// Read in the template as a string
		helpers.getTemplate ("index", templateData, (err, str) => {
			if (!err && str) {
				// Add the universal header and footer
				helpers.addUniversalTemplate (str, templateData, (err, str) => {
					if (!err && str) {
						callback (200, str, "html")
					}
					else { callback (500, undefined, "html") }
				})
			}
			else { callback (500, undefined, "html") }
		})
	}
	else { callback (405, undefined, "htnl") }
}

// Favicon
handlers.favicon = (data, callback) => {
	// Reject any request that isn't a GET
	if (data.method === "get") {

		// Read in the favicon's data
		helpers.getStaticAsset ("favicon.ico", (err, data) => {
			if (!err && data) {
				// Callback the data
				callback (200, data, "favicon")
			}
			else { callback (500)}
		})
	}
	else { callback (405, "Cannot find favicon.ico") }
}

handlers.public = (data, callback) =>{
	// Reject any request that isn't a GET
	if (data.method === "get") {

		// Get the filename being requested
		let trimmedAssetName = data.trimmedPath.replace ("public/", "").trim ()

		if (trimmedAssetName.length > 0) {
			// Read in the asset's data
			helpers.getStaticAsset (trimmedAssetName, (err, data) => {
				if (!err && data) {

					// Determine the content type (defaulty to plain text)
					let contentType = "plain"

					if (trimmedAssetName.indexOf (".css") > -1) {
						contentType = "css"
					}

					if (trimmedAssetName.indexOf (".png") > -1) {
						contentType = "png"
					}

					if (trimmedAssetName.indexOf (".jpg") > -1) {
						contentType = "jpg"
					}

					if (trimmedAssetName.indexOf (".ico") > -1) {
						contentType = "favicon"
					}

					if (trimmedAssetName.indexOf (".js") > -1) {
						contentType = "js"
					}

					// Callback the data
					callback (200, data, contentType)
				}
				else {
					console.log ("error", err)
					callback (404)
				}
			})
		}
		else {
			console.log ("error", trimmedAssetName)
			callback (404)
		}
	}
	else { callback (405) }
}


/*
 * JSON API Handlers
*/

handlers.users = (data, callback) => {
	const acceptableMethod = ["post", "get", "put", "delete"]
	if (acceptableMethod.indexOf(data.method) > -1) {
		handlers._users[data.method] (data, callback)
	}
	else {
		callback (405, {"Error": "Handlers does no exist"})
	}
}

//////////////////////////////////////////////////////////////////////////////

// Container for the users submethod
handlers._users = {}

// User - post
// Required data : firstName, lastName, phone, password, tosAgreement
// optional data: none
// XXX XXX TODO: Since user post save a data as phone-number.json when saved all
// the regex symbol was truncate, should restore to the state international
// symbol which is "+"
handlers._users.post = (data, callback) => {

	// Check that all required fields are filled out
	const firstName		= typeof (data.payload.firstName) === "string" && data.payload.firstName.trim ().length > 0 ? data.payload.firstName.trim () : false
	const lastName		= typeof (data.payload.lastName) === "string" && data.payload.lastName.trim ().length > 0 ? data.payload.lastName.trim () : false
	// Phone number is area-code + 12 digit number
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 12 ? data.payload.phone.trim () : false
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
							console.log (data)
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
// XXX TODO: should not truncate the trimmedPath in phone number cause the queryStringObject cannot read "+" symbol
handlers._users.get = (data, callback) => {

	// Check that the phone number is valid
	const phone			= typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 12 ? data.queryStringObject.phone.trim () : false

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
		console.log (phone)
		callback (400, {"Error": "GET method: Missing required field"})
	}
}

// User - put
// Required data : phone
// optional data : firtsName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {

	// Check for required fields
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 12 ? data.payload.phone.trim () : false

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
// Optional field : none
// Cleanup old checks associated with the user
handlers._users.delete = (data, callback) => {

	// Check that the phone number is valid
	const phone = typeof (data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 12 ? data.queryStringObject.phone.trim () : false

	if (phone) {
		// Get token from headers
		const token = typeof (data.headers.token) === "string" ? data.headers.token : false

		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken (token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
				// Lookup the user
				_data.read ("users", phone, (err, userData) => {
					if (!err && userData) {
						_data.delete ("users", phone, (err) => {
							if (!err) {
								//callback (200, {"DELETE User Method: Success delete users"})
								// Delete each checks associated with the user
								const userChecks = typeof (userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : []
								const checksToDelete = userChecks.length

								if (checksToDelete > 0) {
									let checksDeleted = 0
									let deletionErrors = false

									// Loop through the checks
									userChecks.forEach ( (checkId) => {
										// Delete the check
										_data.delete ("checks", checkId, (err) => {
											if (err) {
												deletionErrors = true
											}
											checksDeleted++

											if (checksDeleted === checksToDelete) {
												if (!deletionErrors) {
													callback (200)
												}
												else {
													callback ({"Error": "DELETE User Method: Error encountered while attempting to delete all of the user's checks. All checks may not have been deleted from system successfully"})
												}
											}
										})

									})
								}
								else {
									callback (200)
								}
							}
							else {
								callback (500, {"Error": "DELETE User Method : Could not delete the specific user"})
								console.log ("your Error while attempting to call _data.delete", err)
							}
						})
					}
					else {
						callback (400, {"Error": "DELETE User Method: Could not find the specific user"})
						console.log ("your Error while attempting to call _data.read: ", err)
						console.log ("your data while attempting to call _data,read: ", data)
					}
				})
			}
			else {
				callback (403, {"Error": "DELETE User method: Missing required 'token' in header, or token is invalid"})
				console.log ("your token from verifyToken: ", token)
			}
		})
	}
	else {
		callback (400, {"Error":"DELETE User Method, Missing required field. Something Error in your request"})
		console.log ("your phone number should not be 'false'", phone)
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

// Container for all the "tokens" submethods
handlers._tokens = {}

// Token - post
// Required data : phone, password
// optional data : none
handlers._tokens.post = (data, callback) => {

	// Check that all required fields are filled out
	const phone			= typeof (data.payload.phone) === "string" && data.payload.phone.trim ().length >= 12 ? data.payload.phone.trim () : false
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
						"tokenId"		  : tokenId,
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


// XXX XXX XXX General purpose function XXX XXX XXX
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

handlers.checks = function (data, callback) {
	const acceptableMethod = ["post", "get", "put", "delete"]
	if (acceptableMethod.indexOf (data.method) > -1) {
		handlers._checks[data.method] (data, callback)
	}
	else {
		callback (405, {"Error": "Handlers does no exist"})
	}
}

// Container for all the "checks" submethods
handlers._checks = {}

// Checks - post
// Required data : protocol, url, method, successCodes, timeoutSeconds
// Optional data : none
handlers._checks.post = (data, callback) => {
	// Validate inputs
	const protocol		  = typeof (data.payload.protocol) === "string" && ["http", "https"].indexOf (data.payload.protocol) > -1 ? data.payload.protocol : false
	const url			  = typeof (data.payload.url) === "string" &&  data.payload.url.trim ().length > 0 ? data.payload.url.trim () : false
	const method		  = typeof (data.payload.method) === "string" && ["post", "get", "put", "delete"].indexOf (data.payload.method) > -1 ? data.payload.method : false
	const successCodes	  = typeof (data.payload.successCodes) === "object" &&  data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
	const timeoutSeconds  = typeof (data.payload.timeoutSeconds) === "number" &&  data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

	if (protocol && url && method && successCodes && timeoutSeconds) {
		// Get the token from the headers
		const token		  = typeof (data.headers.token) === "string" ? data.headers.token : false

		// Lookup the user by reading the token
		_data.read ("tokens", token, (err, tokenData) => {
			if (!err && tokenData) {
				const userPhone = tokenData.phone

				// Lookup the user data
				_data.read ("users", userPhone, (err, userData) => {
					if (!err && userData) {
						const userChecks = typeof (userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : []

						// Verify that user has less than the number of max-checks-per-user
						if (userChecks.length < config.maxChecks) {
							// Create a random id for the check
							const checkId = helpers.createRandomString(20)

							// create the check object, and include the user's phone
							const checkObject = {
								"checkId"		  : checkId,
								"userPhone"		  : userPhone,
								"protocol"		  : protocol,
								"url"			  : url,
								"method"		  : method,
								"successCodes"	  : successCodes,
								"timeoutSeconds"  : timeoutSeconds
							}

							// Save the object
							_data.create ("checks", checkId, checkObject, (err) => {
								if (!err) {
									// Add the check id to the user's object
									userData.checks	= userChecks
									userData.checks.push (checkId)

									_data.update ("users", userPhone, userData, (err) => {
										if (!err) {
											// Return the data about the new chec
											callback (200, checkObject)

										}
										else {
											callback (500, {"Error": "POST Checks Method: could not update the user with the new chec"})
										}
									})

								}
								else {
									callback (500, {"Error": "POST Checks Method: Could not create the new check"})
								}
							})

						}
						else {
							callback (400, {"Error": "POST Checks Method: The user already has the maximum number checks ('+config.maxChecks+')"})
						}
					}
					else {
						callback (403, {"Error": "POST Checks Method: Not Authorized userData"})
					}
				})
			}
			else {
				callback (403, {"Error": "POST Checks Method: Not Authorized tokenData"})
			}
		})

	}
	else {
		console.log (protocol, url, method, successCodes, timeoutSeconds)
		callback (400, {"Error": "POST Checks Method: Missing required field, or inputs are invalid"})
	}
}

// Checks - get
// Required data : id
// Optional data ; none
handlers._checks.get = (data, callback) => {
	// Check that id is valid
	const id			= typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim ().length === 20 ? data.queryStringObject.id.trim () : false

	if (id) {
		// lookup the check
		_data.read ("checks", id, (err, checkData) => {
			if (!err && checkData) {
				// Get the token sent the request
				const token = typeof (data.headers.token) === "string" ? data.headers.token : false

				// Verify that given token is valid and belongs to the user who created the check
				console.log ("This is check data ", checkData)
				handlers._tokens.verifyToken (token, checkData.userPhone, (tokenIsValid) => {
					if (tokenIsValid) {
						// Return check data
						console.log (id)
						callback (200, checkData)
					}
					else {
						callback (403, {"Error": "GET Checks Method: Your checkData is invalid"})
					}
				})

			}
			else {
				callback (404, {"Error": "GET Checks Method: data you request not exist"})
			}
		})
	}
	else {
		console.log (data)
		callback (400, {"Error": "GET Checks Method: Missing required field, or input are invalid "})
	}
}

// Checks - put
// Required data : id
// Optional data : protocol, url, method, successCodes, timeoutSeconds (one must be set)
handlers._checks.put = (data, callback) => {
	// Check Required field
	const id			  = typeof (data.payload.id) === "string" && data.payload.id.trim ().length === 20 ? data.payload.id.trim () : false

	// Check optional field
	const protocol		  = typeof (data.payload.protocol) === "string" && ["https, http"].indexOf (data.payload.protocol) > -1 ? data.payload.protocol : false
	const url			  = typeof (data.payload.url) === "string" && data.payload.url.trim ().length > 0 ? data.payload.url.trim () : false
	const method		  = typeof (data.payload.method) === "string" && ["post", "get", "put", "delete"].indexOf (data.payload.method) > -1 ? data.payload.method : false
	const successCodes	  = typeof (data.payload.successCodes) === "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
	const timeoutSeconds  = typeof (data.payload.timeoutSeconds) === "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

	// Error if id is invalid
	if (id) {
		// Error if nothing is sent to update
		if (protocol || url || method || successCodes || timeoutSeconds) {
			// Lookup the check
			_data.read ("checks", id, (err, checkData) => {
				if (!err && checkData) {
					// Get the token that sent request
					const token = typeof (data.headers.token) === "string" ? data.headers.token : false

					// Verify that the given token is valid and belongs to the user who created the check
					handlers._tokens.verifyToken (token, checkData.userPhone, (tokenIsValid) => {
						if (tokenIsValid) {

							if (protocol) {
								checkData.protocol = protocol
							}
							if (url) {
								checkData.url = url
							}
							if (method) {
								checkData.method = method
							}
							if (successCodes) {
								checkData.successCodes = successCodes
							}
							if (timeoutSeconds) {
								checkData.timeoutSeconds = timeoutSeconds
							}

							// Store the new updates
							_data.update ("checks", id, checkData, (err) => {
								if (!err) {
									callback (200, checkData)

								}
								else {
									callback (500, {"Error": "PUT Checks Method: Could not update the check | internal server error"})
								}
							})

						}
						else {
							console.log ("your token should be true, but the result is: ", token)
							callback (403, {"Error": "PUT Checks Method: token is not valid, please renew the token"})
						}
					})
				}
				else {
					console.log (err)
					callback (403, {"Error": "Check ID did not exist"})
				}
			})

		}
		else {
			callback (400, {"Error": "PUT Checks Method: Missing fields to update"})
		}

	}
	else {
		callback (400, {"Error": "PUT Checks Method: Missing required fields, or input are invalid"})
	}
}

// Checks - delete
// Required data : id
// Optional data : none
handlers._checks.delete = (data, callback) => {
	// Check that id is valid
	const id			= typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim ().length === 20 ? data.queryStringObject.id.trim () : false

	if (id) {
		// Lookup the check
		_data.read ("checks", id, (err, checkData) => {
			if (!err && checkData) {
				// Get the token that sent the request
				const token = typeof (data.headers.token) === "string" ? data.headers.token : false

				// Verify that the token that sent the request
				handlers._tokens.verifyToken (token, checkData.userPhone, (tokenIsValid) => {
					if (tokenIsValid) {

						// Delete the check data
						_data.delete ("checks", id, (err) => {
							if (!err) {

								// Lookup the user's object to get all their checks
								_data.read ("users", checkData.phone, (err) => {
									if (!err) {
										const userChecks = typeof (userData.cheks) === "object" && userData.checks instanceof Array ? userData.checks : []

										// Remove the deleted check rom their list of checks
										const checkPosition = userChecks.indexOf (id)
										if (checkPosition > -1) {
											userChecks.splice (checkPosition, 1)

											// Re-save the user's data
											userData.chekcs = userChecks
											_data.update ("users", checkData.userPhone, userData, (err) => {
												if (!err) {
													callback (200, {"DELETE CHECK METHOD" : "Success"})
												}
												else {
													callback (500, {"Error": "DELETE Checks Method Could not update the user"})
												}
											})
										}
										else {
											callback (500, {"Error": "DELETE Chekcs Method: Could not find the check on the user's object, so could not remove it"})
										}
									}
									else {
										callback (500, {"Error": "Delete Checks Method: Could not find the user who created the checks, so could not remove the check from the list of checks on their user object"})
									}
								})
							}
							else {
								callback (500, {"Error": "DELETE Checks Method: Could not delete check data"})
							}
						})
					}
					else {
						callback (403,  {"Error": "DELETE Checks Method: The token is not valid"})
					}
				})
			}
			else {
				console.log (err)
				callback (400, {"Error": "DELETE Checks Method: The check id specified could not be found ('+id+'), or the token is not entered"})
			}
		})

	}
	else {
		callback (400, {"Error": "DELETE Checks Method: Missing required fields, or input are invalid"})
	}

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
