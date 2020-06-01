"use strict"
/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto        = require ("crypto")
const config        = require ("./config")
const https	        = require ("https")
const querystring   = require ("querystring")
const path          = require ("path")
const fs            = require ("fs")

// Container for all the helpers
const helpers = {}

////////////////////////////////////////////////////////////////////
//
// Sample for testing that simply returns a number
helpers.getANumber = () => {
    return 1
}

////////////////////////////////////////////////////////////////////



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
        return {}
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
            "From"  : config.twilio.fromPhone,
            "To"    : "+1"+phone,
            "Body"  : msg
        }

        // Stringify the payload
        const stringPayload = querystring.stringify (payload)

        // Configure the request details
        const requestDetails = {
            "protocol"      : "https:",
            "hostname"      : "api.twilio.com",
            "method"        : "POST",
            "path"          : "/2010-04-01/Accounts/"+config.twilio.accountSid+"/Messages.json",
            "auth"          : config.twilio.accountSid+":"+config.twilio.authToken,
            "headers"       : {
                "Content_Type"      : "application/x-www-form-urlencoded",
                "Content-Length"    : Buffer.byteLength (stringPayload)
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

        // end the request
        req.end ()


    }
    else {
        callback ("Given parameters were missing or invalid")
        console.log (phone, msg)
    }
}


// Get the string content of a template
helpers.getTemplate = function (templateName, data, callback) {
    // sanity check
    templateName    = typeof (templateName) === "string" && templateName.length > 0 ? templateName : false
    data            = typeof (data) === "object" && data !== null ? data : {}

    if (templateName) {
        let templatesDir = path.join (__dirname, "/../templates/")
        fs.readFile (templatesDir+templateName+".html", "utf-8", (err, str) => {
            if (!err && str && str.length > 0) {
                // Do interpolation on the string
                const finalString = helpers.interpolate (str, data)
                callback (false, finalString)
            }
            else {
                callback ("No template could be found")
            }
        })
    }
    else {
        callback ("A valid template name was not specified")
    }
}

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation (penyisipan)
helpers.addUniversalTemplate = function (str, data, callback) {
    str     = typeof (str) === "string" && str.length > 0 ? str : ""
    data    = typeof (data) === "object" && data !== null ? data : {}

    // Get the header
    helpers.getTemplate ("_header", data, (err, headerString) => {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate ("_footer", data, (err, footerString) => {
                if (!err && footerString) {
                    // Add headerString and footerString together
                    const fullString = headerString+str+footerString
                    callback (false, fullString)
                }
                else { "Could not find the 'footer' template" }
            })

        }
        else { callback ("Could not find the 'header' template") }
    })

}

// interpolate = penambahan, penyisipan, penyelaan
// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
    str     = typeof (str) === "string" && str.length > 0 ? str : ""
    data    = typeof (data) === "object" && data !== null ? data : {}

    // Add the templateGloblas to the data object, prepending their key name with "global."
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty (keyName)) {
            data ["global."+keyName] = config.templateGlobals[keyName]
        }
    }

    // For each key in the data object, insert it's value into the string at the corresponding placeholder
    for (let key in data) {
        if (data.hasOwnProperty (key) && typeof (data[key] === "string")) {
            const replace	= data[key]
            const find		= '{'+key+'}'
            str = str.replace (find, replace)
        }
    }
    return str
}

// Get the content of a static (public) assets
helpers.getStaticAsset = (fileName, callback) => {
    fileName = typeof (fileName) === "string" && fileName.length > 0 ? fileName : false

    if (fileName) {
        const publicDir = path.join (__dirname, "/../public/")
        fs.readFile (publicDir+fileName, "utf-8", (err, data) => {
            if (!err && data) {
                callback (false, data)
            }
            else { callback ("No file could be found")
            }
        })
    }
    else { callback ("A valid file name was not specified") }
}


// Export the module
module.exports = helpers
