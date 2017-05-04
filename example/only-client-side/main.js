import SearchEngine from '.././SearchEngine.js';
const epub = '../../test/epubs/accessible_epub_3/';

SearchEngine({'indexPath': 'test_search'})
    .then(function(se) {
        return se.indexing(epub);
    })
    .then(info => {
        console.log(info);
    })
    .fail(function(err) {
        console.error(err);
    });