var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var parser = require('./Parser.js');

exports.normalize = function (pathToEpubs, callBack) {

    console.log('epub data folder: ' + pathToEpubs);

    parser.getMetaDatas(pathToEpubs, function (metaDataList) {

            //console.log(metaDataList);
            console.log("------------------------------------------------------");
                         
            console.log("epub title found:");
            var dataSet = new Array();
            for (metaData in metaDataList) {

                for (var i = 0; i < metaDataList[metaData].spineItems.length; i++) {

                    if (i === 0) {
                        if (!dataSet.FirstSpineItemsId)
                            dataSet.FirstSpineItemsId = new Array();
                        dataSet.FirstSpineItemsId.push(metaDataList[metaData].spineItems[i].id);

                        console.log("-->  " + metaDataList[metaData].title);
                    }

                    var spineItem = metaDataList[metaData].manifestPath + '/' + metaDataList[metaData].spineItems[i].href;
                    //console.log('transform file ' + file + ' to index format **** basecfi: ' +  metaDataList[metaData].spineItems[i].baseCfi);

                    var json = htmlToJSON(spineItem);

                    setMetaData(json, metaDataList[metaData], metaDataList[metaData].spineItems[i]);

                    dataSet.push(json);
                    //console.log(json);
                }
            }

            //console.log(dataSet);
            console.log("------------------------------------------------------");
            callBack(dataSet);
        }
    )
};

function setMetaData(jsonDoc, meta, spineItemMeta) {

    jsonDoc.epubTitle = meta.title;
    jsonDoc.spineItemPath = meta.manifestPath + '/' + spineItemMeta.href;
    jsonDoc.href = spineItemMeta.href;
    jsonDoc.baseCfi = spineItemMeta.baseCfi;
    jsonDoc.id = spineItemMeta.id;
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


function writeAsJSONFile(doc, docdir, fileName) {
    fs.writeFileSync(docdir + fileName + ".json", JSON.stringify(doc), 'utf8');
}