import low from 'lowdb';
import storage from 'lowdb/file-sync';
import path from 'path';
import constants from "../Constants";


module.exports = function () {

    const IndexingController = {};

    IndexingController.doWork = function (metaDataList, options) {

        const db  = low(path.join(options.indexPath, constants.INDEXING_CONTROLLER_DB), {storage: storage})('epubs');

        metaDataList.forEach(metaData => {

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

