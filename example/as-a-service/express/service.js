const express = require('express'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      searchEngine = require('../../../');

var SampleService = function () {

    var self = this;
    self.app = express();
    // it possible to config cors for indivudal routes
    // https://www.npmjs.com/package/cors
    self.app.use(cors());

    function setupVariables() {

        self.ipaddress = process.env.IP;
        self.port = process.env.PORT || 8080;

        //if (typeof self.ipaddress === "undefined")
        //    self.ipaddress = "127.0.0.1";
    }

//watchForUpdateIndex(service, index, epubs);

    function createRoutes() {
        self.routes = {};

        self.routes['/search'] = function (req, res) {

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


        self.routes['/matcher'] = function (req, res) {

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

    function initServer() {

        createRoutes();
        self.app.use(bodyParser.urlencoded({extended: true}));
        self.app.use(bodyParser.json());
        self.app.use(express.static('example/as-a-service/express'));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    }

    function terminator(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating service ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    }


    function setupTerminationHandlers() {
        //  Process on exit and signals.
        process.on('exit', function () {
            terminator();
        });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
                process.on(element, function () {
                    terminator(element);
                });
            });
    }

    self.startIndexing = function () {

        //var node_modules_path = require.resolve('body-parser').split('body-parser')[0]; // absolute path 
        //var epubs = node_modules_path + 'epub3-samples';
        var epubs = 'node_modules/epub3-samples';

        if (process.env.DEBUG) {
            console.log("debug mode");
            epubs = '../../../node_modules/epub3-samples';
        }

        searchEngine({}, function (err, se) {

            if (err) {
                console.log(err);
            } else {

                se.indexing(epubs, function (info) {
                    console.log(info);

                    se.close(function (err) {
                        if (err)
                            console.log(err);
                    });
                });
            }
        });
    };

    self.init = function () {
        setupVariables();
        setupTerminationHandlers();
        initServer();
    };


    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

};

var sase = new SampleService();
sase.startIndexing();
sase.init();
sase.start();


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
