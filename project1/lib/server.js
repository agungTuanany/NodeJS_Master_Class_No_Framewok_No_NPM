"use strict";
/*
 * Server-related tasks
 */

// Dependencies
const http          = require("http");
const https         = require("https");
const url           = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const fs            = require("fs");
const path          = require("path");
const util          = require("util");


// Buildin dependencies
const config   = require("./config.js");
const handlers = require("./handlers");
const helpers  = require("./helpers");

// Debugging
const debug= util.debuglog("server"); // run NODE_DEBUG=server node index.js

// Instantiate the server module object
let server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req,res) => {

    server.unifiedServer(req,res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync (path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync (path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer (server.httpsServerOptions,(req,res) => {

    server.unifiedServer(req,res);
});

// All the server logic for both 'HTTP' and 'HTTPS' server
server.unifiedServer = (req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the Payload, if any
    const decoder = new stringDecoder("utf-8");
    let buffer = "";     // just placeholder for string

    // using Stream
    req.on ("data", data => {

        buffer += decoder.write(data);
    });

    req.on ("end", () => {

        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found,  use notFound handlers
        let choosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ?
            server.router[trimmedPath] :
            handlers.notFound;

        // if the request is within the public directory use the public handlers instead
        choosenHandler = trimmedPath.indexOf ("public/") > -1 ?
            handlers.public :
            choosenHandler;

        // Construct the data object to send to the handler
        let data = {
            "trimmedPath"       : trimmedPath,
            "queryStringObject" : queryStringObject,
            "method"            : method,
            "headers"           : headers,
            "payload"           : helpers.parseJsonToObject (buffer)
        };

        // Route the request to the handler specified in the router
        try {
            choosenHandler(data, (statusCode, payload, contentType) => {

                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
            });
        }
        catch (e) {
            debug(e);
            server.processHandlerResponse (res, method, trimmedPath, 500, {
                "error code": "500",
                "Error" : "An unknown error has occured | internal server error"
            }, "json");
        };
    });
};

// Process the response from the handler
server.processHandlerResponse = (res, method, trimmedPath, statusCode, payload, contentType) => {

    // Determine the type of response (fallback to JSON)
    contentType = typeof (contentType) === "string" ? contentType : "json";

    // Use the status code called back by the handler, or default to 200
    statusCode = typeof (statusCode) === "number" ? statusCode : 200;

    // Return the response-part that are content-specific
    let payloadString = "";

    if (contentType === "json") {
        res.setHeader("Content-Type", "application/json"):
        // Use the payload called back the handler, or default to an empty object
        payload = typeof (payload) === "object" ? payload : {};
        // Convert the payload to a string
        payloadString = JSON.stringify (payload);
    };

    if (contentType === "html") {
        res.setHeader("Content-Type", "text/html");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) === "string" ? payload : "";
    };

    if (contentType === "favicon") {
        res.setHeader("Content-Type", "image/x-icon");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "";
    };

    if (contentType === "css") {
        res.setHeader("Content-Type", "text/css");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "";
    };

    // @FIXME: ALL PNG, JPG return response a dimension into 0X0,in firefox, brave (brave same as chromium)
    if (contentType === "png") {
        res.setHeader("Content-Type", "image/png");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "";
    };

    if (contentType === "jpg") {
        res.setHeader("Content-Type", "image/png");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "";
    };

    if (contentType === "js") {
        res.setHeader("Content-Type", "application/javascript");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "":
    };

    if (contentType === "plain") {
        res.setHeader("Content-Type", "text/plain");
        // Use the payload called back the handler, or default to an empty string
        payloadString = typeof (payload) !== "undefined" ? payload : "";
    };

    // return the response-part that are common to all content-types
    res.writeHead(statusCode);
    res.end(payloadString);

    // If the response is 200, print green otherwise print red
    if (statusCode === 200) {
        debug("\x1b[36m%s\x1b[0m", method.toUpperCase()+" /"+trimmedPath+" "+statusCode);
    }
    else {
        debug("\x1b[31m%s\x1b[0m", method.toUpperCase()+" /"+trimmedPath+" "+statusCode+payloadString);
    };
};

// Define a Request Router
server.router = {
    ""                  : handlers.index,
    "public"            : handlers.public,
    "account/create"    : handlers.accountCreate,
    "account/edit"      : handlers.accountEdit,
    "account/deleted"   : handlers.accountDeleted,
    "session/create"    : handlers.sessionCreate,
    "session/deleted"   : handlers.sessionDeleted,
    "checks/all"        : handlers.checksList,
    "checks/create"     : handlers.checksCreate,
    "checks/edit"       : handlers.checksEdit,
    "sample"            : handlers.sample,
    "ping"              : handlers.ping,
    "api/tokens"        : handlers.tokens,
    "api/checks"        : handlers.checks,
    "api/users"         : handlers.users,
    "favicon.ico"       : handlers.favicon,
    "examples/error"    : handlers.exampleError,
    "404"               : handlers.notFound         // @TODO: throw all not found handler into 404
}

// Init script
server.init = () => {

    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {

        console.log('\x1b[36m%s\x1b[0m', `The server is listening on port "${config.httpPort}"`);
    });

    server.httpsServer.listen (config.httpsPort, () => {

        console.log('\x1b[35m%s\x1b[0m', `The server is listening on port "${config.httpPort}"`);
    });
};

// Export the module
module.exports = server;


//#########################################################
// Dependencies test
// const _data			  = require ("./lib/data")

// XXX XXX XXX TESTING XXX XXX XXX
// @TODO delete this test

//_data.create ("test", "newFile", {"foo": "bar"}, (err) => {
//	console.log ("this was the error:", `"${err}"`)
//})

//_data.read ("test", "newFile", (err, data) => {
//	console.log ("this was the error", `"${err}"`, 'and this was the data', data)
//})

//_data.update ("test", "newFile", {"fizz": "buzz"}, (err) => {
//	console.log ('this was the error:', `"${err}"`)
//})

//_data.delete ("test", "newFile", (err) => {
//	console.log ('this was the error: ', `"${err}"`)
//})

// Twilio send SMS test
//helpers.sendTwilioSms ("+/your/phone/number", "TEST FROM TWILIO", (err) => {
//	console.log ("this was an error ", err)
//})
///////////////////////////////////////////////////////////


