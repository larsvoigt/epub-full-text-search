function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define('TEST_DB', 'mocha_test_DB');
define('HITS_AS_JSON', 'tests/specs/hits.json');
define('EPUB' , 'node_modules/epub3-samples');
define('INDEXING_CONTROLLER_DB', 'IndexControllerDB.json')