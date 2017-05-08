import xml2js from 'xml2js';
import Q from 'q';
import helper from './../Helper';


const parser = new xml2js.Parser(),
    parseString = Q.denodeify(parser.parseString);

const MetaDataParser = {};
const container = 'container.xml';

MetaDataParser.getMetaDataFromUrl = function (urlToEpub) {

    const containerLink = urlToEpub + 'META-INF/' + container;

    return new Promise(function (resolve, reject) {

        helper.getContent(containerLink)
            .then(xmlString => {
                return getManifest(xmlString);
            })
            .then(result => {
                const opfFile = urlToEpub + result;
                return helper.getContent(opfFile);
            })
            .then(opfContent => {
                return Q.all([
                    getBookTitle(opfContent),
                    getSpineItems(opfContent)
                ]);
            })
            .then(results => {
                resolve(
                    {
                        title: results[0],
                        spineItems: results[1],
                        url: urlToEpub
                    }
                );
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });

    })
};


function getManifest(data) {

    return parseString(data)
        .then(result => {
            return result.container.rootfiles[0].rootfile[0].$['full-path'];
        })
        .fail(err => {
            console.error(err);
        });
}


function getBookTitle(data) {
    return parseString(data)
        .then(result => {
            const metadata = result.package.metadata[0];
            return metadata['dc:title'][0]._ || metadata['dc:title'][0];
        })
        .fail(err => {
            console.error(err);
        });
}

function getSpineItems(data) {

    return parseString(data).then(r => {

        const manifest = r.package.manifest[0];
        const spine = r.package.spine[0];

        const result = [];

        for (var i = 0; i < spine.itemref.length; i++) {

            const spineItem = manifest.item.filter(value => {

                if (value.$.id === spine.itemref[i].$.idref)
                    return value;
            });


            const spineitem = {};
            spineitem.id = spineItem[0].$.id;
            spineitem.href = spineItem[0].$.href;
            spineitem.baseCfi = "/" + '6' + "/" + (i + 1) * 2 + '[' + spineitem.id + ']!';

            result.push(spineitem);
        }

        return result;
    })
        .fail(err => {
            console.error(err);
        })
}

module.exports = MetaDataParser;