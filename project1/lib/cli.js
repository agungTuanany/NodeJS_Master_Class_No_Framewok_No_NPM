/*
 * CLI-Related Task
 *
 */

// Dependencies
const readline          = require ("readline")
const util              = require ("util")
const events            = require ("events")
const os                = require ("os")
const v8                = require ("v8")
const childProcess      = require ("child_process")

const debug             = util.debuglog ("cli")

const _data             = require ("./data")
const _logs             = require ("./logs")
const helpers           = require ("./helpers")


class _events extends events {}
const e = new _events ()


// Instantiate the CLI module object
const cli = {}

// Input handlers
e.on ("man", (str) => {
    cli.responders.help ()
})

e.on ("help", (str) => {
    cli.responders.help ()
})

e.on ("exit", (str) => {
    cli.responders.exit ()
})

e.on ("stats", (str) => {
    cli.responders.stats ()
})

e.on ("list users", (str) => {
    cli.responders.listUsers ()
})

e.on ("more user info", (str) => {
    cli.responders.moreUserInfo (str)
})

e.on ("list checks", (str) => {
    cli.responders.listChecks (str)
})

e.on ("more check info", (str) => {
    cli.responders.moreCheckInfo (str)
})

e.on ("list logs", (str) => {
    cli.responders.listLogs ()
})

e.on ("more log info", (str) => {
    cli.responders.moreLogInfo (str)
})


// Responders object
cli.responders = {}

// Help / Man
cli.responders.help = () => {
    const commands = {
        "exit"                              : "Kill The CLI (and the rest of the application)",
        "man"                               : "Show this help page",
        "help"                              : "Alias of the 'man' command ",
        "stats"                             : "Get statistic on the underlying operating system and resource utilization",
        "list users"                        : "Show a list of all the registered (undeleted) users in the system",
        "more user info --{userId}"         : "Show details of a specified user",
        "list checks --up --down"           : "Show a list of all the active checks in the system, including their state, the '--up' and '--down' flags are both optional",
        "more check info --{checkId}"       : "Show detail of a specified check",
        "list logs"                         : "Show a list of all the log files available to be read (compressed and uncompressed)",
        "more log info --{logFileName}"     : "Show details of a specified log file"
    }

    // Show a header for the help page that is  a wide as the screen
    cli.horizontalLine ()
    cli.centered ("CLI MANUAL")
    cli.horizontalLine ()
    cli.verticalSpace (2)

    // Show each command, followed by its explanation, in white and yellow respectively
    for (let key in commands) {
        if (commands.hasOwnProperty (key)) {
            const value = commands[key]
            let line = "\x1b[33m "+key+"\x1b[0m"
            const padding = 50 - line.length

            for (let i = 0; i < padding; i++) {
                line += " "
            }
            line += value
            console.log (line)
            cli.verticalSpace ()
        }
    }
    cli.verticalSpace (1)

    // End with another horizontal line
    cli.horizontalLine ()
    cli.verticalSpace (1)
}

// Create a vertical space
cli.verticalSpace = (lines) => {
    lines = typeof (lines) === "number" && lines > 0 ? lines : -1
    for (let i = 0; i < lines; i++) {
        console.log ("")
    }
}

// Create a horizontal line across the screen
cli.horizontalLine = () => {

    // Get the available screen size
    const width = process.stdout.columns

    // Put in enough dashes to go across the screen
    let line = ""
    for (let i = 0; i < width; i++) {
        line += "-"
    }
    console.log (line)
}

// Create centered text on the screen
cli.centered = (str) => {
    str = typeof (str) === "string" && str.trim ().length > 0 ? str.trim () : ""

    // Get the available screen size
    let width = process.stdout.columns

    // Calculate the left padding there should be
    let leftPadding = Math.floor ( (width - str.length) / 2)

    // Put in left padded spaces before the string itself
    let line = ""
    for (let i = 0; i < leftPadding; i++) {
        line += " "
    }
    line += str
    console.log (line)
}


// Exit
cli.responders.exit = () => {
    process.exit (0)
}

// Stats
cli.responders.stats = () => {
    // Compile an object of stats
    const stats = {
        "load average"                      : os.loadavg ().join (" "),
        "CPU Count"                         : os.cpus ().length,
        "Free Memory"                       : os.freemem (),
        "Current Malloced Memory"           : v8.getHeapStatistics ().malloced_memory,
        "Peak Malloced Memory"              : v8.getHeapStatistics ().peak_malloced_memory,
        "Allocated Heap used (%)"           : Math.round ( (v8.getHeapStatistics ().used_heap_size / v8.getHeapStatistics ().total_heap_size) * 100),
        "Available Heap Allocated (%)"      : Math.round ( (v8.getHeapStatistics ().total_heap_size / v8.getHeapStatistics ().heap_size_limit) * 100),
        "uptime"                            : os.uptime ()+" Seconds"
    }

    // Create a header for the stats
    cli.horizontalLine ()
    cli.centered ("SYSTEM STATISTICS")
    cli.horizontalLine ()
    cli.verticalSpace (2)

    // Log out each stat
    for (let key in stats) {
        if (stats.hasOwnProperty (key)) {
            const value = stats[key]
            let line = "\x1b[33m "+key+"\x1b[0m"
            const padding = 50 - line.length

            for (let i = 0; i < padding; i++) {
                line += " "
            }
            line += value
            console.log (line)
            cli.verticalSpace ()
        }
    }

    // Create a footer for the stats
    cli.horizontalLine ()
    cli.verticalSpace (1)

}

// List users
cli.responders.listUsers = () => {

    // Create a header for the users list
    cli.horizontalLine ()
    cli.centered ("LIST USERS")
    cli.horizontalLine ()
    cli.verticalSpace (1)

    _data.list ("users", (err, userIds) => {
        if (!err && userIds && userIds.length > 0) {
            cli.verticalSpace ()
            userIds.forEach ( (userId) => {
                _data.read ("users", userId, (err, userData) => {
                    if (!err, userData) {
                        const numberOfChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks : 0
                        let line = "Name:"+userData.firstName+" "+userData.lastName+", phone: "+userData.phone+ ", checks: "+numberOfChecks

                        console.log (line)
                        cli.verticalSpace (1)
                        cli.horizontalLine ()
                    }
                })
            })
        }
    })
}

// More user info
cli.responders.moreUserInfo = (str) => {
    // Get the ID from the string
    let arr = str.split ("--")
    const userId = typeof (arr[1]) === "string" && arr[1].trim ().length > 0 ? arr[1].trim () : false

    if (userId) {
        // Lookup the users
        _data.read ("users", userId, (err, userData) => {
            if (!err && userData) {
                // Remove the hashed password
                delete userData.hashedPassword

                // Print the JSON with text highlighting
                cli.verticalSpace ()
                console.dir (userData,  {"colors": true})
            }
        })
    }
}

// XXX TODO: Since I don't have any checks data, I'm not test it yet, please test it XXX
// List Checks
cli.responders.listChecks = (str) => {
    _data.list ("checks", (err, checksIds) => {
        if (!err && checksIds && checksIds.length > 0) {
            cli.verticalSpace ()
            checksIds.forEach ( (checkId) => {
                _data.read ("checks", checkId, (err, checkData) => {
                    let includeCheck	= false
                    const lowerString	= str.toLowerCase ()

                    // Get the state, default to down
                    const state = typeof (checkData.state) === "string" ? checkData.state : "down"

                    // Get the state, default to unknown
                    const stateOrUnknown = typeof (checkData.state) === "string" ? checkData.state : "unknown"

                    // If the user has specified the state, or hasn't specified any state, include the current check accordingly
                    if (lowerString.indexOf ("--"+state) > -1 || (lowerString.indexOf ("--down") === -1 && lowerString.indexOf ("--up") === -1)) {
                        const line = "ID: "+checkData.id+" "+checkData.method.toUpperCase ()+" "+checkData.protocol+"://"+checkData.url+" State:"+stateOrUnknown
                        console.log (line)
                        cli.verticalSpace ()
                    }

                })
            })
        }

    })
}

// More check info
cli.responders.moreCheckInfo = (str) => {
    // Get the checkId from the string
    let arr = str.split ("--")
    const checkId = typeof (arr[1]) === "string" && arr[1].trim ().length > 0 ? arr[1].trim () : false

    if (checkId) {
        // Lookup the users
        _data.read ("checks", checkId, (err, userData) => {
            if (!err && userData) {

                // Print the JSON with text highlighting
                cli.verticalSpace ()
                console.dir (checkId,  {"colors": true})
                cli.verticalSpace ()
            }
        })
    }
}

// List Logs
cli.responders.listLogs = () => {

    const ls = childProcess.spawn ("ls", ["./.logs/"])
    ls.stdout.on ("data", (dataObject) => {

        // Explode into separate lines
        const dataStr = dataObj.toString ()
        const logFileNames = dataStr.split ("\n")

        cli.verticalSpace ()
        logFileNames.forEach ( (logFileName) => {
            if (typeof (logFileNames) === "string" && logFileName.length > flogFileName.indexOf ("-") > -1) {
                console.log (logFileName.trim ().split(".")[0])
                cli.verticalSpace ()
            }
        })
    })
}

// More log info
cli.responders.moreLogInfo = (str) => {
    // Get the logFileName from the string
    let arr = str.split ("--")
    const logFileName = typeof (arr[1]) === "string" && arr[1].trim ().length > 0 ? arr[1].trim () : false

    if (logFileName) {
        cli.verticalSpace ()
        // Decompress the log
        _logs.decompress (logFileName, (err, strData) => {
            if (!err && strData) {
                // Split into lines
                const arr = strData.split ("\n")
                arr.forEach ( (jsonString) => {
                    const logObject = helpers.parseJsonToObject (jsonString)
                    if (logObject && JSON.stringify (logObject) !== "{}") {
                        console.dir (logObject, {"colors": true})
                        cli.verticalSpace ()
                    }
                })
            }
        })
    }
}


// Input processor
cli.processInput = (str) => {
    str = typeof (str) === "string" && str.trim ().length > 0 ? str.trim () : false

    if (str) {
        // Codify the unique strings that identify the unique question allowed to be asked
        const uniqueInputs = [
            "man",
            "help",
            "exit",
            "stats",
            "list users",
            "more user info",
            "list checks",
            "more check info",
            "list logs",
            "more log info"
        ]

        // Go through the possbile inputs, emit an event when a match is found
        let matchFound	= false
        let counter		= 0

        uniqueInputs.some ( (input) => {
            if (str.toLowerCase ().indexOf (input) > -1) {
                matchFound = true

                // Emit an event matching the unique input, and include the full string
                e.emit (input, str) // e === new _events ()
            }
        })

        if (!matchFound) {
            console.log ("Your input not on list, please try again or write 'man' on console")
        }
    }
}


// Init script
cli.init = () => {
    console.log ('\x1b[34m%s\x1b[0m', `The CLI is running`)

    // Start the interface
    const _interface = readline.createInterface ({
        input       : process.stdin,
        output      : process.stdout,
        prompt      : ">"
    })

    // Create an intial prompt
    _interface.prompt ()


    // Handle each line of input separetly
    _interface.on ("line", (str) => {
        // Send to the input processor
        cli.processInput (str)

        // Re-initialize the prompt afterwards
        _interface.prompt ()
    })

    _interface.on ("close", () => {
        process.exit (0)
    })
}


// Export the module
module.exports =cli
