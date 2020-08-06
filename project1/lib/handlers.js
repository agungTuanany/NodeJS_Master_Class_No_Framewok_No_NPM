"use strict";
j
/*
 * Request handlers
 *
 */

// Core Dependencies
const _url         = require("url");
const dns          = require("dns");
const _performance = require("perf_hooks").performance;
const util         = require("util");
const debug        = util.debuglog("performance");

// Internal Dependencies
const _data   = require("./data");
const helpers = require("./helpers");
const config  = require("./config");

// Define the handlers
let handlers = {};

/*
 * HTML Handlers
 */

// Index handler
handlers.index = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title"        : "Uptime Monitoring - Made Simple",
            "head.description"  : "We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we'll send you text to let you know",
            "body.class"        : "index"
        };

        // Read in the template as a string
        helpers.getTemplate("index", templateData, (err, str) => {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Create Account
handlers.accountCreate = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title"        : "Create an Account",
            "head.description"  : "Signup is easy and only takes for few seconds",
            "body.class"        : "accountCreate"
        };

        // Read in the template as a string
        helpers.getTemplate("accountCreate", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });

    }
    else { callback (405, undefined, "html") };
};

// Create New Session
handlers.sessionCreate = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {

        // Prepare data for interpolation
        const templateData = {
            "head.title"       : "Login to your account",
            "head.description" : "Please enter your phone number and password to access your account",
            "body.class"       : "sessionCreate"
        };

        // Read in the template as a string
        helpers.getTemplate ("sessionCreate", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Session has been deleted
handlers.sessionDeleted = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title"       : "Logged Out",
            "head.description" : "You have been logged out of your account",
            "body.class"       : "sessionDeleted"
        };

        // Read in the template as a string
        helpers.getTemplate ("sessionDeleted", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate (str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html")
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        })
    }
    else { callback(405, undefined, "html") };
};

// Edit accout
handlers.accountEdit = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title"       : "Account Settings",
            "head.description" : "Edit your account details",
            "body.class"       : "accountEdit"
        };

        // Read in the template as a string
        helpers.getTemplate ("accountEdit", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") }
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Account has been deleted
handlers.accountDeleted = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title"       : "Account Deleted",
            "head.description" : "Your account has been deleted ",
            "body.class"       : "accountDeleted"
        };

        // Read in the template as a string
        helpers.getTemplate("accountDeleted", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Create a new check
handlers.checksCreate = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title" : "Create a New Check",
            "body.class" : "checksCreate"
        };

        // Read in the template as a string
        helpers.getTemplate("checksCreate", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Dashboard (view all checks)
handlers.checksList = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title" : "Dashboard",
            "body.class" : "checksList"
        };

        // Read in the template as a string
        helpers.getTemplate("checksList", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {

                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Dashboard (view all checks)
handlers.checksEdit = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title" : "Checks Details",
            "body.class" : "checksEdit"
        };

        // Read in the template as a string
        helpers.getTemplate("checksEdit", templateData, (err, str) => {

            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, "html");
                    }
                    else { callback(500, undefined, "html") };
                });
            }
            else { callback(500, undefined, "html") };
        });
    }
    else { callback(405, undefined, "html") };
};

// Favicon
handlers.favicon = (data, callback) => {

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Read in the favicon's data
        helpers.getStaticAsset ("favicon.ico", (err, data) => {

            if (!err && data) {
                // Callback the data
                callback(200, data, "favicon");
            }
            else { callback(500) };
        });
    }
    else { callback(405, "Cannot find favicon.ico") };
};

// Public assets
handlers.public = (data, callback) =>{

    // Reject any request that isn't a GET
    if (data.method === "get") {
        // Get the filename being requested
        let trimmedAssetName = data.trimmedPath.replace("public/", "").trim();

        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, (err, data) => {

                if (!err && data) {
                    // Determine the content type (defaulty to plain text)
                    let contentType = "plain";

                    if (trimmedAssetName.indexOf (".css") > -1) {
                        contentType = "css";
                    };

                    if (trimmedAssetName.indexOf (".png") > -1) {
                        contentType = "png";
                    };

                    if (trimmedAssetName.indexOf (".jpg") > -1) {
                        contentType = "jpg";
                    };

                    if (trimmedAssetName.indexOf (".ico") > -1) {
                        contentType = "favicon";
                    };

                    if (trimmedAssetName.indexOf (".js") > -1) {
                        contentType = "js";
                    };

                    // Callback the data
                    callback(200, data, contentType);
                }
                else {
                    console.log("error", err);
                    callback(404);
                };
            });
        }
        else {
            console.log("error", trimmedAssetName);
            callback(404);
        };
    }
    else { callback(405) };
};


/*
 * JSON API Handlers
 *
 */

// Example error
handlers.exampleError = (data, callback) => {
    const err = new Error("This an example error from handlers.exampleError");
    throw (err);
};

// Users
handlers.users = (data, callback) => {

    const acceptableMethod = ["post", "get", "put", "delete"];
    if (acceptableMethod.indexOf(data.method) > -1) {
        handlers._users[data.method] (data, callback);
    }
    else {
        callback(405, {"Error": "Handlers does no exist"});
    };
};

// Container for the users submethod
handlers._users = {};

// User - post
// Required data : firstName, lastName, phone, password, tosAgreement
// optional data: none
// XXX XXX TODO: Since user post save a data as phone-number.json when saved all the regex symbol was truncate, should restore to the state internationali symbol which is "+"
handlers._users.post = (data, callback) => {

    // Check that all required fields are filled out
    const firstName    = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName     = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    // Phone number is area-code + 12 digit number
    const phone        = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 12 ? data.payload.phone.trim() : false;
    const password     = typeof(data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === "boolean" && data.payload.tosAgreement === true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure the user doesn't already exist
        _data.read("users", phone, (err, data) => {

            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                // Create the user object
                if (hashedPassword) {
                    const userObject = {
                        "firstName"      : firstName,
                        "lastName"       : lastName,
                        "phone"          : phone,
                        "hashedPassword" : hashedPassword,
                        "tosAgreement"   : true
                    };

                    // Store the user
                    _data.create("users", phone, userObject, (err) => {

                        if (!err) {
                            //console.log ("=====> user created: data", userObject)
                            callback (200, {"POST User Method": "Create new user success"});
                        }
                        else {
                            console.log(err);
                            callback(500, {"Error": "POST User Method: Could not create the new user "});
                        };
                    });
                }
                else {
                    callback(500, {"Error": "POST User Method: could not hash the user's password"});
                };

            }
            else {
                // user already exist
                //console.log ("=====>user created duplicated with phone:", data.phone)
                callback(400, {"Error": "POST User Method: A user with that phone number already exist"});
            };
        });

    }
    else {
        //console.log (firstName, lastName, phone, password, tosAgreement)
        callback(400, {"Error": "POST User Method: Missing required fields"});
    };
};

// User - get
// Required data: phone
// Optional data: none
// XXX TODO: should not truncate the trimmedPath in phone number cause the queryStringObject cannot read "+" symbol
handlers._users.get = (data, callback) => {

    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim ().length >= 12 ? data.queryStringObject.phone.trim () : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken (token, phone, (tokenIsValid) => {

            if (tokenIsValid) {
                // Lookup the user
                _data.read ("users", phone, (err, data) => {

                    if (!err && data) {
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.hashedPassword;
                        // The 'data' coming is not from _user.get () data object, it's from _data.read ()
                        callback(200, data, {"GET User Method result": "server cached"});
                    }
                    else {
                        callback(404, {"Error": "GET method: Data you try to read is not exist"});
                    };
                });
            }
            else {
                callback(403, {"Error": "GET User Method: Token invalid"});
            };
        });
    }
    else {
        console.log("user GET Method required data: ", phone);
        callback(400, {"Error": "GET User Method: Missing required field"});
    };
};

// User - put
// Required data : phone
// optional data : firtsName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {

    // Check for required fields
    const phone     = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 12 ? data.payload.phone.trim() : false;

    // Check for optional fields
    const firstName = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName  = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password  = typeof(data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {

            // Get the token from the headers
            const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

            // Verify that given token is valid for the phone number
            handler._tokens.verifyToken (token, phone, (tokenIsValid) => {

                if (tokenIsValid) {
                    // Lookup the user
                    _data.read ("users", phone, (err, userData) => {

                        if (!err && userData) {
                            // Update the fields necessary
                            if (firstName) {
                                userData.firstNanme = firstName
                            };
                            if (lastName) {
                                userData.lastName = lastName
                            };
                            if (password) {
                                userData.hashedPassword = helpers.hash (password)
                            };

                            // Store the new update
                            _data.update("users", phone, userData, (err) => {

                                if (!err) {
                                    callback(200, {"PUT User Method": "Update was successful"});
                                };
                                else {
                                    console.log (err)
                                    callback(500, {"Error": "PUT User Method: Could not update the user"});
                                };
                            });
                        }
                        else {
                            callback(400, {"Error": "PUT User Method: The specified user does not exist"});
                        };
                    });
                }
                else {
                    callback(403, {"Error" : "PUT User Method: Token is invalid"});
                };
            });
        }
        else {
            callback(400, {"Error": "PUT User Method: Missing fields to update"});
        };
    }
    else {
        callback(400, {"Error": "PUT User Method: Missing required fields"});
    };
};

// User - delete
// Required field : phone
// Optional field : none
// Cleanup old checks associated with the user
handlers._users.delete = (data, callback) => {

    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim().length >= 12 ? data.queryStringObject.phone.trim() : false;

    if (phone) {

        // Get token from headers
        const token = typeof(data.headers.token) === "string" ? data.headears.token : false;

        // Verify that given token is valid for the phone number
        handlers._token.verifyToken(token, phone, (tokenIsValid) => {                                                                                          // [1]

            if (tokenIsValid) {
                // Lookup the user
                _data.read ("users", phone, (err, userData) => {                                                                                                // [2]

                    if (!err && userData) {
                        // Delete the user's data
                        _data.delete("users", phone, (err) => {                                                                                                // [3]

                            if (!err) {
                                // Delete each of the checks associated with the user
                                const userChecks = typeof(userData.checks) === "object" && userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete  = userChecks.length;

                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;

                                    // Loop through the checks
                                    userChecks.forEach((checkId) => {

                                        // Delete the check
                                        _data.delete("checks", checkId, (err) => {                                                                             // [4]

                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                        })
                                        if (checksDeleted === checksToDelete) {
                                            if (!deletionErrors) {
                                                callback(200);
                                            }
                                            else {
                                                callback(500, {"Error" : "DELETE User Method: Errors encountered while attempting to delete all of the user's checks file. All the checks may not have been deleted from the system succesfully "});
                                            };
                                        } //@TODO exit else?
                                    });
                                }
                                else {
                                    callback(200);
                                };
                            }
                            else {
                                callback(500, {"Error" : " Delete User Method: Could not delete the specific user"});
                            };
                        });
                    }
                    else {
                        callback(400, {"Error" : "DELETE User Method: Could not find the specific user."});
                    };
                });
            }
            else {
                callback(403, {"Error" : "DELETE User Method: Missing required token in header. or token is invalid."});
            };
        });
    }
    else {
        callback(400, {"Error": "DELETE User Method: Missing required fields."});
    };
};


// Tokens
handlers.tokens = (data, callback) => {

    const acceptableMethod = ["post", "get", "put", "delete"];

    if (acceptableMethod.indexOf (data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }
    else {
        callback(405, {"Error": "Handlers does no exist"});
    };
};

// Container for all the "tokens" submethods
handlers._tokens = {};

// Token - POST
// Required data : phone, password
// optional data : none
handlers._tokens.post = (data, callback) => {

    _performance.mark("entered function");

    // Check that all required fields are filled out
    const phone = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 12 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    _performance.mark("inputs validated");

    if (phone && data) {
        // lookup the user who matches that phone number
        _performance.mark("beginning user lookup");

        _data.read("users", phone, (err, userData) => {

            _performance.mark("user lookup complete");

            if (!err && userData) {
                // Has the sent password and compare it to the password stored in the user object
                _performance.mark("beginning password hashing");

                const hashedPassword = helpers.hash (password);

                _performance.mark("password hashing complete");

                if (hashedPassword === userData.hashedPassword) {
                    // if valid, create a new token with a random name, set expiration 1 hour in the future
                    _performance.mark("creating data for token");

                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        "phone"   : phone,
                        "tokenId" : tokenId,
                        "expires" : expires
                    };

                    // Store the token
                    _performance.mark("beginning storing token");

                    _data.create("tokens", tokenId, tokenObject, (err) => {

                        _performance.mark("storing token complete");

                        // Gather all the measurements
                        _performance.measure("Beginning to end", "entered function", "storing token complete");
                        _performance.measure("Validating user input", "entered function", "inputs validated");
                        _performance.measure("User lookup", "beginning user lookup", "user lookup complete");
                        _performance.measure("Password hashing", "beginning password hashing", "password hashing complete");
                        _performance.measure("Token data creation", "creating data for token", "beginning storing token");
                        _performance.measure("Token storing", "beginning storing token", "storing token complete");

                        // Log out all the measurement
                        const measurements = _performance.getEntriesByType("measure");

                        measurements.forEach((measurement) => {
                            debug('\x1b[33m%s\x1b[0m',measurement.name+" "+measurement.duration);
                        });

                        if (!err) {
                            callback(200, tokenObject);
                        }
                        else {
                            callback(500, {"Error": "POST TOKEN Method: Server Could not create the new token"});
                        };
                    });
                }
                else {
                    callback(400, {"Error": "POST TOKEN Method: Password did not match the specified user stored password"});
                };
            }
            else {
                callback(400, {"Error": "POST TOKEN Method: Could not find specified user"});
            };
        });
    }
    else {
        console.log("TOKEN POST METHOD phone & number:", phone, password);
        console.log(data);
        callback(400, {"Error": "POST TOKEN Method: Missing required fields"});
    };
};

// Token - GET
// Required data : id
// Optional data : none
handlers._tokens.get = (data, callback) => {

    // Check that id is valid
    const id = typeof(data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read("tokens", id, (err, tokenData) => {

            if (!err && data) {
                callback(200, tokenData);
            }
            else {
                callback(400, {"Error": "GET TOKEN Method: Token did not match the specified user stored password"});
            };
        });
    }
    else {
        console.log("\x1b[31m%s\x1b[0m","Your tokenId should not be 'false' ", id);
        callback(400, {"Error": "GET TOKEN Method: Missing required field, or field invalid"});
    };
};

// Token - PUT
// Required data : id, extend
// Optional data : none
handlers._tokens.put = (data, callback) => {

    const id = typeof(data.payload.id) === "string" && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) === "boolean" && data.payload.extend === true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read ("tokens", id, (err, tokenData) => {

            if (!err && tokenData) {
                // Check to the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update ("tokens", id, tokenData, (err) => {

                        if (!err) {
                            callback(200, tokenData);
                        }
                        else {
                            callback(500, {"Error": "PUT TOKEN Method: Could not update the tokens expiration"});
                        };
                    });
                }
                else {
                    callback(400, {"Error": "PUT TOKEN Method: The Token has already expired, and cannot be extended"});
                }
            }
            else {
                callback(400, {"Error": "PUT TOKEN Method: Specified token does not exist"});
            };
        });
    }
    else {
        console.log("TOKEN PUT METHOD extend", extend);
        callback(400, {"Error": "PUT TOKEN Method: Missing required field(s) or field(s) are invalid"});
    };
};

// Token - DELETE
// Required data : id
// Optional data : none
handlers._tokens.delete = (data, callback) => {

    const id = typeof(data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read ("tokens", id, (err, tokenData) => {

            if (!err && tokenData) {
                // Delete the token
                _data.delete("tokens", id, (err) => {

                    if (!err) {
                        callback(200, tokenData);
                    }
                    else {
                        callback(500, {"Error": "DELETE TOKEN Method: Could not delete the specified token"});
                    };
                });
            }
            else {
                callback(400, {"Error": "DELETE TOKEN Method: Could not find the specified token"});
            };
        });
    }
    else {
        callback(400, {"Error": "DELETE TOKEN method: Missing required fields"});
    };
};


// XXX XXX XXX General purpose function XXX XXX XXX
// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {

    // Lookup the token data
    _data.read ("tokens", id, (err, tokenData) => {

        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            }
            else {
                callback(false);
            };
        }
        else {
            callback(false);
        };
    });
};

// Cheks
handlers.checks = (data, callback) => {

    const acceptableMethod = ["post", "get", "put", "delete"];
    if (acceptableMethod.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    }
    else {
        callback(405, {"Error": "Handlers does no exist"});
    };
};

// Container for all the "checks" submethods
handlers._checks = {};

// Checks - POST
// Required data : protocol, url, method, successCodes, timeoutSeconds
// Optional data : none
handlers._checks.post = (data, callback) => {
    // Validate inputs
    const protocol = typeof(data.payload.protocol) === "string" && ["http", "https"].indexOf(data.payload.protocol) > -1 ?
        data.payload.protocol :
        false;

    const url = typeof(data.payload.url) === "string" &&  data.payload.url.trim().length > 0 ?
        data.payload.url.trim() :
        false;

    const method = typeof(data.payload.method) === "string" && ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1 ?
        data.payload.method :
        false;

    const successCodes = typeof(data.payload.successCodes) === "object" &&  data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ?
        data.payload.successCodes :
        false;

    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === "number" &&  data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ?
        data.payload.timeoutSeconds :
        false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get the token from the headers
        const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read ("tokens", token, (err, tokenData) => {

            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read ("users", userPhone, (err, userData) => {

                    if (!err && userData) {
                        const userChecks = typeof(userData.checks) === "object" && userData.checks instanceof Array ?
                            userData.checks :
                            [];

                        // Verify that user has less than the number of max-checks-per-user
                        if (userChecks.length < config.maxChecks) {
                            // Create a random id for the check
                            const checkId = helpers.createRandomString(20);

                            // Verify that the URL given has DNS entries (and therefore can resolve)
                            const parsedUrl = _url.parse (protocol+"://"+url, true)
                            const hostName = typeof(parsedUrl.hostName) === "string" && parsedUrl.hostname.length > 0 ?
                                parsedUrl.hostname :
                                false;

                            dns.resolve(hostName, (err, records) => {

                                if (!err && records) {
                                    // create the check object, and include the user's phone
                                    const checkObject = {
                                        "checkId"        : checkId,
                                        "userPhone"      : userPhone,
                                        "protocol"       : protocol,
                                        "url"            : url,
                                        "method"         : method,
                                        "successCodes"   : successCodes,
                                        "timeoutSeconds" : timeoutSeconds
                                    };

                                    // Save the object
                                    _data.create("checks", checkId, checkObject, (err) => {

                                        if (!err) {
                                            // Add the check id to the user's object
                                            userData.checks	= userChecks;
                                            userData.checks.push (checkId);

                                            _data.update("users", userPhone, userData, (err) => {

                                                if (!err) {
                                                    // Return the data about the new chec
                                                    callback(200, checkObject);
                                                }
                                                else {
                                                    callback(500, {"Error": "POST Checks Method: could not update the user with the new chec"});
                                                };
                                            });
                                        }
                                        else {
                                            callback(500, {"Error": "POST Checks Method: Could not create the new check"});
                                        };
                                    });
                                }
                                else {
                                    callback(400, {"Error": "The hostname of the URL entered did not resolve to any DNS entries"});
                                };
                            });
                        }
                        else {
                            callback(400, {'Error' : 'POST Checks Method: The user already has the maximum number of checks ('+config.maxChecks+').'});
                        };
                    }
                    else {
                        callback(403, {"Error": "POST Checks Method: Not Authorized userData"});
                    };
                });
            }
            else {
                callback(403, {"Error": "POST Checks Method: Not Authorized tokenData"});
            };
        });
    }
    else {
        console.log(protocol, url, method, successCodes, timeoutSeconds);
        callback(400, {"Error": "POST Checks Method: Missing required field, or inputs are invalid"});
    };
};

// Checks - GET
// Required data : id
// Optional data ; none
handlers._checks.get = (data, callback) => {

    // Check that id is valid
    const id = typeof(data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ?
        data.queryStringObject.id.trim() :
        false;

    if (id) {
        // lookup the check
        _data.read ("checks", id, (err, checkData) => {

            if (!err && checkData) {
                // Get the token sent the request
                const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

                // Verify that given token is valid and belongs to the user who created the check
                console.log("This is check data ", checkData);
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {

                    if (tokenIsValid) {
                        // Return check data
                        console.log(id);
                        callback(200, checkData);
                    }
                    else {
                        callback(403, {"Error": "GET Checks Method: Your checkData is invalid"});
                    };
                });
            }
            else {
                callback(404, {"Error": "GET Checks Method: data you request not exist"});
            };
        });
    }
    else {
        console.log("GET Checks Method", data);
        callback(400, {"Error": "GET Checks Method: Missing required field, or input are invalid "});
    };
};

// Checks - PUT
// Required data : id
// Optional data : protocol, url, method, successCodes, timeoutSeconds (one must be set)
handlers._checks.put = (data, callback) => {

    // Check Required field
    const id = typeof(data.payload.id) === "string" && data.payload.id.trim ().length === 20 ?
        data.payload.id.trim() :
        false;

    // Check optional field
    const protocol = typeof(data.payload.protocol) === "string" && ["https, http"].indexOf(data.payload.protocol) > -1 ?
        data.payload.protocol :
        false;

    const url = typeof(data.payload.url) === "string" && data.payload.url.trim().length > 0 ?
        data.payload.url.trim() :
        false;

    const method = typeof(data.payload.method) === "string" && ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1 ?
        data.payload.method :
        false;

    const successCodes = typeof(data.payload.successCodes) === "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ?
        data.payload.successCodes :
        false;

    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ?
        data.payload.timeoutSeconds :
        false;

    // Error if id is invalid
    if (id) {
        // Error if nothing is sent to update
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Lookup the check
            _data.read("checks", id, (err, checkData) => {

                if (!err && checkData) {
                    // Get the token that sent request
                    const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {

                        if (tokenIsValid) {
                            if (protocol) {
                                checkData.protocol = protocol;
                            };

                            if (url) {
                                checkData.url = url;
                            };

                            if (method) {
                                checkData.method = method;
                            };

                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            };

                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            };

                            // Store the new updates
                            _data.update ("checks", id, checkData, (err) => {

                                if (!err) {
                                    callback(200, checkData);
                                }
                                else {
                                    callback(500, {"Error": "PUT Checks Method: Could not update the check | internal server error"});
                                };
                            });
                        }
                        else {
                            console.log("your token should be true, but the result is: ", token);
                            callback(403, {"Error": "PUT Checks Method: token is not valid, please renew the token"});
                        };
                    });
                }
                else {
                    console.log("PUT Checks Method error", err);
                    callback(403, {"Error": "Check ID did not exist"});
                };
            });
        }
        else {
            callback(400, {"Error": "PUT Checks Method: Missing fields to update"});
        };
    }
    else {
        callback(400, {"Error": "PUT Checks Method: Missing required fields, or input are invalid"});
    };
};

// Checks - DELETE
// Required data : id
// Optional data : none
handlers._checks.delete = (data, callback) => {

    // Check that id is valid
    const id = typeof(data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ?
        data.queryStringObject.id.trim() :
        false;

    if (id) {
        // Lookup the check
        _data.read ("checks", id, (err, checkData) => {

            if (!err && checkData) {
                // Get the token that sent the request
                const token = typeof(data.headers.token) === "string" ? data.headers.token : false;

                // Verify that the token that sent the request
                handlers._tokens.verifyToken (token, checkData.userPhone, (tokenIsValid) => {

                    if (tokenIsValid) {
                        // Delete the check data
                        _data.delete("checks", id, (err) => {

                            if (!err) {
                                // Lookup the user's object to get all their checks
                                _data.read("users", checkData.phone, (err) => {

                                    if (!err) {
                                        const userChecks = typeof(userData.cheks) === "object" && userData.checks instanceof Array ?
                                            userData.checks :
                                            [];

                                        // Remove the deleted check rom their list of checks
                                        const checkPosition = userChecks.indexOf (id);

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // Re-save the user's data
                                            userData.chekcs = userChecks;
                                            _data.update ("users", checkData.userPhone, userData, (err) => {

                                                if (!err) {
                                                    callback(200, {"DELETE CHECK METHOD" : "Success"});
                                                }
                                                else {
                                                    callback(500, {"Error": "DELETE Checks Method Could not update the user"});
                                                };
                                            });
                                        }
                                        else {
                                            callback(500, {"Error": "DELETE Chekcs Method: Could not find the check on the user's object, so could not remove it"});
                                        };
                                    }
                                    else {
                                        callback(500, {"Error": "Delete Checks Method: Could not find the user who created the checks, so could not remove the check from the list of checks on their user object"});
                                    };
                                });
                            }
                            else {
                                callback(500, {"Error": "DELETE Checks Method: Could not delete check data"});
                            };
                        });
                    }
                    else {
                        callback(403,  {"Error": "DELETE Checks Method: The token is not valid"});
                    };
                });
            }
            else {
                console.log(err);
                callback(400, {"Error": "DELETE Checks Method: The check id specified could not be found ('+id+'), or the token is not entered"});
            };
        });
    }
    else {
        callback(400, {"Error": "DELETE Checks Method: Missing required fields, or input are invalid"});
    };
};


// XXX XXX XXX TEST PURPOSE XXX XXX
// Since the read () method from data libs not responded well
handlers.sample = (data, callback) => {
    // Callback a http status code, and a payload objects
    callback(406, {"name": "Sample handler"});
};

handlers.ping = (data, callback) => {
    callback(200);
};


// Not Found handler
handlers.notFound = (data, callback) => {
    callback(404, {"Error": "NOT FOUND HANDLER"});
};

// Export the handlers
module.exports = handlers;
