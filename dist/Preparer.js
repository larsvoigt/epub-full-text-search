'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _EpubMetaDataParser = require('./EpubMetaDataParser');

var _EpubMetaDataParser2 = _interopRequireDefault(_EpubMetaDataParser);

var _IndexingController = require('./IndexingController');

var _IndexingController2 = _interopRequireDefault(_IndexingController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var indexingController = (0, _IndexingController2.default)();

var Preparer = {};

/**************
 * public
 *************/
Preparer.normalize = function (pathToEpubs, options) {

    console.log('epub data folder: '.red + pathToEpubs.green + '\n\n');

    return _EpubMetaDataParser2.default.getMetaDatas(pathToEpubs).then(function (metaDataList) {

        console.log('Analyse folder:'.yellow + '\n');

        metaDataList = indexingController.doWork(metaDataList, options);

        var dataSet = [];

        metaDataList.forEach(function (metaData) {
            //console.log(metaDataList[metaData].title + "   " + metaDataList[metaData].writeToIndex);
            var title = metaData.title;

            if (metaData.writeToIndex) {
                console.log("\t--> epub title " + title.bold.blue + ' will be added to index');

                prepareEpubDataForIndexing(metaData, dataSet);
            } else {
                console.log("\t--> epub title " + title.green + ' already indexed');
            }
        });
        return dataSet;
    });
};

Preparer.normalizeEpupTitle = function (str) {
    return str.replace(/\s/g, '').toLowerCase();
};

/**************
 * private
 *************/
function prepareEpubDataForIndexing(metaData, data) {
    if (!metaData.spineItems.length) {
        return;
    }

    if (!data.FirstSpineItemsId) {
        data.FirstSpineItemsId = [];
    }

    data.FirstSpineItemsId.push(metaData.spineItems[0].id + ':' + metaData.title);

    metaData.spineItems.forEach(function (spineItem) {
        var spineItemPath = metaData.manifestPath + '/' + spineItem.href;
        var json = htmlToJSON(spineItemPath);
        setMetaData(json, metaData, spineItem);
        data.push(json);
    });
}

function setMetaData(jsonDoc, meta, spineItemMeta) {
    jsonDoc.filename = meta.filename;
    jsonDoc.epubTitle = Preparer.normalizeEpupTitle(meta.title);
    jsonDoc.spineItemPath = meta.manifestPath + '/' + spineItemMeta.href;
    jsonDoc.href = spineItemMeta.href;
    jsonDoc.baseCfi = spineItemMeta.baseCfi;
    jsonDoc.id = spineItemMeta.id + ':' + meta.title;
}

function htmlToJSON(file) {

    var doc = {};

    try {
        var html = _fs2.default.readFileSync(file);

        var $ = _cheerio2.default.load(html);

        $("title").each(function (i, e) {
            var title = $(e);
            doc.title = trim(title.text());
        });
        $("body").each(function (i, e) {
            var body = $(e);
            doc.body = trim(body.text());
        });
    } catch (err) {
        console.error(err);
    }

    return doc;
}

function trim(str) {
    return str.replace(/\W/g, ' ').replace(/\s+/g, ' ');
}

module.exports = Preparer;