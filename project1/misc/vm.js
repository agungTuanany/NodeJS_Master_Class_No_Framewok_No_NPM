"user strict"
/*
 * Example Virtual Machine
 * Running Some arbitrary commands
 *
 */


// Dependencies
const vm = require ("vm")


// Define a context for the script to run in
const context = {
    "foo"   : 25
}

// Define the script
const script = new vm.Script  (`

    foo     = foo * 2
    var bar = foo + 1
    var biz = 52

`)

script.runInNewContext (context)
console.log (context)
