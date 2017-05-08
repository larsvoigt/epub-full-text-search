'use strict';
import preparerLocal from './Normalize-local/Preparer.js';
import preparerUrl from './Normalize-URL/Preparer.js';
import fs from 'extfs';
import path from 'path';
import Q  from 'q';
import colors from 'colors';

const Normalize = {};
// TODO: Interface in JS ???
Normalize.local = function(pathToEPUBs, options, callback) {

    if (fs.isEmptySync(pathToEPUBs)) {
        return Q.reject(new Error('Can`t index empty local: ' + pathToEPUBs));
    }
    // normalize the directory path
    pathToEPUBs = path.normalize(pathToEPUBs);
    return preparerLocal.normalize(pathToEPUBs, options)
        .then(dataSet => { return callback(dataSet); });
};


Normalize.url = function(urlToEpub, callback) {
    return preparerUrl.normalize(urlToEpub)
        .then(dataSet => { return callback(dataSet); });
};



Normalize.normalizeEpupTitle = function(title) {

    return preparerLocal.normalizeEpupTitle(title);
};

Normalize.normalizeUUID = function (uuid) {

    return preparerUrl.normalizeUUID(uuid);
};

module.exports = Normalize;