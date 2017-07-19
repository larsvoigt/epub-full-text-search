'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _osHomedir = require('os-homedir');

var _osHomedir2 = _interopRequireDefault(_osHomedir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

var dataFolder = _path2.default.join((0, _osHomedir2.default)(), '.epub-full-text-search');
var pidFile = dataFolder + '/pidfile';

define('TEST_DB', 'mocha_test_DB');
define('HITS_AS_JSON', 'tests/specs/hits.json');
define('EPUB', 'node_modules/epub3-samples');
define('INDEXING_CONTROLLER_DB', 'IndexControllerDB.json');
define('DATA_FOLDER', dataFolder);
define('PID_FILE', pidFile);