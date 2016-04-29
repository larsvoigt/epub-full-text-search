const fs = require('fs'),
    cheerio = require('cheerio'),
    parser = require('./EpubMetaDataParser'),
    indexingController = require('./IndexingController')();


exports.normalize = function (pathToEpubs, callBack) {

    process.stdout.write('epub data folder: '.red + pathToEpubs.green + '\n\n');

    parser.getMetaDatas(pathToEpubs, function (metaDataList) {

        //console.log(metaDataList);

        process.stdout.write('Analyse folder:'.yellow + '\n');

        metaDataList = indexingController.doWork(metaDataList);

        var dataSet = new Array();

        for (metaData in metaDataList) {

            //console.log(metaDataList[metaData].title + "   " + metaDataList[metaData].writeToIndex);
            var title = metaDataList[metaData].title;

            if (metaDataList[metaData].writeToIndex == true) {
                process.stdout.write("\t--> epub title " + title.bold.blue + ' will be added to index \n');

                prepareEpubDataForIndexing(metaDataList[metaData], dataSet);
            }
            else
                process.stdout.write("\t--> epub title " + title.green + ' already indexed \n');
        }
        callBack(dataSet);
    })
};


function prepareEpubDataForIndexing(metaData, data) {
    
    for (var i = 0; i < metaData.spineItems.length; i++) {

        if (i === 0) {

            if (!data.FirstSpineItemsId)
                data.FirstSpineItemsId = new Array();

            data.FirstSpineItemsId.push(
                metaData.spineItems[i].id + ':' + metaData.title
            );
        }
        
        var spineItem = metaData.manifestPath + '/' + metaData.spineItems[i].href;
        //console.log('transform file ' + file + ' to index format **** basecfi: ' +
        //  metaDataList[metaData].spineItems[i].baseCfi);

        var json = htmlToJSON(spineItem);

        setMetaData(json, metaData, metaData.spineItems[i]);

        data.push(json);
        //console.log(json);
    }
}


function setMetaData(jsonDoc, meta, spineItemMeta) {

    jsonDoc.epubTitle = meta.title;
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


function writeAsJSONFile(doc, docdir, fileName) {
    fs.writeFileSync(docdir + fileName + ".json", JSON.stringify(doc), 'utf8');
}