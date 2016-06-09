// * phrase search 
// * html teaser with tagged match

module.exports = function (options, callback) {

    var SearchEngine = {};

    const searchIndex = require('search-index'),
        colors = require('colors'),
        path = require('path'),
        fs = require('extfs'),
        _ = require('lodash'),

        preparer = require('./Preparer.js'),
        cfi = require('./CFI.js');

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
        console.log("\n\n\n******************************************************\n");
        console.log("Start Normalize epub content\n\n".yellow);

        path.normalize(pathToEpubs);

        preparer.normalize(pathToEpubs, function (dataSet) {

            console.log("\n******************************************************\n");
            console.log("Ready Normalize epub content\n\n".yellow);

            if (dataSet.length > 0)
                console.log("Start writing epub-data to index.");
            else {
                console.log("DONE! Nothing to do, epubs already indexed.\n\n");
                return;
            }
            //console.log(dataSet);
            //fs.writeFileSync('./data1.json', JSON.stringify(dataSet) , 'utf-8');

            SearchEngine.add(dataSet, function (err) {

                if (callback) {
                    if (err)
                        callback(err);
                    else
                        callback('\nDONE! All is indexed.\n\n'.yellow);
                }
            });
        });
    };

    SearchEngine.add = function (jsonDoc, callback) {

        var ids = jsonDoc.FirstSpineItemsId;
        delete jsonDoc.FirstSpineItemsId;

        var opt = getIndexOptions();
        SearchEngine.si.add(jsonDoc, opt, callback);

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

            var hits = [];

            console.log(result.hits);
            if (!result.hits) {
                callback(hits);
                return;
            }

            result.hits.forEach(function(hit) {
                var document = hit.document,
                    idData = document.id.split(':'),
                    title = idData[1];

                document.id = idData[0];

                if (title === epubTitle || epubTitle === '*') {

                    var cfiList = cfi.generate({
                        "query": q,
                        "spineItemPath": document.spineItemPath,
                        "baseCfi": document.baseCfi
                    });

                    if (cfiList.length > 0) {
                        document.cfis = cfiList;
                        delete document['*'];
                        delete document.spineItemPath;

                        hits.push(document);
                    }
                }

            });
            callback(hits);
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

    function filterMatches(matches, epubTitle) {

        return matches
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
    }
};