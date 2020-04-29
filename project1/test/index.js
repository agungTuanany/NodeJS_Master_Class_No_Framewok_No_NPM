"user strict"
/*
 * Test runner
 *
 */

// Dependencies
const assert		= require ("assert")
const helpers		= require ("./../lib/helpers")






// Application logic for the test number
const _app = {}




// Container fro the tests
_app.tests = {
	"unit"			: {}
}

// Assert that getANumber function is returning a number
_app.tests.unit ["helpers.getANumber should return a number"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (typeof (val), "number")
	done ()
}


// Assert that getANumber function is returning a 1
_app.tests.unit ["helpers.getANumber should return 1"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (val, 1)
	done ()
}


// Assert that getANumber function is returning a 2 | make test fail
_app.tests.unit ["helpers.getANumber should return 2"] = (done) => {
	const val = helpers.getANumber ()
	assert.equal (val, 2)
	done ()
}

// Count all the test
_app.countTest = () => {
	let counter = 0

	for (let key in _app.tests) {
		if (_app.tests.hasOwnProperty (key)) {
			const subTests = _app.tests [key]

			for (let testName in subTests) {
				if (subTests.hasOwnProperty (testName)) {
					counter++
				}
			}
		}
	}
	return counter
}


// Run all the tests, collecting the errors and successes
_app.runTest = () => {
	let errors = []
	let successes = 0
	const limit = _app.countTest ()
	let counter = 0

	for (let key in _app.tests) {
		if (_app.tests.hasOwnProperty (key)) {
			const subTest = _app.tests [key]

			for (let testName in subTest) {
				if (subTest.hasOwnProperty (testName)) {
					// Write a closure
					(function () {
						const tempTestName = testName
						const testValue = subTest[testName]
						// Call the test
						try {
							testValue ( () => {
								// If it call back without throwing, then it succeeded, so log it in green
								console.log ('\x1b[32m%s\x1b[0m', tempTestName)
								counter++
								successes++
								if (counter === limit) {
									_app.produceTestReport (limit, successes, errors)
								}
							})
						}
						catch (e) {
							// If it throws, then it failed, so capture the error thrown and log it in red
							errors.push ({
								"name"		: testName,
								"error"		: e
							})
							console.log ('\x1b[31m%s\x1b[0m', tempTestName)
							counter++
							if (counter === limit) {
								_app.produceTestReport (limit, successes, errors)
							}
						}
					}) ()
				}
			}
		}
	}
}

// Produce a test outcome report
_app.produceTestReport = (limit, successes, errors) => {
	console.log ("")
	console.log ("========BEGIN TEST REPORT========")
	console.log ("")
	console.log ("Total Tests: ", limit)
	console.log ("Pass: ", successes)
	console.log ("Fail: ", errors.length)
	console.log ("")

	// If there are errors, print them in detail
	if (errors.length > 0) {
		console.log ("========BEGIN ERROR DETAILS========")
		console.log ("")

		errors.forEach ( (testError) =>{
			console.log ('\x1b[31m%s\x1b[0m', testError.name)
			console.log (testError.error)

		})
		console.log ("========END ERROR DETAILS========")

	}
	console.log ("")
	console.log ("========END TEST REPORT========")
}


// Run the test
_app.runTest ()





