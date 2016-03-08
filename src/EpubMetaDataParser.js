var async = require('async');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var path = require('path');
var fs = require('fs');

exports.getMetaDatas = function (pathToEpubs, callBack) {

    var rootFiles = getRootFiles(pathToEpubs);
    
    
    //console.log('found ' + docs.length + ' docs that can be indexed');

    async.concat(rootFiles, function (file, callback) {

        // Is it possible to use async.waterfall() in getBookMetaData() for her callback chain???
        getBookMetaData(file, function (meta) {
            callback(null, meta);
        })
    }, function (err, dataSets) {
        //if (err)
        //    console.log(err);
        callBack(dataSets);

    });
};

function getRootFiles(dir) {

    var container = 'container.xml';
    var results = [];

    fs.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getRootFiles(file))
        } else {
            if (path.basename(file) === container)
                results.push(file);
        }

    });
    return results;
};

var getBookMetaData = function (containerFile, callback) {

    var meta = {};
    var root = path.dirname(path.dirname(containerFile));

    getManifest(containerFile, function (result) {

        var opfFile = root + '/' + result;
        meta.manifestPath = path.dirname(opfFile);

        getBookTitle(opfFile, function (result) {
            meta.title = result;

            getSpineItems(opfFile, function (result) {
                meta.spineItems = result;
                //console.log(meta);
                callback(meta);
            });
        });
    });
}

function getManifest(containerFile, callback) {

    fs.readFile(containerFile, function (err, data) {

        if (err && err.code === 'ENOENT') {
            throw new Error('File ' + containerFile + 'doesn\'t exist');
        }

        parser.parseString(data, function (err, result) {

            callback(result.container.rootfiles[0].rootfile[0].$['full-path']);

        });
    });
}


function getBookTitle(opf, callback) {

    fs.readFile(opf, function (err, data) {
        parser.parseString(data, function (err, result) {

            var metadata = result.package.metadata[0];
            callback(metadata['dc:title'][0]._ || metadata['dc:title'][0]);
        });
    });
}

function getSpineItems(opf, callback) {

    fs.readFile(opf, function (err, data) {
        parser.parseString(data, function (err, result) {

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

            callback(result);
        });
    });
}
