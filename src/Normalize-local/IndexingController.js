import low from 'lowdb';
import storage from 'lowdb/file-sync';
import path from 'path';
import constants from "../Constants";

var _db;

function getDB(basePath) {
    if (!_db) {
        _db = low(path.join(basePath, constants.INDEXING_CONTROLLER_DB), {storage: storage})('epubs');
    }
    return _db;
}

module.exports = function ()  {

    const IndexingController = {};

    IndexingController.doWork = function (metaDataList, options)  {

        const db = getDB(options.indexPath);

        metaDataList.forEach( metaData => {

            const query = {
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

