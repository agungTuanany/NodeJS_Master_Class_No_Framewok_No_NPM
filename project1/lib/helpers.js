"use strict"
/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto		= require ("crypto")
const config	  	= require ("./config")
const https			= require ("https")
const querystring 	= require ("querystring")

// Container for all the helpers
const helpers = {}

// Create a SHA256 hash
helpers.hash = function (str) {
	if (typeof (str) === "string" && str.length > 0) {
		const hash = crypto.createHmac ("sha256", config.hashingSecret).update (str).digest ("hex")
		return hash
	}
	else {
		return false
	}
}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
	try {
		const obj = JSON.parse (str)
		return obj
	}
	catch (e) {
		return {
			"Error": "Error from helpers.parseToObject"
		}
	}
}

// Create a string random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
	strLength = typeof (strLength) === "number" && strLength > 0 ? strLength : false

	if (strLength) {
		// Define all the possible characters that could go into a string
		const possibleCharacters = "abcdefghijklmnopqlrstuvwxyz0123456789"

		// Start the final string
		let str = ""

		for (let i = 1; i <= strLength; i= i + 1) {
			// Get a random character from the possibleCharacters string
			const randomCharacter = possibleCharacters.charAt (Math.floor (Math.random () * possibleCharacters.length))

			// Append this characters to the final string
			str += randomCharacter
		}
		return str
	}
	else {
		return false
	}
}

// Send an SMS message via Twilio
helpers.sendTwilioSms = function (phone, msg, callback) {
	// Validate parameter
	phone = typeof (phone) === "string" && phone.trim ().length >= 12 ? phone.trim () : false
	msg	  = typeof (msg) === "string" && msg.trim ().length > 0 && msg.trim ().length <= 160 ? msg.trim () : false

	if (phone && msg) {
		// Config the request payload
		const payload = {
			"From"		  : config.twilio.fromPhone,
			"To"		  : "+1"+phone,
			"Body"		  : msg
		}

		// Stringify the payload
		const stringPayload = querystring.stringify (payload)

		// Configure the request details
		const requestDetails = {
			"protocol"		  : "https:",
			"hostname"		  : "api.twilio.com",
			"method"		  : "POST",
			"path"			  : "/2010-04-01/Accounts/"+config.twilio.accountSid+"/Messages.json",
			"auth"			  : config.twilio.accountSid+":"+config.twilio.authToken,
			"headers"		  : {
				"Content_Type"	  : "application/x-www-form-urlencoded",
				"Content-Length"  : Buffer.byteLength (stringPayload)
			}
		}
		// Instantiate the request object
		const req = https.request (requestDetails, (res) => {
			// Grab the status of the sent request
			const status = res.statusCode
			// callback successfully if the request went through
			if (status == 200 || status == 201) {
				callback (false)
			}
			else {
				callback ("Status code from 'Twilio' returned was: " +status)
				console.log (phone, msg)
			}
		})

		// Bind to the error event so it doesn't get thrown
		req.on ("error", (e) => {
			callback (e)
		})

		// Add the payload
		req.write (stringPayload)

		// end the the request
		req.end ()
	}
	else {
		callback ("Given parameters were missing or invalid")
		console.log (phone, msg)
	}
}

// Export the module
module.exports = helpers
