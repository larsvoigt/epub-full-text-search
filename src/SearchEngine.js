'use strict';
// TODOs:
// [ ] separate api feature in own modules
// [X] logging
// [X] rest api del
// [ ] possibility to choose other backend search engines -> interface

const DEFAULT_EPUB_TITLE = '*';

import searchIndexSource from 'search-index';
import Q  from 'q';
import _ from 'lodash';
import validUrl from 'valid-url';
import winston from './Logger';

import normalize from './Normalize';
import cfi from './CFI.js';
import constants from "./Constants";

const searchIndex = Q.denodeify(searchIndexSource);

module.exports = function (options) {

    const SearchEngine = {};

    const defaultOption = {'indexPath': constants.DATA_FOLDER};
    options = _.isEmpty(options) ? defaultOption : options;

    SearchEngine.indexing = function (EPUBLocation, uuid) {

        winston.log('info', "******************************************************");
        winston.log('info', "Start normalize EPUB content".yellow);

        if (validUrl.isUri(EPUBLocation)) {

            //TODO: fix url if '/' lost at the end of uri
            winston.log('info', 'Indexing URI'.blue);
            uuid = normalize.normalizeUUID(uuid);
            return normalize.url(EPUBLocation, dataSet => {
                dataSet.map(doc => {
                    doc.id = doc.id.split(':')[0] + ':' + uuid;
                    doc.uuid = uuid;
                });
                winston.log('info', "Ready with normalize EPUB".yellow);
                winston.log('info', "Start normalize EPUB.".yellow);
                // var fs = require('fs');
                // fs.writeFileSync('/tmp/fs.tmp', JSON.stringify(dataSet));

                return SearchEngine.add(dataSet);
            })
        } else {
            winston.log('info', 'Indexing local path'.blue);
            return normalize.local(EPUBLocation, options, dataSet => {

                winston.log('info', "Ready with normalize EPUB".yellow);

                if (dataSet.length > 0) {
                    winston.log('info', "Start normalize EPUB-data.".yellow);
                    return SearchEngine.add(dataSet);
                } else {
                    winston.log('info', "DONE! Nothing to do, EPUBs already indexed.".yellow);
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

        const q = {query: {AND: {'uuid': [normalize.normalizeUUID(id)]}}};

        return SearchEngine._search(q)
            .then(result => {

                if (!result.hits) {
                    return q.reject('No hits!');
                }
                return SearchEngine._del(result.hits);
            })
            .catch(err => {
                winston.log('error', err);
                return Q.reject(err);
            });
    };

    SearchEngine.get = function (id) {

        const q = {query: {AND: {'uuid': [normalize.normalizeUUID(id)]}}};

        return SearchEngine._search(q)
            .then(result => {

                if (!result.hits) {
                    return q.reject('No hits!');
                }
                return result.hits;
            })
            .catch(err => {
                winston.log('error', err);
                return Q.reject(err);
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

        // Attention AND property have to be an array!!!
        if (uuid && uuid.length > 0)
            q.query.AND.uuid = [normalize.normalizeUUID(uuid)];
        else
            q.query.AND.epubTitle = [normalize.normalizeEpupTitle(title)];

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
                        winston.log('error', err);
                    });
            }).catch(err => {
                winston.log('error', err);
            });
    };

    SearchEngine.match = function (beginsWith, EPUBTitle, uuid) {

        if (!_.isString(EPUBTitle) && !_.isNull(EPUBTitle))
            winston.log('error', 'EPUBTitle should be null or type string');

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
                {fieldName: 'uuid', searchable: false, store: true}
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
 winston.log('info', results);
 })
 }
 })
 })
 1. Use nGramLength to activate phrase search

 2. Set stopwords to []. By default, search-index will remove common english words like 'some' and 'another', 
 so you need to empty your stopword list to allow them to
 be searchable (you could also remove them from the stopword list individually) */