/*
 * Create and export configuration variables
 *
 */

const environments = {}

// Staging (default) environment
environments.staging = {
    "httpPort"          : 8081,
    "httpsPort"         : 8086,
    "envName"           : "staging",
    "hashingSecret"     : "thisIsASecret",
    "maxChecks"         : 5,
    "twilio"            : {
        "accountSid"        : "Cb32d411ad7fe886aac54c665d25e5c5d",
        "authToken"         : "9455e3eb3109edc12e3d8c92768f7a67",
        "fromPhone"         : 15005550006
    },
    "templateGlobals"   : {
        "appName"           : "UptimeChecker",
        "companyName"       : "DaunJRK, Inc",
        "yearCreated"       : "2020",
        "baseUrl"           : "http://localhost:8080/"
    }
}

// Production environment
environments.production = {
    "httpPort"          : 6073,
    "httpsPort"         : 6077,
    "envName"           : "production",
    "hashingSecret"     : "thisIsASecret",
    "maxChecks"         : 5,
    "twilio"            : {
        "accountSid"        : "",
        "authToken"         : "",
        "fromPhone"         : ""
    },
    "templateGlobals"   : {
        "appName"           : "UptimeChecker",
        "companyName"       : "DaunJRK, Inc",
        "yearCreated"       : "2020",
        "baseUrl"           : "http://localhost:6073/"
    }
}

// Testing environment
environments.testing = {
    "httpPort"          : 4000,
    "httpsPort"         : 4001,
    "envName"           : "testing",
    "hashingSecret"     : "thisIsASecret",
    "maxChecks"         : 5,
    "twilio"            : {
        "accountSid"        : "Cb32d411ad7fe886aac54c665d25e5c5d",
        "authToken"         : "9455e3eb3109edc12e3d8c92768f7a67",
        "fromPhone"         : 15005550006
    },
    "templateGlobals"   : {
        "appName"           : "UptimeChecker",
        "companyName"       : "DaunJRK, Inc",
        "yearCreated"       : "2020",
        "baseUrl"           : "http://localhost:4000/"
    }
}

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) === "string" ? process.env.NODE_ENV.toLowerCase() : ""

// check that the current environments is one of the environment list, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport
