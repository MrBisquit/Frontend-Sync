/**
* FrontendSync V1.0.0
* Easily sync data between frontend and backend seamlessly.
* Auhtor: MrBisquit (william@wtdawson.info)
* Licence: MIT
* Github: https://github.com/MrBisquit/Frontend-Sync
* NPM: 
*/

// --- Begin imports ---

const express = require("express");
const bodyParser = require("body-parser");
const EventEmitter = require('events');

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended : true });

// --- End imports ---

// The express router, very useful.

const Router = express.Router();

// This is the event emitter

const eventEmitter = new EventEmitter();

// This is the queues object, when a new user comes along their IP gets put into here. It will be emptied after 24 hours~ (Or custom time.)

let queues = {};

// This is the config, it contains information such as how long to wait until it clears the queues.

let config = {
    clearQueue : 86400000
}

function getOption(option, defaultValue) {
    if(typeof option == "undefined" || !option) {
        return defaultValue;
    } else {
        return option;
    }
}

function Init() {
    setInterval(() => {

    }, config.clearQueue);
}

/**
 * When a client wants to recieve queue data, they make a get request and if there is no queue for their IP, it gets created.
 */

Router.get("/fesapi/fetch-queue/", (req, res, next) => {
    if(queues[req.ip] == undefined) {
        queues[req.ip] = [];
    }

    return res.status(200).jsonp({ success : true, queue : queues[req.ip] });
});

/**
 * Recieve queue data and emit events based on the queue data.
 */

Router.put("/fesapi/set-queue/", jsonParser, (req, res, next) => {
    if(Object.values(req.body.queue).length == 0) {
        return res.jsonp({ success : true, recieved : 0});
    }

    var keys = Object.keys(req.body.queue);

    for (let i = 0; i < keys.length; i++) {
        var key = req.body.queue[keys];

        eventEmitter.emit(key.type, message);
    }

    return res.jsonp({ success : true, recieved : Object.values(req.body.queue).length });
});

// Main class for FrontendSync with functions such as SendAll().

class FrontendSync {
    constructor(options) {
        options = {
            clearQueue : getOption(options.clearQueue, config.clearQueue)
        }

        config = options;

        Init();
    }

    /**
     * Add an item to every queue, unremovable afterwards.
     * 
     * @param {string} type
     * @param {string} message
     */

    SendAll(type, message) {
        let keys = Object.keys(queues);

        for (let i = 0; i < keys.length; i++) {
            queues[keys[i]].push({
                date : new Date(),
                type : type,
                message : message
            });
        }
    }
}

// Module exports, exporting the class as it is and the Router as mw.

module.exports = {
    FrontendSync,
    mw : Router,
    events : eventEmitter
}