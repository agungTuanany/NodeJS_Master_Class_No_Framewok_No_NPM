"use strict"
/*
 * Example TCP (Net) Client
 * Connects to port 6000 and sends the word "ping" to server
 *
 */

// Dependencies
const net = require ("net")

// Define the message to send
const outboundMessage = "ping"


// Create the client
const client = net.createConnection ({"port": 6000}, () => {
    // Send the message
    client.write (outboundMessage)
})

// When the server writes back, log what is says then kill client
client.on ("data", (inboundMessage) => {
    const messageString = inboundMessage.toString ()
    console.log (`I wrote ${outboundMessage} and they said ${messageString}`)
    client.end ()
})
