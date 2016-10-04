'use strict';

var rimraf = require('rimraf'),
    constants = require("../src/Constants"),
    Q = require('q'),
    rm = Q.denodeify(rimraf),
    initialized = false;

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

