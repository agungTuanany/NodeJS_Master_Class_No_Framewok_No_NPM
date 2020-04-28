/*
 * CLI-Related Task
 *
*/

// Dependencies
const readline			= require ("readline")
const util				= require ("util")
const debug				= util.debuglog ("cli")
const events			= require ("events")

class _events extends events {}
const e = new _events ()


// Instantiate the CLI module object
const cli = {}

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
			console.log ("Your input not on list, pls try again or write man on console")
		}
	}
}


// Init script
cli.init = () => {
	console.log ('\x1b[34m%s\x1b[0m', `The CLI is running"`)

	// Start the interface
	const _interface = readline.createInterface ({
		input		: process.stdin,
		output		: process.stdout,
		prompt		: ">"
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
