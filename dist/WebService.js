'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _SearchEngine = require('./SearchEngine');

var _SearchEngine2 = _interopRequireDefault(_SearchEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebService = {}; // impl restart 
// logging request 


WebService.app = (0, _express2.default)();
// it possible to config cors for indivudal routes
// https://www.npmjs.com/package/cors
WebService.app.use((0, _cors2.default)());

//watchForUpdateIndex(service, index, epubs);

function createRoutes() {
    WebService.routes = {};

    WebService.routes['/search'] = function (req, res) {

        console.log('client request');

        if (!req.query['q']) {
            res.status(500).send('Can`t found query parameter q -> /search?q=word');
            return;
        }

        var q = req.query['q'].toLowerCase().split(/\s+/);
        var bookTitle = req.query['t'];
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
        console.log('bookTitle: ' + bookTitle);

        (0, _SearchEngine2.default)({}).then(function (se) {

            se.search(q[0], bookTitle).then(function (result) {

                res.send(result);
                se.close(function (err) {
                    if (err) console.log(err);
                });
            }).fail(function (err) {
                res.send(err);

                se.close(function (err) {
                    if (err) console.log(err);
                });
            });
        }).fail(function (err) {
            console.log("error: " + err);
        });
    };

    WebService.routes['/matcher'] = function (req, res) {

        if (!req.query['beginsWith']) {
            res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
            return;
        }

        var bookTitle = req.query['t'];
        (0, _SearchEngine2.default)({}).then(function (se) {

            se.match(req.query['beginsWith'], bookTitle).then(function (matches) {

                res.send(matches);

                se.close(function (err) {
                    if (err) console.log(err);
                });
            }).fail(function (err) {

                se.close(function (err) {
                    if (err) console.log(err);
                });
                console.log(err);
            });
        }).fail(function (err) {
            console.log(err);
        });
    };
}

function terminator(sig) {
    if (typeof sig === "string") {
        console.log('%s: Received %s - terminating service ...', Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('%s: Epub search service stopped.', Date(Date.now()));
}

WebService.setup = function (callback) {

    // WebService.ipaddress = process.env.IP;
    WebService.port = process.env.PORT || 8085;

    process.on('exit', function () {
        terminator();
    });

    process.on('SIGTERM', function () {
        terminator();
    });

    callback();
};

WebService.init = function (callback) {

    createRoutes();
    WebService.app.use(_bodyParser2.default.urlencoded({ extended: true }));
    WebService.app.use(_bodyParser2.default.json());
    // WebService.app.use(express.static('example/as-a-service/express'));

    //  Add handlers for the app (from the routes).
    for (var r in WebService.routes) {
        WebService.app.get(r, WebService.routes[r]);
    }
    callback();
};

WebService.startupMessages = function (callback) {
    console.log('');
    console.log('[INFO] Epub-full-text-search Copyright (c) 2015-2017 Lars Voigt');
    console.log('[INFO] This program comes with ABSOLUTELY NO WARRANTY.');
    console.log('[INFO] This is free software, and you are welcome to redistribute it under certain conditions.');
    console.log('[INFO] For the full license, please visit: https://opensource.org/licenses/MIT');
    console.log('');
    callback();
};

WebService.start = function (callback) {
    //  Start the app on the specific interface (and port).
    WebService.app.listen(WebService.port, WebService.ipaddress, function () {
        //TODO: logging
        console.log('%s: Epub search started on %s:%d ...', new Date(), WebService.ipaddress, WebService.port);
    }).on('error', function (e) {

        if (e.code == 'EADDRINUSE') {
            return callback('Cant start this Service -> IP address is in use!!!');
        }
    });

    callback();
};

_async2.default.series([WebService.setup, WebService.init, WebService.startupMessages, WebService.start], function (err) {
    if (err) {
        console.error('[WebService] Error during startup:' + err);
    }
});