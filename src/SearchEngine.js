'use strict';
// TODOs:
// [ ] separate api feature in own modules
// [ ] logging
// [ ] rest api del
const DEFAULT_EPUB_TITLE = '*';

import searchIndexSource from 'search-index';
import Q  from 'q';
import colors from 'colors';
import _ from 'lodash';
import validUrl from 'valid-url';

import indexing from './Normalize';
import cfi from './CFI.js';
import constants from "./Constants";

const searchIndex = Q.denodeify(searchIndexSource);

module.exports = function (options) {

    const SearchEngine = {};

    const defaultOption = {'indexPath': constants.DATA_FOLDER};
    options = _.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (EPUBLocation, uuid) {

        console.log("\n\n\n******************************************************\n");
        console.log("Start normalize EPUB content".yellow);

        if (validUrl.isUri(EPUBLocation)) {

            //TODO: fix url if '/' lost at the end of uri
            console.log('Indexing URI'.blue);
            return indexing.url(EPUBLocation, dataSet => {
                dataSet.map(doc => {
                    doc.id = doc.id.split(':')[0] + ':' + uuid;
                    doc.uuid = uuid;
                });
                console.log("Ready with normalize EPUB\n\n".yellow);
                console.log("Start indexing EPUB.".yellow);
                return SearchEngine.add(dataSet);
            })
        } else {
            console.log('Indexing local path'.blue);
            return indexing.local(EPUBLocation, options, dataSet => {

                console.log("Ready with normalize EPUB\n\n".yellow);

                if (dataSet.length > 0) {
                    console.log("Start indexing EPUB-data.".yellow);
                    return SearchEngine.add(dataSet);
                } else {
                    console.log("DONE! Nothing to do, EPUBs already indexed.\n\n".yellow);
                    return;
                }
            })
        }
    };

    SearchEngine.add = function (jsonDoc) {

        return SearchEngine._add(jsonDoc, getIndexOptions());
    };

    SearchEngine.del = function (id) {

        if (!id || id.length < 1)
            return Q.reject('Del function: Id have to be set!');

//TODO: Means get all docs, bad performance??? ATM no other choice.  Todo performance test with a lot of docs
        const q = {query: {AND: {'body': ['*']}}};

        return SearchEngine._search(q)
            .then(result => {

                if (!result.hits) {
                    return q.reject('No hits!');
                }

                const ids = [];
                result.hits.forEach(hit => {
                    if (hit.id.split(':')[1] === id)
                        ids.push(hit.id);
                });
                return SearchEngine._del(ids);
            })
            .catch(err => {
                return Q.reject(err);
                console.error(err);
            });
    };

    SearchEngine.get = function (id) {

        const q = {query: {AND: {'body': ['*']}}};

        return SearchEngine._search(q)
            .then(result => {

                if (!result.hits) {
                    return q.reject('No hits!');
                }

                const hits = [];
                result.hits.forEach(hit => {
                    if (hit.id.split(':')[1] === id)
                        hits.push(hit);
                });
                return hits;
            })
            .catch(err => {
                return Q.reject(err);
                console.error(err);
            });
    };

    SearchEngine.flush = function () {

        return SearchEngine._flush()
    };

    SearchEngine.search = function (searchFor, bookTitle, uuid) {

        const title = bookTitle || DEFAULT_EPUB_TITLE; // * if bookTitle undefined return all hits

        const q = {};
        q.searchFor = searchFor;
        q.query = {AND: {'body': [searchFor]}};

        if (uuid !== '-1')
            q.query.AND.epubTitle = [indexing.normalizeEpupTitle(title)];
        else
            q.query.AND.uuid = uuid;

        return SearchEngine.query(q);
    };

    SearchEngine.query = function (query) {

        return SearchEngine._search(query)
            .then(result => {
                const hits = [];

                if (!result.hits) {
                    return hits;
                }

                const cfis = result.hits.map(hit => {
                    const document = hit.document;
                    return cfi.generate({
                        "searchFor": query.searchFor,
                        "spineItemPath": document.spineItemPath,
                        "baseCfi": document.baseCfi
                    });
                });
                return Promise.all(cfis)
                    .then(cfis => {

                        cfis.forEach((cfiList, i) => {

                            const document = result.hits[i].document,
                                idData = document.id.split(':');
                            document.id = idData[0];
                            document.cfis = cfiList;
                            delete document['*'];
                            delete document.spineItemPath;

                            hits.push(document);
                        });
                        return hits;

                    })
                    .catch(err => {
                        console.error(err);
                    });
            }).catch(err => {
                console.error(err);
            });
    };

    SearchEngine.match = function (beginsWith, EPUBTitle, uuid) {

        if (!_.isString(EPUBTitle) && !_.isNull(EPUBTitle))
            console.error('EPUBTitle should be null or type string');

        if (beginsWith.length < 3) {//match string must be longer than threshold (3)

            const deferred = Q.defer();
            deferred.resolve([]);
            return deferred.promise;
        }

        const title = EPUBTitle || DEFAULT_EPUB_TITLE;

        return SearchEngine._match({beginsWith: beginsWith, type: 'ID'})
            .then(matches => {
                return filterMatches(matches, title, uuid);
            });
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
                {fieldName: 'body', searchable: true, store: false},
                {fieldName: 'uuid', searchable: true, store: true}
            ]
        };
    }

    function filterMatches(matches, EPUBTitle, uuid) {

        return matches
            .map(match => {

                if (uuid && uuid !== '-1') {
                    const titles = match[1].map(id => {
                        return id.split(':')[1];
                    });
                    return _.include(titles, uuid) ? match[0] : '';

                } else if (EPUBTitle === '*') {
                    // if EPUBTitle undefined return all matches
                    return match[0];

                } else {
                    const titles = match[1].map(id => {
                        // id = spineitemid:epubtitle
                        return id.split(':')[1];
                    });
                    return _.include(titles, EPUBTitle) ? match[0] : '';
                }
            })
            .filter(Boolean); // filter ["", "", ""] -> []
    }

    return searchIndex(options)
        .then(si => {
            SearchEngine.si = si;
            SearchEngine._search = Q.nbind(si.search, si);
            SearchEngine._close = Q.nbind(si.close, si);
            SearchEngine._match = Q.nbind(si.match, si);
            SearchEngine._add = Q.nbind(si.add, si);
            SearchEngine._del = Q.nbind(si.del, si);
            SearchEngine._get = Q.nbind(si.get, si);
            SearchEngine._flush = Q.nbind(si.flush, si);
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
 ], err => {
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