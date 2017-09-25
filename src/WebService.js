// impl restart 
// logging request 
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import async from 'async';
import search from './Rest-API/Search';
import matcher from './Rest-API/Matcher';
import addToIndex from './Rest-API/AddToIndex';
import deleteFromIndex from './Rest-API/DeleteFromIndex';
import winston from './Logger';
import searchEngine from './SearchEngine';

const WebService = {};

WebService.app = express();
// Have a look to config cors for indivudal routes
// https://www.npmjs.com/package/cors
WebService.app.use(cors());
WebService.app.use(bodyParser.urlencoded({extended: true}));
WebService.app.use(bodyParser.json());

// routes
WebService.app.get('/search', search);
WebService.app.get('/matcher', matcher);
WebService.app.get('/addToIndex', addToIndex); // POST or GET???
WebService.app.get('/deleteFromIndex', deleteFromIndex); // POST or GET???

function terminator(sig) {
    if (typeof sig === "string") {
        winston.log('info', '%s: Received %s - terminating service ...',
            Date(Date.now()), sig);

        WebService.app.se.close(err => {
            if (err)
                winston.log('error', err);
            process.exit(1);
        })
    }
    winston.log('info', '%s: EPUB search stopped.', Date(Date.now()));
}


function invokeSearchEngine(callback) {
    searchEngine({})
        .then(se => {
            WebService.app.se = se;
            callback();
        })
        .fail(err => {
            winston.log('error', err);
            callback(err);
        });
}

function setup(callback) {

    // WebService.ipaddress = process.env.IP;
    WebService.port = process.env.PORT || 8085;

    process.on('exit', () => {
        terminator();
    });

    process.on('SIGTERM', () => {
        terminator();
    });

    callback();
}


function startupMessages(callback) {
    winston.log('info', '');
    winston.log('info', 'EPUB-search Copyright (c) 2015-2017 Lars Voigt');
    winston.log('info', 'This program comes with ABSOLUTELY NO WARRANTY.');
    winston.log('info', 'This is free software, and you are welcome to redistribute it under certain conditions.');
    winston.log('info', 'For the full license, please visit: https://opensource.org/licenses/MIT \n');
    callback();
}

function startServer(callback) {
    //  Start the app on the specific interface (and port).
    WebService.app.listen(WebService.port, WebService.ipaddress, () => {
        //TODO: logging
        winston.log('info', '%s: EPUB search started on %s:%d ... \n',
            new Date(), WebService.ipaddress, WebService.port);
    }).on('error', e => {

        if (e.code == 'EADDRINUSE') {
            return callback('Cant start this Service -> Port is in use!!!');
        }
    });
    callback();
}


async.series([invokeSearchEngine, setup, startupMessages, startServer], err => {
    if (err) {
        winston.log('error', 'Error during startup: ' + err);
        WebService.app.se.close(err => {
            if (err)
                winston.log('error', err);
            process.exit(1);
        })
    }
});

module.exports = WebService.app;