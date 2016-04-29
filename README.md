
[travis-url]: https://travis-ci.org/larsvoigt/epub-full-text-search
[travis-image]: https://travis-ci.org/larsvoigt/epub-full-text-search.svg?branch=master
[npm-url]: https://npmjs.org/package/epub-full-text-search
[npm-version-image]: http://img.shields.io/npm/v/epub-full-text-search.svg?style=flat

[![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url] 

# EPUB-Search
## Search engine for EPUB3 documents 

EPUB-Search can be used to search in EPUB3-Documents.
 
You can make your whole cloud based epub3-book-collection content based searchable.

EPUB-Search uses [search-index](https://github.com/fergiemcdowall/search-index) 
to indexing the base content.

###Features included:

* Full text search (get all query matches for one epub-document or for a whole epub collection)  
* Instant search (provide suggestions)
* Full javascript
* Hits including [cfi](http://www.idpf.org/epub/linking/cfi/epub-cfi.html) references

## Installation

For CLI use

```
npm install epub-full-text-search -g
```

For library use

```
$ npm install epub-full-text-search --save
```

## Running as a Service 
CLI:
```
$ epub-search {start|stop|status|writeToIndex}
```

### Start Service

```
$ epub-search start
```

### Indexing
Let´s start to index some epub-documents: 

```
$ search-engine-CLI  -a <path> Path to epub folder which contains epub-documents that should be written to index
(Hint: the epub content have to be unzipped)
```

### Search 

Search at index for some query:

```
http://localhost:8080/search?q=...
```
### Suggestions

Offering search suggestions 

```
$  http://localhost:8080/matcher?beginsWith=...
```

#### Expample:

At first install epub-search globally: 

```
npm install epub-full-text-search -g
```

Add epubs to index:

```
epub-search writeToIndex -w /usr/lib/node_modules/epub-full-text-search/node_modules/epub3-samples
```

After that we can get some hits for the query ``epub``:

```
$ curl -XGET http://localhost:8080/search?q=epub
```

Or we can get some suggestions for autocomplete feature:

```
$  curl -XGET http://localhost:8080/matcher?beginsWith=epu
```

## For library use

```javascript
const epubfts = require('epub-full-text-search');
var options = {'indexPath': 'path_to_index-DB'}; // an own path can be set optional
epubfts(options || {}, function (err, se) {
    if (err)
        return console.log(err);
```
### Indexing 

write your **unzipped** EPUB3-Document to index

```javascript
se.indexing('your_epub(s)_directory', function (info) {
       console.log(info);
});
```   

### Searching 

```javascript
// search(query, epubTitle, result_callback)
se.search(["epub"], "Accessible EPUB 3", function (results) {
});
```  
### Search suggestions

```javascript
// match(beginsWith, epubTitle, result_callback)
se.match('matrix', 'A First Course in Linear Algebra', function (results) {
});
``` 
   

## Example

### Online Demo
[Demo](http://protected-dusk-3051.herokuapp.com/)

### Local testing 

Install all dependent modules: ``` npm install ```.

Start up the example ```npm run express-service```. It should run an express server on your local machine.

When navigating to [http://localhost:8080/](http://localhost:8080/) then you can see a test page where you can enter a search query.

Note: The indexing process starts automatically and it takes a few seconds until the search service is really available.    

