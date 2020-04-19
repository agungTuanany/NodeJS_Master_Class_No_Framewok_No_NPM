/*
 * Create and export configuration variables
 *
*/
// Dependencies
const env	= require ("./.env")

const environments = {}

// Staging (default) environment
environments.staging = {
	"httpPort"		  : 8080,
	"httpsPort"	  	  : 8086,
	"envName"	  	  : "staging",
	"hashingSecret"	  : "thisIsASecret",
	"maxChecks"		  : 5,
	"twilio"		  : {
		"accountSid"	: env.TWILIO_ACCOUNT_SID,
		"authToken"		: env.TWILIO_AUTH_TOKEN,
		"fromPhone"		: env.TWILIO_PHONE_NUMBER
	}
}

// Production environment
environments.production = {
	"httpPort"		  : 6073,
	"httpsPort"	  	  : 6077,
	"envName"	  	  : "production",
	"hashingSecret"	  : "thisIsASecret",
	"maxChecks"		  : 5,
	"twilio"		  : {
		"accountSid"	: "",
		"authToken"		: "",
		"fromPhone"		: ""
	}
}

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) === "string" ? process.env.NODE_ENV.toLowerCase() : ""

// check that the current environments is one of the environment list, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport
