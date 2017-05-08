import cheerio from 'cheerio';
import parser from './MetaDataParser';
import helper from './../Helper';
import winston from './../Logger';

const Preparer = {};

/**************
 * public
 *************/
Preparer.normalize = function (urlToEPUBs) {

    winston.log('info', 'URL of EPUB data: '.blue + urlToEPUBs.green);

    return parser.getMetaDataFromUrl(urlToEPUBs)
        .then(metaData => {

            return prepareEPUBDataForIndexing(metaData);

        }).catch(function (err) {
            winston.log('error', err);
        });
};

// It is necessary to remove hyphens from uuid because search-index process it wrong with hyphens.
// Otherwise search for uuid fails.
Preparer.normalizeUUID = function (str) {
    return str.replace(/-/g, '');
};


/**************
 * private
 *************/
function prepareEPUBDataForIndexing(metaData) {


    if (!metaData.spineItems.length)
        return;

    var data = [];

    const arrayOfPromises = metaData.spineItems.map(spineItem => {

        const spineUri = metaData.url + 'EPUB/' + spineItem.href;
        return helper.getContent(spineUri)
            .then(body => {

                return cheerio.load(body);
            })

    });

    return Promise.all(arrayOfPromises)
        .then((arrayOf$) => {

            //doc.spineItemPath = spineUri;
            arrayOf$.forEach(($, i) => {
                const doc = {};
                $("title").each((i, e) => {
                    const title = $(e);
                    doc.title = trim(title.text());
                });
                $("body").each((i, e) => {
                    const body = $(e);
                    doc.body = trim(body.text());
                });
                setMetaData(doc, metaData, metaData.spineItems[i]);
                data.push(doc);
            });
            return data;
        })
        .catch(err => {
            winston.log('error', err);
        });
}


function setMetaData(jsonDoc, meta, spineItemMeta) {

    jsonDoc.spineItemPath = meta.url + 'EPUB/' + spineItemMeta.href;

    jsonDoc.href = spineItemMeta.href;
    jsonDoc.baseCfi = spineItemMeta.baseCfi;
    jsonDoc.id = spineItemMeta.id + ':' + meta.title;
}


function trim(str) {
    return str.replace(/\W/g, ' ').replace(/\s+/g, ' ');
}


module.exports = Preparer;