"use strict";

/*
 * Worker-related tasks
 */

// Core Dependencies
const path    = require("path");
const fs      = require("fs");
const http    = require("http");
const https   = require("https");
const url     = require("url");
const util    = require("util");

// Internal Dependencies
const _data   = require("./data");
const helpers = require("./helpers");
const _logs   = require("./logs");


// Debugging
const debug   = util.debuglog("workers"); // run NODE_DEBUG = workers node index.js

// Instantiate the worker object
const workers = {};

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = () => {

    // Get all the checks
    _data.list("checks", (err, checks) => {

        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {

                // Read in the check data
                _data.read("checks", check, (err, originalCheckData) => {

                    if (!err && originalCheckData) {
                        // Pass it to the check validator, ad let that function continue or log error as needed
                        workers.validateCheckData(originalCheckData);
                    }
                    else { debug("Error: Reading one of the check's data") };
                });
            });
        }
        else { debug("Error: Could not find any 'checks to process'") };
    });
};

// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {

    originalCheckData                = typeof(originalCheckData) === "object" && originalCheckData !== null ? originalCheckData : {}
    originalCheckData.checkId        = typeof(originalCheckData.checkId) === "string" && originalCheckData.checkId.trim().length=== 20 ? originalCheckData.checkId.trim() : false
    originalCheckData.userPhone      = typeof(originalCheckData.userPhone) === "string" && originalCheckData.userPhone.length >= 12 ? originalCheckData.userPhone.trim() : false
    originalCheckData.protocol       = typeof(originalCheckData.protocol) === "string" && ["http", "https"].indexOf (originalCheckData.protocol) > -1 ? originalCheckData.protocol : false
    originalCheckData.url            = typeof(originalCheckData.url) === "string" &&  originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
    originalCheckData.method         = typeof(originalCheckData.method) === "string" && ["post", "get", "put", "delete"].indexOf (originalCheckData.method) > -1 ? originalCheckData.method : false
    originalCheckData.successCodes   = typeof(originalCheckData.successCodes) === "object" && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === "number" && originalCheckData.timeoutSeconds % 1 === 0  && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false

    originalCheckData.state          = typeof(originalCheckData.state) === "string" && ["up", "down"].indexOf (originalCheckData.state) > -1 ? originalCheckData.state : "down"
    originalCheckData.lastChecked    = typeof(originalCheckData.lastChecked) === "number" && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

    // set the keys that may not be set (if the workers have never seen this checks before)
    // If all the checks pass, pass the data along to the next step in process
    if (originalCheckData.checkId      &&
        originalCheckData.userPhone    &&
        originalCheckData.protocol     &&
        originalCheckData.url          &&
        originalCheckData.method       &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds) {

        workers.perfomCheck(originalCheckData);
    }
    else {
        debug("Error: One of the checks is not properly formatted, Skipped it, please check carefully");
        debug(`
            Your OriginalCheckData:${originalCheckData}
            Your originalCheckData.id:${originalCheckData.checkId}
            your originalCheckData.userPhone:${originalCheckData.userPhone}
            your originalCheckData.protocol:${originalCheckData.protocol}
            your originalCheckData.url:${originalCheckData.url}
            your originalCheckData.method:${originalCheckData.method}
            your originalCheckData.successCodes:${originalCheckData.successCodes}
            your originalCheckData.timeoutSeconds:${originalCheckData.timeoutSeconds}
        `)
    };
};

// Perfom the check, and send the originalCheckData and the outcome of the checks process, to the next step in the process
workers.perfomCheck = (originalCheckData) => {
    // Prepare the initial check outcome
    const checkOutcome = {
        "error"        : false,
        "responseCode" : false
    }

    // Mark that the outcome has not been sent yet
    let outcomeSent = false

    // Parse the hostname and the path out of the original check data
    const parsedUrl = url.parse(originalCheckData.protocol+"://"+originalCheckData.url, true);
    const hostName  = parsedUrl.hostname;
    const path      = parsedUrl.path;    // Using path not pathname because we want the query string

    // Construct the request
    const requestDetails = {
        "protocol" : originalCheckData.protocol+":",
        "hostname" : hostName,
        "method"   : originalCheckData.method.toUpperCase(),
        "path"     : path,
        "timeout"  : originalCheckData.timeoutSeconds * 1000
    }

    // Instantiate the request object (using either the HTTP or HTTPS module)
    const _moduleToUse = originalCheckData.protocol === "http" ? http : https

    const req = _moduleToUse.request (requestDetails, (res) => {

        // Grab the status of the sent request
        const status = res.statusCode;

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        };
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", (e) => {

        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            "error" : true,
            "value" : e
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        };
    });

    // bind to the timeout event
    req.on("timeout", () => {
        // update the checkOutcome and pass the data along
        checkOutcome.error = {
            "error" : true,
            "value" : "timeout"
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        };
    });

    // End the request
    req.end();
};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accommodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {

    // Decide if the check is considered up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? "up" : "down";

    // Decide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // Log the outcome
    const timeOfCheck =Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // Save the updates
    _data.update("checks", newCheckData.checkId, newCheckData, (err) => {

        if (!err) {
            // Send the new check data to the next phase in the process if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            }
            else { debug("Check outcome has not changed, no alert needed") };
        }
        else { debug("Error trying to save updates to one of the checks") };
    });
};

// Alert the user as to change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err){
            debug("Success: User was alerted to a status change in their check, via SMS", msg);
        }
        else {
            debug("Error: Could not sent SMS alert to user who had a state change in their check", err);
        };
    });
};

workers.log =  (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) => {

    // Form the log data
    const logData = {
        "check"   : originalCheckData,
        "outcome" : checkOutcome,
        "state"   : state,
        "alert"   : alertWarranted,
        "time"    : timeOfCheck
    };

    // Convert data to a string
    const logString = JSON.stringify(logData, null, 4);

    // Determine the name of the log file
    const logFileName = originalCheckData.checkId;

    // Append the log string to the file
    _logs.append (logFileName, logString, (err) => {

        if (!err) {
            debug("Logging to file succeeded");
        }
        else { debug ("Logging to file failed") };
    });
};

// Timer to execute the worker-process once per minute
workers.loop = () => {

    setInterval ( () => {

        workers.gatherAllChecks();
    }, 1000 * 60);
};

// Rotate (compress) the log files
workers.rotateLogs = () => {

    // List all the (non compressed) log files
    _logs.list (false, (err, logs) => {

        if (!err && logs && logs.length > 0) {
            logs.forEach ( (logName) => {

                // Compress the data to a different file
                const logId = logName.replace (".log", "");
                const newFileId = logId+"-"+Date.now();

                _logs.compress(logId, newFileId, (err) => {

                    if (!err) {
                        // Truncate the log
                        _logs.truncate (logId, (err) => {

                            if (!err) {
                                debug("Success truncating logFile");
                            }
                            else { debug("Error truncating logFile", err) };
                        });
                    }
                    else { debug("Error: compressing one of the log files", err) };
                });
            });
        }
        else {
            debug("Error: could not find any logs to route");
            debug( "_logs.list: ", err, logs);
        };
    });
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = () => {

    setInterval ( () => {

        workers.rotateLogs();
    }, 100 * 60 * 60 * 24) // 100 * 60 * 60 * 24 = 1 day
};

// Init script
workers.init = () => {

    // Send to console, in yellow
    console.log('\x1b[33m%s\x1b[0m', "Background workers are running");

    // Execute all the checks immediately
    workers.gatherAllChecks();

    // Call the loop so the checks will execute later on
    workers.loop();

    // Compress all the logs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
};

// Export the module
module.exports = workers;
