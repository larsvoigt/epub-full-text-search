'use strict';

const DEFAULT_EPUB_TITLE = '*';

const searchIndexSource = require('search-index'),
    Q = require('q'),
    searchIndex = Q.denodeify(searchIndexSource),
    colors = require('colors'),
    path = require('path'),
    fs = require('extfs'),
    _ = require('lodash'),
    preparer = require('./Preparer.js'),
    cfi = require('./CFI.js');


module.exports = function (options) {

    var SearchEngine = {};

    const INDEX_DB = 'full-text-search-DB'; // path to index-db 
    var defaultOption = {'indexPath': INDEX_DB};
    var options = _.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (pathToEpubs) {

        if (fs.isEmptySync(pathToEpubs)) {
            return Q.reject(new Error('Can`t index empty folder: ' + pathToEpubs));
        }
        console.log("\n\n\n******************************************************\n");
        console.log("Start Normalize epub content\n\n".yellow);

        // normalize the directory path
        pathToEpubs = path.normalize(pathToEpubs);

        return preparer.normalize(pathToEpubs)
            .then(function (dataSet) {
                console.log("\n******************************************************\n");
                console.log("Ready Normalize epub content\n\n".yellow);

                if (dataSet.length > 0)
                    console.log("Start writing epub-data to index.");
                else {
                    console.log("DONE! Nothing to do, epubs already indexed.\n\n");
                    return;
                }

                return SearchEngine.add(dataSet);
            });
    };

    SearchEngine.add = function (jsonDoc) {

        var ids = jsonDoc.FirstSpineItemsId;
        delete jsonDoc.FirstSpineItemsId;

        var opt = getIndexOptions();
        return SearchEngine._add(jsonDoc, opt);
    };

    SearchEngine.search = function (q, epubTitle) {

        var epubTitle = epubTitle || DEFAULT_EPUB_TITLE; // if epubTitle undefined return all hits

        // q is an array !!!
        var query = {
            "query": {"*": q},
            "offset": 0,
            "pageSize": 100
        };

        return SearchEngine._search(query)
            .then(function (result) {
                var hits = [];

                if (!result.hits) {
                    return hits;
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
                return hits;
            });
    };

    SearchEngine.match = function (beginsWith, epubTitle) {

        if (!_.isString(epubTitle) && !_.isNull(epubTitle))
            console.error('epubTitle should be null or type string');

        var epubTitle = epubTitle || DEFAULT_EPUB_TITLE;

        return SearchEngine._match({beginsWith: beginsWith, type: 'ID'})
            .then(function(matches) {
                return filterMatches(matches, epubTitle);
            });
    };

    SearchEngine.empty = function () {
        return SearchEngine._empty();
    };

    SearchEngine.close = function () {
        return SearchEngine._close();
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

    return searchIndex(options)
        .then(function (si) {
            SearchEngine.si = si;
            SearchEngine._search = Q.nbind(si.search, si);
            SearchEngine._close = Q.nbind(si.close, si);
            SearchEngine._empty = Q.nbind(si.empty, si);
            SearchEngine._match = Q.nbind(si.match, si);
            SearchEngine._add = Q.nbind(si.add, si);
            return SearchEngine;
        });
};