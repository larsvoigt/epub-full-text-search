'use strict';

import rimraf from 'rimraf';
import constants from "../src/Constants";
import Q from 'q';

const rm = Q.denodeify(rimraf);
var initialized = false;

module.exports = function() {
    if(initialized) {
        return initialized;
    }
    initialized = Q.all([
        rm(constants.TEST_DB),
        rm(constants.INDEXING_CONTROLLER_DB)
    ]);
    return initialized;
};

