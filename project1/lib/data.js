"use strict"
/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs        = require ("fs")
const path      = require ("path")

const helpers   = require ("./helpers")

// Container for the module (to be exported)
const lib = {}

// Base directory of the data folder
lib.baseDir = path.join (__dirname, "/../.data/")

// Write data to a file
lib.create = function (dir, file, data, callback) {

    // Open the file for writing
    fs.open (lib.baseDir+dir+"/"+file+".json", "wx", function (err, fileDescriptor) {
        // XXX XXX XXX FIXME from callback hell !! XXX XXX XXX
        // if there's not an error and there is fileDescriptor
        if (!err && fileDescriptor) {
            // Convert data to string
            let stringData = JSON.stringify (data, null, 2)

            // Write to file and close it
            fs.writeFile (fileDescriptor, stringData, function (err) {
                // if there's no error
                if (!err) {
                    fs.close (fileDescriptor, function (err) {
                        if (!err) {
                            // false mean no error
                            callback (false)
                        }
                        else {
                            callback ("Error closing new file")
                        }
                    })
                }
                else {
                    callback ("Error writing to new file")
                }
            })
        }
        else {
            callback ('Could not create new file, it may already exists')
        }
    })
}

// Read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile (`${lib.baseDir}${dir}/${file}.json`, "utf-8", function (err, data) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject (data)
            callback (false, parsedData)
        }
        else {
            callback (err, data)
        }
    })
}

// Update data inside a file
lib.update = function (dir, file, data, callback) {

    // Open the file for writing
    fs.open (lib.baseDir+dir+"/"+file+".json", "r+", function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify (data, null, 2)

            // Truncate the file | truncate : memotong
            fs.ftruncate (fileDescriptor, function (err) {
                if (!err) {
                    // Write to the file and close it
                    fs.writeFile (fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close (fileDescriptor, function (err) {
                                if (!err) {
                                    callback (false)
                                }
                                else {
                                    callback ("Error closing existing file")
                                }
                            })
                        }
                        else {
                            callback ("Error writing to Existing file")
                        }
                    })
                }
                else {
                    callback ("Error truncating file")
                }
            })
        }
        else {
            callback ("could not open the file for updating, it may not exist yet")
        }
    })
}

lib.delete = function (dir, file, callback) {

    // Unlink the file from the filesystem
    fs.unlink (lib.baseDir+dir+"/"+file+".json", function (err) {
        callback (err)
    })
}

// List all the items in a directory
lib.list = function (dir, callback) {
    fs.readdir (lib.baseDir+dir+"/", (err, data) => {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = []
            data.forEach ( (fileName) => {
                trimmedFileNames.push (fileName.replace (".json", ""))
            })
            callback (false, trimmedFileNames)
        }
        else {
            callback (err, data)
        }
    })
}

// Export the module
module.exports = lib
