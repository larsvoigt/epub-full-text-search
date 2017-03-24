'use strict';

const DEFAULT_EPUB_TITLE = '*';

import searchIndexSource from 'search-index';
import Q  from 'q';
import colors from 'colors';
import fs from 'extfs';
import _ from 'lodash';
import preparer from './Preparer.js';
import cfi from './CFI.js';
import path from 'path';
import constants from "./Constants";

const searchIndex = Q.denodeify(searchIndexSource);

module.exports = function (options) {

    const SearchEngine = {};

    const defaultOption = {'indexPath': constants.DATA_FOLDER};
    options = _.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (pathToEpubs) {

        if (fs.isEmptySync(pathToEpubs)) {
            return Q.reject(new Error('Can`t index empty folder: ' + pathToEpubs));
        }
        console.log("\n\n\n******************************************************\n");
        console.log("Start normalize epub content\n\n".yellow);

        // normalize the directory path
        pathToEpubs = path.normalize(pathToEpubs);

        return preparer.normalize(pathToEpubs, options)
            .then((dataSet) => {
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

        const ids = jsonDoc.FirstSpineItemsId;
        delete jsonDoc.FirstSpineItemsId;

        return SearchEngine._add(jsonDoc, getIndexOptions());
    };

    SearchEngine.search = function (searchFor, bookTitle) {

       const title = bookTitle || DEFAULT_EPUB_TITLE; // * if bookTitle undefined return all hits

        const q = {};
        q.query =
            {
                AND: {
                    'epubTitle': [preparer.normalizeEpupTitle(title)],
                    'body': [searchFor]
                }
            };

        return SearchEngine.query(q, searchFor);
    };

    SearchEngine.query = function (query, searchFor) {

        return SearchEngine._search(query)
            .then((result) => {
                const hits = [];

                if (!result.hits) {
                    return hits;
                }

                result.hits.forEach((hit) => {
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

        if (beginsWith.length < 3) {//match string must be longer than threshold (3)

            const deferred = Q.defer();
            deferred.resolve([]);
            return deferred.promise;
        }

        const title = epubTitle || DEFAULT_EPUB_TITLE;

        return SearchEngine._match({beginsWith: beginsWith, type: 'ID'})
            .then((matches) => {
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
            .map((match) => {

                if (epubTitle === '*') {
                    // if epubTitle undefined return all matches
                    return match[0];
                } else {
                    const titles = match[1].map((id) => {
                        // id = spineitemid:epubtitle
                        return id.split(':')[1]
                    });
                    return _.include(titles, epubTitle) ? match[0] : '';
                }
            })
            .filter(Boolean); // filter ["", "", ""] -> []
    }

    return searchIndex(options)
        .then((si) => {
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