// impl restart 
// logging request 
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import async from 'async';
import searchEngine from './SearchEngine';

const WebService = {};

WebService.app = express();
// it possible to config cors for indivudal routes
// https://www.npmjs.com/package/cors
WebService.app.use(cors());

//watchForUpdateIndex(service, index, epubs);

function createRoutes() {
    WebService.routes = {};

    WebService.routes['/search'] = function (req, res)  {

        console.log('client request');

        if (!req.query['q']) {
            res.status(500).send('Can`t found query parameter q -> /search?q=word');
            return;
        }

        const q = req.query['q'].toLowerCase().split(/\s+/);
        var bookTitle = req.query['t'];
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
        console.log('bookTitle: ' + bookTitle);

        searchEngine({})
            .then((se) => {

                se.search(q[0], bookTitle)
                    .then((result) => {

                        res.send(result);
                        se.close((err) => {
                            if (err)
                                console.log(err);
                        });
                    })
                    .fail((err) => {
                        res.send(err);

                        se.close((err) => {
                            if (err)
                                console.log(err);
                        });
                    });
            })
            .fail((err) => {
                console.log("error: " + err);
            });
    };


    WebService.routes['/matcher'] = function (req, res)  {

        if (!req.query['beginsWith']) {
            res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
            return;
        }

        const bookTitle = req.query['t'];
        searchEngine({})
            .then((se) => {

                se.match(req.query['beginsWith'], bookTitle)
                    .then((matches) => {

                        res.send(matches);

                        se.close((err) => {
                            if (err)
                                console.log(err);
                        });
                    })
                    .fail((err) => {

                        se.close((err) => {
                            if (err)
                                console.log(err);
                        });
                        console.log(err);
                    });
            })
            .fail((err) => {
                console.log(err);
            });
    };
}

function terminator(sig) {
    if (typeof sig === "string") {
        console.log('%s: Received %s - terminating service ...',
            Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('%s: Epub search service stopped.', Date(Date.now()));
}


WebService.setup = function (callback)  {

    // WebService.ipaddress = process.env.IP;
    WebService.port = process.env.PORT || 8085;

    process.on('exit', () => {
        terminator();
    });

    process.on('SIGTERM', () => {
        terminator();
    });

    callback();
};


WebService.init = function (callback)  {

    createRoutes();
    WebService.app.use(bodyParser.urlencoded({extended: true}));
    WebService.app.use(bodyParser.json());
    // WebService.app.use(express.static('example/as-a-service/express'));

    //  Add handlers for the app (from the routes).
    for (const r in WebService.routes) {
        WebService.app.get(r, WebService.routes[r]);
    }
    callback();
};


WebService.startupMessages = function (callback)  {
    console.log('');
    console.log('[INFO] Epub-full-text-search Copyright (c) 2015-2017 Lars Voigt');
    console.log('[INFO] This program comes with ABSOLUTELY NO WARRANTY.');
    console.log('[INFO] This is free software, and you are welcome to redistribute it under certain conditions.');
    console.log('[INFO] For the full license, please visit: https://opensource.org/licenses/MIT');
    console.log('');
    callback();
};

WebService.start = function (callback)  {
    //  Start the app on the specific interface (and port).
    WebService.app.listen(WebService.port, WebService.ipaddress, () => {
        //TODO: logging
        console.log('%s: Epub search started on %s:%d ...',
            new Date(), WebService.ipaddress, WebService.port);
    }).on('error', (e) => {

        if (e.code == 'EADDRINUSE') {
            return callback('Cant start this Service -> IP address is in use!!!');
        }

    });

    callback();
};


async.series([
    WebService.setup,
    WebService.init,
    WebService.startupMessages,
    WebService.start
], (err) => {
    if (err) {
        console.error('[WebService] Error during startup:' + err);
    }
});
