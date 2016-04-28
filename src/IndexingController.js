const low = require('lowdb'),
      storage = require('lowdb/file-sync'),
      constants = require("./Constants");

const db = low(constants.INDEXING_CONTROLLER_DB, {storage: storage})

module.exports = function () {
    
    var IndexingController = {};

    IndexingController.doWork = function (metaDataList) {

        for (metaData in metaDataList) {

            var title = metaDataList[metaData].title;

            const exists = db('epubs').find({title: title});

            if (!exists) {
                
                db('epubs').push({title: title})
                metaDataList[metaData].addToIndex = true;
            }
            else
                metaDataList[metaData].addToIndex = false;
        };
        
        return metaDataList;
    };
    return IndexingController;
};

