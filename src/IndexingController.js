const low = require('lowdb'),
      storage = require('lowdb/file-sync'),
      constants = require("./Constants");

var _db;

function db() {
    if(!_db) {
        _db = low(constants.INDEXING_CONTROLLER_DB, {storage: storage})('epubs');
    }
    return _db;
}

module.exports = function () {
    
    var IndexingController = {};

    IndexingController.doWork = function (metaDataList) {

        metaDataList.forEach(function(metaData) {

            var query = {
                title: metaData.title,
                filename: metaData.filename
            };

            const exists = db().find(query);

            if (!exists) {
                db().push(query);
            }
            metaData.writeToIndex = !exists;
        });
        
        return metaDataList;
    };
    return IndexingController;
};

