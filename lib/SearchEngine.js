// * phrase search 
// * html teaser with tagged match

module.exports = function (options) {

    var SearchIndex = require('search-index');
    var path = require('path');
    var fs = require('extfs');

    var preparer = require('./Preparer.js');
    var cfi = require('./CFI.js');

    var indexDB = 'indexDB'; // path to index-db 
    var defaultOption = {'indexPath': indexDB, logLevel: 'warn'};
    options = options || defaultOption;

    var si = new SearchIndex(options);
    var that = this;

    this.indexing = function (pathToEpubs, callback) {

        if (fs.isEmptySync(pathToEpubs))
            return callback(new Error('Can`t index empty folder: ' + pathToEpubs));

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
            //callback('all is indexed');
        });
    };

    this.add = function (jsonDoc, callback) {
        
        //console.debug(si.indexes);
        //si.get(jsonDoc.epubTitle, function (err, doc) {
        // // update doc with latest version ???
        //});
        var opt = getIndexOptions();
        si.add(opt, jsonDoc, callback);
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

    this.close = function (callback) {
        si.close(callback);
    };
    
    function getIndexOptions() {
        
        var options = {};
        options.filters = [];
        options.fieldsToStore = ['id', 'spineItemPath', 'href', 'baseCfi', 'epubTitle'];
        options.fieldOptions = [
            {fieldName: 'title', fieldedSearch: true},
            {fieldName: 'body', fieldedSearch: true},
            {fieldName: 'epubTitle', fieldedSearch: false},
            {fieldName: 'spineItemPath', fieldedSearch: false},
            {fieldName: 'href', fieldedSearch: false},
            {fieldName: 'baseCfi', fieldedSearch: false},
            {fieldName: 'id', fieldedSearch: false}
        ];
        return options;
    }
};