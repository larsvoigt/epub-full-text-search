import xml2js from 'xml2js';
import path from 'path';
import fs from 'fs';
import Q from 'q';


const
    readdir = Q.denodeify(fs.readdir),
    readFile = Q.denodeify(fs.readFile),
    stat = Q.denodeify(fs.stat),
    parser = new xml2js.Parser(),
    parseString = Q.denodeify(parser.parseString);

exports.getMetaDatas = function (pathToEpubs) {
    return getRootFiles(pathToEpubs)
        .then((containerFiles) => {
            return Q.all(containerFiles.map((file) => {
                return getBookMetaData(file);
            }));
        })
        .fail((err) => {
            console.error(err);
        });
};

function getRootFiles(dir, results) {

    results = results || [];

    const container = 'container.xml';

    return readdir(dir)
        .then((files) => {
            return Q.all(files.map((file) => {
                file = dir + '/' + file;
                return stat(file)
                    .then((fileStat) => {
                        if (fileStat && fileStat.isDirectory()) {
                            return getRootFiles(file, results);
                        } else if (path.basename(file) === container) {
                            results.push(file);
                        }
                    });
            }));
        })
        .then(() => {
            return results;
        })
        .fail((err) => {
            console.error(err)
        });
}

const getBookMetaData = function (containerFile) {

    const root = path.dirname(path.dirname(containerFile));
    var manifestPath;

    return getManifest(containerFile)
        .then((result) => {
            const opfFile = root + '/' + result;
            manifestPath = path.dirname(root + '/' + result);

            return readFile(opfFile);
        })
        .then((opfContent) => {
            return Q.all([
                getBookTitle(opfContent),
                getSpineItems(opfContent)
            ]);
        })
        .then((results) => {
            return {
                filename: path.basename(root),
                manifestPath: manifestPath,
                title: results[0],
                spineItems: results[1]
            };
        })
        .fail((err) => {
            console.error(err);
        });
};

function getManifest(containerFile) {

    return readFile(containerFile)
        .then((data) => {
            return parseString(data);
        })
        .then((result) => {
            return result.container.rootfiles[0].rootfile[0].$['full-path'];
        })
        .fail((err) => {
            if (err && err.code === 'ENOENT') {
                throw new Error('File ' + containerFile + 'doesn\'t exist');
            }
        });
}


function getBookTitle(data) {
    return parseString(data)
        .then((result) => {
            const metadata = result.package.metadata[0];
            return metadata['dc:title'][0]._ || metadata['dc:title'][0];
        })
        .fail((err) => {
            console.error(err);
        });
}

function getSpineItems(data) {
    
    return parseString(data).then((r) => {
        
        const manifest = r.package.manifest[0];
        const spine = r.package.spine[0];

        const result = [];

        for (var i = 0; i < spine.itemref.length; i++) {

            const spineItem = manifest.item.filter((value) => {

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
        .fail((err) => {
            console.error(err);
        })
}
