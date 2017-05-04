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

    WebService.routes['/search'] = function (req, res) {

        console.log('[INFO] client request search');

        if (!req.query['q']) {
            res.status(500).send('Can`t found query parameter q -> /search?q=word');
            return;
        }

        const q = req.query['q'].toLowerCase().split(/\s+/);

        var bookTitle = req.query['t'];
        var uuid = req.query['uuid'];
        uuid = uuid || '-1';
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
        console.log('[INFO] bookTitle: ' + bookTitle);
        console.log('[INFO] uuid: ' + uuid);

        searchEngine({})
            .then(se => {

                se.search(q[0], bookTitle, uuid)
                    .then(result => {

                        res.send(result);
                        se.close(err => {
                            if (err)
                                console.error('[ERROR] ' + err);
                        });
                    })
                    .fail(err => {
                        res.send(err);

                        se.close(err => {
                            if (err)
                                console.error('[ERROR] ' + err);
                        });
                    });
            })
            .fail(err => {
                console.error('[ERROR] ' + err);
            });
    };


    WebService.routes['/matcher'] = function (req, res) {

        const beginsWith = req.query['beginsWith'];
        if (!beginsWith) {
            res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
            return;
        }

        var bookTitle = req.query['t'];
        var uuid = req.query['uuid'];


        uuid = uuid || '-1';
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
        console.log('[INFO] client request match');
        console.log('[INFO] bookTitle: ' + bookTitle);
        console.log('[INFO] uuid: ' + uuid);

        searchEngine({})
            .then(se => {
                se.match(beginsWith, bookTitle, uuid)
                    .then(matches => {

                        res.send(matches);
                        se.close(err => {
                            if (err)
                                console.error('[ERROR] ' + err);
                        });
                    })
                    .fail(err => {

                        se.close(err => {
                            if (err)
                                console.error('[ERROR] ' + err);
                        });
                        console.error('[ERROR] ' + err);
                    });
            })
            .fail(err => {
                console.error('[ERROR] ' + err);
            });
    };


    WebService.routes['/addToIndex'] = function (req, res) {
// TODO: testing
        if (!req.query['url'] || !req.query['uuid']) {
            res.status(500).send('Can`t found query parameter beginsWith -> /addToIndex?url=UrlToEPUB&uuid=uuid');
            return;
        }

        const url = req.query['url'];
        const uuid = req.query['uuid'];
        searchEngine({})
            .then(se => {
                se.indexing(url, uuid)
                    .then(() => {

                        res.status(200).send('DONE! EPUB is indexed.');
                        console.log('[INFO] DONE! EPUB is indexed.')
                        se.close(() => {
                        });

                    }).catch(err => {
                    res.status(500).send(err);
                    console.error(err);
                });
            })
            .fail(err => {
                res.status(500).send(err);
                console.error(err);
            });
    };
}



function terminator(sig) {
    if (typeof sig === "string") {
        console.log('[INFO] %s: Received %s - terminating service ...',
            Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('[INFO] %s: EPUB search service stopped.', Date(Date.now()));
}


WebService.setup = function (callback) {

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


WebService.init = function (callback) {

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


WebService.startupMessages = function (callback) {
    console.log('');
    console.log('[INFO] EPUB-full-text-search Copyright (c) 2015-2017 Lars Voigt');
    console.log('[INFO] This program comes with ABSOLUTELY NO WARRANTY.');
    console.log('[INFO] This is free software, and you are welcome to redistribute it under certain conditions.');
    console.log('[INFO] For the full license, please visit: https://opensource.org/licenses/MIT');
    console.log('');
    callback();
};

WebService.start = function (callback) {
    //  Start the app on the specific interface (and port).
    WebService.app.listen(WebService.port, WebService.ipaddress, () => {
        //TODO: logging
        console.log('[INFO] %s: EPUB search started on %s:%d ...',
            new Date(), WebService.ipaddress, WebService.port);
    }).on('error', e => {

        if (e.code == 'EADDRINUSE') {
            return callback('Cant start this Service -> Port is in use!!!');
        }

    });

    callback();
};


async.series([
    WebService.setup,
    WebService.init,
    WebService.startupMessages,
    WebService.start
], err => {
    if (err) {
        console.error('[ERROR] Error during startup: ' + err);
        process.exit(1);
    }

});
