var SearchEngine = require('.././SearchEngine.js');
var epub = '../../test/epubs/accessible_epub_3/';

var se = new SearchEngine({'indexPath': 'test_search'});
se.indexing(epub, function () {
    console.log(info);
});