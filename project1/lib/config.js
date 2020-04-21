/*
 * Create and export configuration variables
 *
*/

const environments = {}

// Staging (default) environment
environments.staging = {
	"httpPort"		  : 8080,
	"httpsPort"	  	  : 8086,
	"envName"	  	  : "staging",
	"hashingSecret"	  : "thisIsASecret",
	"maxChecks"		  : 5,
	"twilio"		  : {
		"accountSid"	: "Cb32d411ad7fe886aac54c665d25e5c5d",
		"authToken"		: "9455e3eb3109edc12e3d8c92768f7a67",
		"fromPhone"		: 15005550006
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
