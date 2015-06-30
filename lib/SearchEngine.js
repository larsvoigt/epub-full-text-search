module.exports = function (options) {

    // * phrase search 
    // * html teaser with tagged match 

    //console.log("index path:  " + options.indexPath);
    var SearchIndex = require('search-index');
    var fs = require('fs');
    var cheerio = require('cheerio');
    var preparer = require('./Preparer.js');
    var path = require('path');
    //var cfiLib = require('/home/albert/workspace/readium-js-viewer/readium-js/epub-modules/epub-renderer/src/readium-shared-js/lib/epub_cfi.js');

    var indexDB = 'full-text-search-backend/fullTextSearchDB'; // path for index-db 
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

                        var elements = getElementsForQuery(q, result.hits[i].document.spineItemPath);

                        var cfiList = generateCFIs(result.hits[i].document.baseCfi, elements);
                        //GenerateCFIs(result.hits[i].document.baseCfi, elements);

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


    function generateCFIs(cfiBase, elements) {

        var cfiList = [];

        for (i in elements) {

            var cfiParts = [];
            var child = elements[i].element;
            //console.log(child[0].name);
            var parent = child.parent();
            //console.log(child.parents().length);

            while (parent[0]) {

                var index = child.index();

                if (child.attr('id'))
                    cfiParts.unshift((index + 1) * 2 + '[' + child.attr('id') + ']');
                else
                    cfiParts.unshift((index + 1) * 2);
                child = parent;
                parent = child.parent();

                //if (parent[0])
                //    console.log(parent[0].name);

            }
            var startOffset = elements[i].range.startOffset;
            var endOffset = elements[i].range.endOffset;

            var cfi = cfiBase + '/' + cfiParts.join('/') + ',/1:' + startOffset + ',/1:' + endOffset;

            //TODO: fix cfi for ranges with paths to inline element -> text
            //console.log('-----------------------------------------------------');
            //console.log('cfi: ' + cfi + ' \ntext: ' + elements[i].element.text());

            cfiList.push(cfi);
        }
        return cfiList;
    }

    //function GenerateCFIs(cfiBase, elements) {
    //
    //    var cfiList = [];
    //
    //    for (i in elements) {
    //
    //        var cfiParts = [];
    //
    //        var startOffset = elements[i].range.startOffset;
    //        var endOffset = elements[i].range.endOffset;
    //        var element = elements[i].element[0];
    //
    //        var cfi = cfiLib.EPUBcfi.Generator.generateCompleteCFI(
    //            element,
    //            startOffset,
    //            element,
    //            endOffset,
    //            ["cfi-marker"],
    //            [],
    //            []
    //        );
    //
    //        console.log('-----------------------------------------------------');
    //        console.log('cfiLib: ' + cfi);
    //
    //        cfiList.push(cfi);
    //    }
    //    return cfiList;
    //}

    function getElementsForQuery(query, file) {

        var html = fs.readFileSync(file);
        var $ = cheerio.load(html);

        var matches = [];
        $("*").each(function () {
            if ($(this).children().length < 1 && $(this).text().toLowerCase().indexOf(query[0]) > -1) {

                var startOffset = $(this).text().toLowerCase().indexOf(query[0]);
                var endOffset = startOffset + query[0].length;
                matches.push({element: $(this), range: {startOffset: startOffset, endOffset: endOffset}});
                //console.log($(this).text().toLowerCase().indexOf(query[0]));
            }
        });
        return matches;
    }

};