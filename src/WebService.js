// impl restart 
// logging request 


const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    async = require('async'),
    logrotate = require('logrotate-stream'),
    fs = require('fs'),
    searchEngine = require('./SearchEngine');


var pidFilePath = __dirname + '/../bin/pidfile',
    //output = logrotate({file: __dirname + '/logs/output.log', size: '1m', keep: 3, compress: true}),
    WebService = {};


WebService.app = express();
// it possible to config cors for indivudal routes
// https://www.npmjs.com/package/cors
WebService.app.use(cors());

//watchForUpdateIndex(service, index, epubs);

function createRoutes() {
    WebService.routes = {};

    WebService.routes['/search'] = function (req, res) {

        if (!req.query['q']) {
            res.status(500).send('Can`t found query parameter q -> /search?q=word');
            return;
        }

        var q = req.query['q'].toLowerCase().split(/\s+/);
        var bookTitle = req.query['t'];
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits

        searchEngine({}, function (err, se) {

            if (err)
                return console.log(err);

            se.search(q, bookTitle, function (result) {

                res.send(result);
                se.close(function (err) {
                    if (err)
                        console.log(err);
                });
            });
        });
    };


    WebService.routes['/matcher'] = function (req, res) {

        if (!req.query['beginsWith']) {
            res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
            return;
        }

        var bookTitle = req.query['t'];
        searchEngine({}, function (err, se) {

            if (err)
                return console.log(err);

            se.match(req.query['beginsWith'], bookTitle, function (err, matches) {
                res.send(matches);

                se.close(function (err) {
                    if (err)
                        console.log(err);
                });
            });
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


WebService.setup = function (callback) {

    WebService.ipaddress = process.env.IP;
    WebService.port = process.env.PORT || 8080;

    //if (typeof self.ipaddress === "undefined")
    //    self.ipaddress = "127.0.0.1";

    process.on('exit', function () {
        terminator();
    });

    process.on('SIGTERM', function () {
        terminator();
    });

    //process.on('SIGHUP', WebService.restart);
    //process.on('SIGTERM', WebService.stop);
    callback();
};


WebService.init = function (callback) {

    createRoutes();
    WebService.app.use(bodyParser.urlencoded({extended: true}));
    WebService.app.use(bodyParser.json());
    // WebService.app.use(express.static('example/as-a-service/express'));

    //  Add handlers for the app (from the routes).
    for (var r in WebService.routes) {
        WebService.app.get(r, WebService.routes[r]);
    }
    callback();
};


WebService.startupMessages = function (callback) {
    console.log('');
    console.log('Epub-full-text-search Copyright (c) 2015-2016 Lars Voigt');
    console.log('This program comes with ABSOLUTELY NO WARRANTY.');
    console.log('This is free software, and you are welcome to redistribute it under certain conditions.');
    console.log('For the full license, please visit: https://opensource.org/licenses/MIT');
    console.log('');
    callback();
};

WebService.start = function (callback) {
    //  Start the app on the specific interface (and port).
    WebService.app.listen(WebService.port, WebService.ipaddress, function () {
        //TODO: loging
        console.log('%s: Epub search service started on %s:%d ...',
            Date(Date.now()), WebService.ipaddress, WebService.port);
    });

    callback();
};

try {
    if (fs.statSync(pidFilePath)) {
        try {
            var pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'});
            process.kill(pid, 0);
            process.exit();
        } catch (e) {
            fs.unlinkSync(pidFilePath);
        }
    }
} catch (err) {
}



require('daemon')({
    stdout: process.stdout,
    stderr: process.stderr
});

fs.writeFile(pidFilePath, process.pid);


async.series([
    WebService.setup,
    WebService.init,
    WebService.startupMessages,
    WebService.start
], function (err) {
    if (err) {
        console.log('[WebService] Error during startup: ' + err.message);
    }
});


//function watchForUpdateIndex(se, index, epubContent) {
//
//    var chokidar = require('chokidar'); // watch for changes in directory
//
//    chokidar.watch(epubContent, {
//        ignored: /[\/\\]\./,
//        persistent: true
//    }).on('all', function (event, path) {
//
//        se.indexing(epubContent, function (info) {
//            console.log(info);
//        });
//
//    });
//}
