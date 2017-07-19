'use strict';

var _lowdb = require('lowdb');

var _lowdb2 = _interopRequireDefault(_lowdb);

var _fileSync = require('lowdb/file-sync');

var _fileSync2 = _interopRequireDefault(_fileSync);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _db;

function getDB(basePath) {
    if (!_db) {
        _db = (0, _lowdb2.default)(_path2.default.join(basePath, _Constants2.default.INDEXING_CONTROLLER_DB), { storage: _fileSync2.default })('epubs');
    }
    return _db;
}

module.exports = function () {

    var IndexingController = {};

    IndexingController.doWork = function (metaDataList, options) {

        var db = getDB(options.indexPath);

        metaDataList.forEach(function (metaData) {

            var query = {
                title: metaData.title,
                filename: metaData.filename
            };

            var exists = db.find(query);

            if (!exists) {
                db.push(query);
            }
            metaData.writeToIndex = !exists;
        });

        return metaDataList;
    };
    return IndexingController;
};