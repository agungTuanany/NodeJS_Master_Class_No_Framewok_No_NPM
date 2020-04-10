/*
 * Create and export configuration variables
 *
*/

let environments = {}

// Staging (default) environment
environments.staging = {
	"port"	  : 8080,
	"envName" : "staging"
}

// Production environment
environments.production = {
	"port"	  : 6073,
	"envName" : "production"
}

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) === "string" ? process.env.NODE_ENV.toLowerCase() : ""

// check that the current environments is one of the environment list, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport
