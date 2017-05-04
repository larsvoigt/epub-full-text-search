import path from 'path';
import osHomedir from 'os-homedir';

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

const dataFolder = path.join(osHomedir(), '.epub-full-text-search');

define('TEST_DB', 'mocha_test_DB');
define('HITS_AS_JSON', 'tests/specs/hits.json');
define('EPUB' , 'node_modules/epub3-samples');
define('INDEXING_CONTROLLER_DB', 'IndexControllerDB.json');
define('DATA_FOLDER', dataFolder);
