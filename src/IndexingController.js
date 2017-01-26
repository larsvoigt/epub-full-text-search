const low = require('lowdb'),
    storage = require('lowdb/file-sync'),
    path = require('path'),
    constants = require("./Constants");

var _db;

function getDB(basePath) {
    if (!_db) {
        _db = low(path.join(basePath, constants.INDEXING_CONTROLLER_DB), {storage: storage})('epubs');
    }
    return _db;
}

module.exports = function () {

    var IndexingController = {};

    IndexingController.doWork = function (metaDataList, options) {

        const db = getDB(options.indexPath);

        metaDataList.forEach(function (metaData) {

            var query = {
                title: metaData.title,
                filename: metaData.filename
            };

            const exists = db.find(query);

            if (!exists) {
                db.push(query);
            }
            metaData.writeToIndex = !exists;
        });

        return metaDataList;
    };
    return IndexingController;
};

