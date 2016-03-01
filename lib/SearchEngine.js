// * phrase search 
// * html teaser with tagged match

module.exports = function (options, callback) {

    var SearchEngine = {};

    const searchIndex = require('search-index');
    const path = require('path');
    const fs = require('extfs');
    const Q = require('q');
    const _ = require('lodash');

    const preparer = require('./Preparer.js');
    const cfi = require('./CFI.js');

    const INDEX_DB = 'full-text-search-DB'; // path to index-db 
    var defaultOption = {'indexPath': INDEX_DB};
    var options = _.isEmpty(options) ? defaultOption : options;

    const DEFAULT_EPUB_TITLE = '*';


    searchIndex(options, function (err, si) {

        if (err) 
            return callback(err, null)

        SearchEngine.si = si;
        return callback(null, SearchEngine)
        
    });

    SearchEngine.indexing = function (pathToEpubs, callback) {

        if (fs.isEmptySync(pathToEpubs)) {
            return callback(new Error('Can`t index empty folder: ' + pathToEpubs));
        }
        console.log("******************************************************");
        console.log("Step 1");
        console.log("start normalize epub content");

        path.normalize(pathToEpubs);

        preparer.normalize(pathToEpubs, function (dataSet) {

            console.log("ready normalize epub content");
            console.log("******************************************************");
            console.log("Step 2");
            console.log("start indexing");
            SearchEngine.add(dataSet, function (err) {
                //console.log(dataSet);
                if (callback) {
                    if (err)
                        callback(err);
                    else
                        callback('all is indexed');
                }
            });
            //callback('all is indexed');
        });
    };

    SearchEngine.add = function (jsonDoc, callback) {

        var ids = jsonDoc.FirstSpineItemsId;
        delete jsonDoc.FirstSpineItemsId;

        shouldRebuildIndexes(ids, function (rebuild) {
            // check is rebuild indexes necessary -> speed up the auto start
            // Reasons to rebuild the index can be:
            // * new epub content should be index
            // * index will be generating first time  

            if (rebuild) {
                //    var s = fs.createWriteStream('add.json');
                //    s.write(JSON.stringify(jsonDoc));
                //    s.end();
                var opt = getIndexOptions();
                SearchEngine.si.add(jsonDoc, opt, callback);
            } else
                return callback();
        });
    };

    SearchEngine.search = function (q, epubTitle, callback) {

        var epubTitle = epubTitle || DEFAULT_EPUB_TITLE; // if epubTitle undefined return all hits

        // q is an array !!!
        var query = {
            "query": {"*": q},
            "offset": 0,
            "pageSize": 100
        };

        SearchEngine.si.search(query, function (err, result) {

            if (err)
                console.error(err);

            if (result.hits) {

                var hits = [];
                for (var i in result.hits) {

                    // id = spineitemId:epubTitle 
                    var title = result.hits[i].document.id.split(':')[1];
                    result.hits[i].document.id = result.hits[i].document.id.split(':')[0];

                    //console.log(result.hits[i].document);

                    if (title === epubTitle || epubTitle === '*') {

                        var data = {
                            "query": q,
                            "spineItemPath": result.hits[i].document.spineItemPath,
                            "baseCfi": result.hits[i].document.baseCfi
                        };

                        var cfiList = cfi.generate(data);

                        if (cfiList.length > 0) {
                            result.hits[i].document.cfis = cfiList;
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

    SearchEngine.match = function (beginsWith, epubTitle, callback) {

        if (!_.isString(epubTitle) && !_.isNull(epubTitle))
            console.error('epubTitle should be null or type string');

        var epubTitle = epubTitle || DEFAULT_EPUB_TITLE;

        SearchEngine.si.match({beginsWith: beginsWith, type: 'ID'},

            function (err, matches) {
                return callback(err, filterMatches(matches, epubTitle));
            });
    };

    SearchEngine.empty = function (callback) {
        SearchEngine.si.empty(callback);
    };

    SearchEngine.close = function (callback) {
        SearchEngine.si.close(callback);
    };


    // private 
    function getIndexOptions() {

        var options = {};
        options.filters = [];
        options.fieldsToStore = ['id', 'spineItemPath', 'href', 'baseCfi', 'epubTitle'];
        options.fieldOptions = [
            {fieldName: 'epubTitle', searchable: false},
            {fieldName: 'spineItemPath', searchable: false},
            {fieldName: 'href', searchable: false},
            {fieldName: 'baseCfi', searchable: false},
            {fieldName: 'id', searchable: false}
        ];
        return options;
    }

    function shouldRebuildIndexes(ids, callback) {

        getIndexes(ids, function (results) {

            for (var i in results) {
                if (results[i].state === 'fulfilled' && results[i].value === null) {
                    console.log("It is necessary to (re)build indexes!");
                    return callback(true);
                }
            }
            console.log("It is not necessary to rebuild indexes.");
            return callback(false);
        });
    }

    function getIndexes(ids, callback) {

        var promises = [];

        ids.forEach(function (id) {
            var deferred = Q.defer();
            SearchEngine.si.get(id, function (err, result) {
                //console.log(result);
                deferred.resolve(result);
            });
            promises.push(deferred.promise);
        });

        return Q.allSettled(promises).then(callback);
    }

    function filterMatches(matches, epubTitle) {

        var result = matches
            .map(function (match) {

                if (epubTitle === '*') {
                    // if epubTitle undefined return all matches
                    return match[0];
                } else {
                    var titles = match[1].map(function (id) {
                        // id = spineitemid:epubtitle
                        return id.split(':')[1]
                    });
                    return _.include(titles, epubTitle) ? match[0] : '';
                }
            })
            .filter(Boolean); // filter ["", "", ""] -> []
        return result;
    }
};