'use strict';

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readdir = _q2.default.denodeify(_fs2.default.readdir),
    readFile = _q2.default.denodeify(_fs2.default.readFile),
    stat = _q2.default.denodeify(_fs2.default.stat),
    parser = new _xml2js2.default.Parser(),
    parseString = _q2.default.denodeify(parser.parseString);

exports.getMetaDatas = function (pathToEpubs) {
    return getRootFiles(pathToEpubs).then(function (containerFiles) {
        return _q2.default.all(containerFiles.map(function (file) {
            return getBookMetaData(file);
        }));
    }).fail(function (err) {
        console.error(err);
    });
};

function getRootFiles(dir, results) {

    results = results || [];

    var container = 'container.xml';

    return readdir(dir).then(function (files) {
        return _q2.default.all(files.map(function (file) {
            file = dir + '/' + file;
            return stat(file).then(function (fileStat) {
                if (fileStat && fileStat.isDirectory()) {
                    return getRootFiles(file, results);
                } else if (_path2.default.basename(file) === container) {
                    results.push(file);
                }
            });
        }));
    }).then(function () {
        return results;
    }).fail(function (err) {
        console.error(err);
    });
}

var getBookMetaData = function getBookMetaData(containerFile) {

    var root = _path2.default.dirname(_path2.default.dirname(containerFile));
    var manifestPath;

    return getManifest(containerFile).then(function (result) {
        var opfFile = root + '/' + result;
        manifestPath = _path2.default.dirname(root + '/' + result);

        return readFile(opfFile);
    }).then(function (opfContent) {
        return _q2.default.all([getBookTitle(opfContent), getSpineItems(opfContent)]);
    }).then(function (results) {
        return {
            filename: _path2.default.basename(root),
            manifestPath: manifestPath,
            title: results[0],
            spineItems: results[1]
        };
    }).fail(function (err) {
        console.error(err);
    });
};

function getManifest(containerFile) {

    return readFile(containerFile).then(function (data) {
        return parseString(data);
    }).then(function (result) {
        return result.container.rootfiles[0].rootfile[0].$['full-path'];
    }).fail(function (err) {
        if (err && err.code === 'ENOENT') {
            throw new Error('File ' + containerFile + 'doesn\'t exist');
        }
    });
}

function getBookTitle(data) {
    return parseString(data).then(function (result) {
        var metadata = result.package.metadata[0];
        return metadata['dc:title'][0]._ || metadata['dc:title'][0];
    }).fail(function (err) {
        console.error(err);
    });
}

function getSpineItems(data) {

    return parseString(data).then(function (r) {

        var manifest = r.package.manifest[0];
        var spine = r.package.spine[0];

        var result = [];

        for (var i = 0; i < spine.itemref.length; i++) {

            var spineItem = manifest.item.filter(function (value) {

                if (value.$.id === spine.itemref[i].$.idref) return value;
            });

            var spineitem = {};
            spineitem.id = spineItem[0].$.id;
            spineitem.href = spineItem[0].$.href;
            spineitem.baseCfi = "/" + '6' + "/" + (i + 1) * 2 + '[' + spineitem.id + ']!';

            result.push(spineitem);
        }

        return result;
    }).fail(function (err) {
        console.error(err);
    });
}