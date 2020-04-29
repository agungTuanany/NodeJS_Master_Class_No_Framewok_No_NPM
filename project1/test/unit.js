"user strict"
/*
 * Unit Testing
 *
 */

// Dependencies
const assert					= require ("assert")

const logs						= require ("./../lib/logs")
const helpers					= require ("./../lib/helpers")
const exampleDebuggingProblem	= require ("./../lib/exampleDebuggingProblem")

// Holder for tests
const unit = {}

// Assert that getANumber function is returning a number
unit ["helpers.getANumber should return a number"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (typeof (val), "number")
	done ()
}


// Assert that getANumber function is returning a 1
unit ["helpers.getANumber should return 1"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (val, 1)
	done ()
}


// Assert that getANumber function is returning a 2 | make test fail
unit ["helpers.getANumber should return 2"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (val, 2)
	done ()
}

// XXX Since I don't have any logs files this test is "undone" XXX
// Logs.list should callback an array and a false error
//unit ["logs.list should callback a false error and array of log name"] = (done) => {
//	logs.list (true, (err, logFileNames) => {
//		// Assert error and false
//		assert.equal (err, false)
//		assert.ok (logFileNames instanceof Array)
//		assert.ok (logFileNames.length > 1)
//		done ()
//	})
//}

// logs.truncate should not throw if the logId doesn't exist
unit ["logs.truncate should not throw if the logId does not exist, it should callback an error instead"] = (done) => {
	assert.doesNotThrow ( () => {
		logs.truncate ("I do not exist", (err) => {
			assert.ok (err)
			done ()
		})
	}, TypeError)
}

// exampleDebuggingProblem.init should not throw (but i does)
unit ["exampleDebuggingProblem.init should not throw when called"] = (done) => {
	assert.doesNotThrow ( () => {
		exampleDebuggingProblem.init ()
		done ()
	}, TypeError)
}


// Exports the tests to the runner
module.exports = unit
