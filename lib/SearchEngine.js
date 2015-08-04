// * phrase search 
// * html teaser with tagged match

module.exports = function (options) {

    var SearchIndex = require('search-index');
    var path = require('path');

    var preparer = require('./Preparer.js');
    var cfi = require('./CFI.js');

    var indexDB = 'indexDB'; // path to index-db 
    var defaultOption = {'indexPath': indexDB, logLevel: 'warn'};
    options = options || defaultOption;

    var si = new SearchIndex(options);
    var that = this;

    this.indexing = function (pathToEpubs, callback) {

        console.log("normalize epub content");

        path.normalize(pathToEpubs);

        preparer.normalize(pathToEpubs, function (dataSet) {

            console.log("start indexing");
            that.add(dataSet, function (err) {
                //console.log(dataSet);
                if (callback) {
                    if (err)
                        callback(err);
                    else
                        callback('all is indexed');
                }
            });
        });
    };

    this.add = function (jsonDoc, callback) {

        var options = {};
        options.filters = [];
        //options.batchName = 'batch' + Date.now();
        //options.batchName = jsonDoc[0].id;

        //si.get(options.batchName, function (err, doc) {
        //    if (err)  // update doc with latest version ???
        si.add(options, jsonDoc, callback);
        //else
        //    callback();
        //});
    };

    this.search = function (q, epubTitle, callback) {

        epubTitle = epubTitle || '*'; // if epubTitle undefined return all hits

        // q is an array !!!
        var query = {
            "query": {"*": q},
            "offset": 0,
            "pageSize": 100
        };

        si.search(query, function (err, result) {

            if (result.hits) {

                var hits = [];
                for (var i in result.hits) {

                    var title = result.hits[i].document.epubTitle;
                    if (title === epubTitle || epubTitle === '*') {

                        var data = {
                            "query": q,
                            "spineItemPath": result.hits[i].document.spineItemPath,
                            "baseCfi": result.hits[i].document.baseCfi
                        }

                        var cfiList = cfi.generate(data); 
                        
                        if (cfiList.length > 0) {
                            result.hits[i].document.cfis = cfiList;
                            delete result.hits[i].document.body;
                            delete result.hits[i].document.title;
                            delete result.hits[i].document['*'];
                            delete result.hits[i].document.spineItemPath;

                            hits.push(result.hits[i].document);
                        }
                    }
                }
                callback(hits);
            }
        })
    };

    this.match = function (beginsWith, callback) {
        si.match(beginsWith, callback);
    };

    this.empty = function (callback) {
        si.empty(callback);
    };
};