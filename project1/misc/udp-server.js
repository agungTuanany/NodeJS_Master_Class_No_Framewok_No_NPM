"use strict"
/*
 * Example UDP Server
 * Creating a UDP datagram server listening on 6000
 *
 */

// Dependencies
const dgram = require ("dgram")

// Create a server
const server = dgram.createSocket ("udp4")

server.on ("message", (messageBuffer, sender) => {
    // Do something with an incoming message or do something with the sender
    const messageString = messageBuffer.toString ()
    console.log (messageString)
})

// Bind to 6000
server.bind	(6000)
