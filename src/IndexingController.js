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

            var title = metaData.title;

            const exists = db().find({title: title});

            if (!exists) {
                db().push({title: title})
            }
            metaData.writeToIndex = !exists;
        });
        
        return metaDataList;
    };
    return IndexingController;
};

