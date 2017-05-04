import cheerio from 'cheerio';
import parser from './MetaDataParser';
import rp from 'request-promise';

const Preparer = {};

/**************
 * public
 *************/
Preparer.normalize = function (urlToEPUBs) {

    console.log('URL to EPUB data: '.blue + urlToEPUBs.green + '\n\n');

    return parser.getMetaDataFromUrl(urlToEPUBs)
        .then(metaData => {

            return prepareEPUBDataForIndexing(metaData);

        }).catch(function (err) {
            console.error(err);
        });
};

Preparer.normalizeEpupTitle = function (str) {
    return str.replace(/\s/g, '').toLowerCase();
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
        const options = {
            uri: spineUri,
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        return rp(options);
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
            console.error(err);
        });
}


function setMetaData(jsonDoc, meta, spineItemMeta) {

    jsonDoc.spineItemPath = meta.url + 'EPUB/' + spineItemMeta.href;
    jsonDoc.epubTitle = Preparer.normalizeEpupTitle(meta.title);
    jsonDoc.href = spineItemMeta.href;
    jsonDoc.baseCfi = spineItemMeta.baseCfi;
    jsonDoc.id = spineItemMeta.id + ':' + meta.title;
}


function trim(str) {
    return str.replace(/\W/g, ' ').replace(/\s+/g, ' ');
}


module.exports = Preparer;