import fs from 'fs';
import cheerio from 'cheerio';
import parser from './EpubMetaDataParser';
import ic from  './IndexingController';
import winston from './../Logger';

const indexingController = ic();

const Preparer = {};

/**************
 * public
 *************/
Preparer.normalize = function (pathToEPUBs, options)  {

    winston.log('info', 'EPUB data local: '.blue + pathToEPUBs.green);

    return parser.getMetaData(pathToEPUBs)
        .then(metaDataList => {

            winston.log('info', 'Analyse local:'.yellow);
           
            metaDataList = indexingController.doWork(metaDataList, options);

            const dataSet = [];

            metaDataList.forEach(metaData => {
                //winston.log('info', metaDataList[metaData].title + "   " + metaDataList[metaData].writeToIndex);
                const title = metaData.title;

                if (metaData.writeToIndex) {
                    winston.log('info', "\t--> EPUB title " + title.bold.blue + ' will be added to index');

                    prepareEPUBDataForIndexing(metaData, dataSet);
                } else {
                    winston.log('info', "\t--> EPUB title " + title.green + ' already indexed');
                }
            });
            return dataSet;
        });
};

Preparer.normalizeEpupTitle = function (str)  {

    if(str === '*')
        return str;
    return str.replace(/\s/g,'').toLowerCase();
};

/**************
 * private
 *************/
function prepareEPUBDataForIndexing(metaData, data) {
    if(!metaData.spineItems.length) {
        return;
    }

    if (!data.FirstSpineItemsId) {
        data.FirstSpineItemsId = [];
    }

    data.FirstSpineItemsId.push(
        metaData.spineItems[0].id + ':' + metaData.title
    );

    metaData.spineItems.forEach( spineItem => {
        const spineItemPath = metaData.manifestPath + '/' + spineItem.href;
        const json = htmlToJSON(spineItemPath);
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

    const doc = {};

    try {
        const html = fs.readFileSync(file);

        const $ = cheerio.load(html);

        $("title").each((i, e) => {
            const title = $(e);
            doc.title = trim(title.text());
        });
        $("body").each((i, e)=> {
            const body = $(e);
            doc.body = trim(body.text());

        });

    } catch (err) {
        winston.log('error', err);
    }

    return doc;
}

function trim(str) {
    return str.replace(/\W/g, ' ').replace(/\s+/g, ' ');
}


module.exports = Preparer;