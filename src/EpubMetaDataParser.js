const async = require('async'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser(),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    readdir = Q.denodeify(fs.readdir),
    readFile = Q.denodeify(fs.readFile),
    parseString = Q.denodeify(parser.parseString),
    stat = Q.denodeify(fs.stat);

exports.getMetaDatas = function (pathToEpubs) {
    return getRootFiles(pathToEpubs)
        .then(function(containerFiles) {
            return Q.all(containerFiles.map(function(file) {
                return getBookMetaData(file);
            }));
        })
        .fail(function(err) {
            console.error(err);
        });
};

function getRootFiles(dir, results) {
    results = results || [];

    var container = 'container.xml';

    return readdir(dir)
        .then(function(files) {
            return Q.all(files.map(function(file) {
                file = dir + '/' + file;
                return stat(file)
                    .then(function(fileStat) {
                        if (fileStat && fileStat.isDirectory()) {
                            return getRootFiles(file, results);
                        } else if (path.basename(file) === container) {
                            results.push(file);
                        }
                    });
            }));
        })
        .then(function() {
            return results;
        })
        .fail(function(err) {
            console.error(err)
        });
};

var getBookMetaData = function (containerFile, callback) {

    var root = path.dirname(path.dirname(containerFile)),
        manifestPath;

    return getManifest(containerFile)
        .then(function(result) {
            var opfFile = root + '/' + result;
            manifestPath = path.dirname(root + '/' + result);

            return readFile(opfFile);
        })
        .then(function(opfContent) {
            return Q.all([
                getBookTitle(opfContent),
                getSpineItems(opfContent)
            ]);
        })
        .then(function(results) {
            return {
                manifestPath: manifestPath,
                title: results[0],
                spineItems: results[1]
            };
        })
        .fail(function(err) {
            console.error(err);
        });
}

function getManifest(containerFile) {

    return readFile(containerFile)
        .then(function (data) {
            return parseString(data);
        })
        .then(function (result) {
            return result.container.rootfiles[0].rootfile[0].$['full-path'];
        })
        .fail(function(err) {
            if (err && err.code === 'ENOENT') {
                throw new Error('File ' + containerFile + 'doesn\'t exist');
            }
        });
}


function getBookTitle(data) {
    return parseString(data)
        .then(function (result) {
            var metadata = result.package.metadata[0];
            return metadata['dc:title'][0]._ || metadata['dc:title'][0];
        })
        .fail(function(err) {
            console.error(err);
        });
}

function getSpineItems(data) {
    return parseString(data)
        .then(function (result) {
            var manifest = result.package.manifest[0];
            var spine = result.package.spine[0];

            var result = [];

            for (var i = 0; i < spine.itemref.length; i++) {

                var spineItem = manifest.item.filter(
                    function (value) {

                        if (value.$.id === spine.itemref[i].$.idref)
                            return value;
                    });


                var spineitem = {};
                spineitem.id = spineItem[0].$.id;
                spineitem.href = spineItem[0].$.href;
                spineitem.baseCfi = "/" + '6' + "/" + (i+1)*2 + '[' + spineitem.id +']!';

                result.push(spineitem);
            }

            return result;
        })
        .fail(function(err) {
            console.error(err);
        })
}
