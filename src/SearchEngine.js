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
    cfi = require('./CFI.js'), 
    osHomedir = require('os-homedir');



module.exports = function (options) {

    var SearchEngine = {};

    const INDEX_DB = path.join(osHomedir(), '.epub-full-text-search');
    var defaultOption = {'indexPath': INDEX_DB};
    var options = _.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (pathToEpubs) {

        if (fs.isEmptySync(pathToEpubs)) {
            return Q.reject(new Error('Can`t index empty folder: ' + pathToEpubs));
        }
        console.log("\n\n\n******************************************************\n");
        console.log("Start normalize epub content\n\n".yellow);

        // normalize the directory path
        pathToEpubs = path.normalize(pathToEpubs);

        return preparer.normalize(pathToEpubs, options)
            .then(function (dataSet) {
                console.log("\n******************************************************\n");
                console.log("Ready with normalize epub content\n\n".yellow);

                if (dataSet.length > 0)
                    console.log("Start indexing epub-data.");
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

        return SearchEngine._add(jsonDoc, getIndexOptions());
    };

    SearchEngine.search = function (searchFor, bookTitle) {

        bookTitle = bookTitle || DEFAULT_EPUB_TITLE; // * if bookTitle undefined return all hits
        
        var q = {};
        q.query =
            {
                AND: {
                    'epubTitle': [preparer.normalizeEpupTitle(bookTitle)], 
                    'body': [searchFor]
                }
            };

        return SearchEngine.query(q, searchFor);
    };

    SearchEngine.query = function (query, searchFor) {

        return SearchEngine._search(query)
            .then(function (result) {
                const hits = [];

                if (!result.hits) {
                    return hits;
                }

                result.hits.forEach(function (hit) {
                    const document = hit.document,
                        idData = document.id.split(':');

                    document.id = idData[0];

                    const cfiList = cfi.generate({
                        "searchFor": searchFor,
                        "spineItemPath": document.spineItemPath,
                        "baseCfi": document.baseCfi
                    });

                    if (cfiList.length > 0) {
                        document.cfis = cfiList;
                        delete document['*'];
                        delete document.spineItemPath;

                        hits.push(document);
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
            .then(function (matches) {
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
        return {
            fieldOptions: [
                {fieldName: 'epubTitle', searchable: false, store: true},
                {fieldName: 'spineItemPath', searchable: false, store: true},
                {fieldName: 'href', searchable: false, store: true},
                {fieldName: 'baseCfi', searchable: false, store: true},
                {fieldName: 'id', searchable: false, store: true},
                {fieldName: 'filename', searchable: true, store: true},
                {fieldName: 'title', searchable: true, store: false},
                {fieldName: 'body', searchable: true, store: false}
            ]
        };
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

/* require('search-index')({
 nGramLength: [1, 2, 3],   // allow phrase search on phrases of length 1, 2 and 3 words
 stopwords: []             // dont strip out stopwords
 }, function(err, si) {
 si.add([
 {date: 1464122926, text: 'some text'},
 {date: 1464122916, text: 'some another text'}
 ], function (err) {
 if (! err) {
 var q = {};
 q.query = { AND: [{'*': ['text']}] };
 si.search(q, function (err, results) {
 console.log(results);
 })
 }
 })
 })
 1. Use nGramLength to activate phrase search

 2. Set stopwords to []. By default, search-index will remove common english words like 'some' and 'another', 
 so you need to empty your stopword list to allow them to
  be searchable (you could also remove them from the stopword list individually) */