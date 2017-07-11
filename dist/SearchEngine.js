'use strict';

var _searchIndex = require('search-index');

var _searchIndex2 = _interopRequireDefault(_searchIndex);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _extfs = require('extfs');

var _extfs2 = _interopRequireDefault(_extfs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Preparer = require('./Preparer.js');

var _Preparer2 = _interopRequireDefault(_Preparer);

var _CFI = require('./CFI.js');

var _CFI2 = _interopRequireDefault(_CFI);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_EPUB_TITLE = '*';

var searchIndex = _q2.default.denodeify(_searchIndex2.default);

module.exports = function (options) {

    var SearchEngine = {};

    var defaultOption = { 'indexPath': _Constants2.default.DATA_FOLDER };
    options = _lodash2.default.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (pathToEpubs) {

        if (_extfs2.default.isEmptySync(pathToEpubs)) {
            return _q2.default.reject(new Error('Can`t index empty folder: ' + pathToEpubs));
        }
        console.log("\n\n\n******************************************************\n");
        console.log("Start normalize epub content\n\n".yellow);

        // normalize the directory path
        pathToEpubs = _path2.default.normalize(pathToEpubs);

        return _Preparer2.default.normalize(pathToEpubs, options).then(function (dataSet) {
            console.log("\n******************************************************\n");
            console.log("Ready with normalize epub content\n\n".yellow);

            if (dataSet.length > 0) console.log("Start indexing epub-data.");else {
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

        var title = bookTitle || DEFAULT_EPUB_TITLE; // * if bookTitle undefined return all hits

        var q = {};
        q.query = {
            AND: {
                'epubTitle': [_Preparer2.default.normalizeEpupTitle(title)],
                'body': [searchFor]
            }
        };

        return SearchEngine.query(q, searchFor);
    };

    SearchEngine.query = function (query, searchFor) {

        return SearchEngine._search(query).then(function (result) {
            var hits = [];

            if (!result.hits) {
                return hits;
            }

            result.hits.forEach(function (hit) {
                var document = hit.document,
                    idData = document.id.split(':');

                document.id = idData[0];

                var cfiList = _CFI2.default.generate({
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

        if (!_lodash2.default.isString(epubTitle) && !_lodash2.default.isNull(epubTitle)) console.error('epubTitle should be null or type string');

        if (beginsWith.length < 3) {
            //match string must be longer than threshold (3)

            var deferred = _q2.default.defer();
            deferred.resolve([]);
            return deferred.promise;
        }

        var title = epubTitle || DEFAULT_EPUB_TITLE;

        return SearchEngine._match({ beginsWith: beginsWith, type: 'ID' }).then(function (matches) {
            return filterMatches(matches, title);
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
            fieldOptions: [{ fieldName: 'epubTitle', searchable: false, store: true }, { fieldName: 'spineItemPath', searchable: false, store: true }, { fieldName: 'href', searchable: false, store: true }, { fieldName: 'baseCfi', searchable: false, store: true }, { fieldName: 'id', searchable: false, store: true }, { fieldName: 'filename', searchable: true, store: true }, { fieldName: 'title', searchable: true, store: false }, { fieldName: 'body', searchable: true, store: false }]
        };
    }

    function filterMatches(matches, epubTitle) {

        return matches.map(function (match) {

            if (epubTitle === '*') {
                // if epubTitle undefined return all matches
                return match[0];
            } else {
                var titles = match[1].map(function (id) {
                    // id = spineitemid:epubtitle
                    return id.split(':')[1];
                });
                return _lodash2.default.include(titles, epubTitle) ? match[0] : '';
            }
        }).filter(Boolean); // filter ["", "", ""] -> []
    }

    return searchIndex(options).then(function (si) {
        SearchEngine.si = si;
        SearchEngine._search = _q2.default.nbind(si.search, si);
        SearchEngine._close = _q2.default.nbind(si.close, si);
        SearchEngine._empty = _q2.default.nbind(si.empty, si);
        SearchEngine._match = _q2.default.nbind(si.match, si);
        SearchEngine._add = _q2.default.nbind(si.add, si);
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
 ], (err) => {
 if (! err) {
 const q = {};
 q.query = { AND: [{'*': ['text']}] };
 si.search(q, (err, results) => {
 console.log(results);
 })
 }
 })
 })
 1. Use nGramLength to activate phrase search

 2. Set stopwords to []. By default, search-index will remove common english words like 'some' and 'another', 
 so you need to empty your stopword list to allow them to
 be searchable (you could also remove them from the stopword list individually) */