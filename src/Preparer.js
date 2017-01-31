const fs = require('fs'),
    cheerio = require('cheerio'),
    parser = require('./EpubMetaDataParser'),
    indexingController = require('./IndexingController')();


const Preparer = {};

/**************
 * public
 *************/
Preparer.normalize = function (pathToEpubs, options) {

    console.log('epub data folder: '.red + pathToEpubs.green + '\n\n');

    return parser.getMetaDatas(pathToEpubs)
        .then(function (metaDataList) {

            console.log('Analyse folder:'.yellow + '\n');
           
            metaDataList = indexingController.doWork(metaDataList, options);
            
            var dataSet = [];

            metaDataList.forEach(function(metaData) {
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
    return str.replace(/\s/g,'').toLowerCase();
};

/**************
 * private
 *************/
function prepareEpubDataForIndexing(metaData, data) {
    if(!metaData.spineItems.length) {
        return;
    }

    if (!data.FirstSpineItemsId) {
        data.FirstSpineItemsId = [];
    }

    data.FirstSpineItemsId.push(
        metaData.spineItems[0].id + ':' + metaData.title
    );

    metaData.spineItems.forEach(function(spineItem) {
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
        var html = fs.readFileSync(file);

        var $ = cheerio.load(html);

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