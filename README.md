
[travis-url]: https://travis-ci.org/larsvoigt/epub-full-text-search
[travis-image]: https://travis-ci.org/larsvoigt/epub-full-text-search.svg?branch=master
[npm-url]: https://npmjs.org/package/epub-full-text-search
[npm-version-image]: http://img.shields.io/npm/v/epub-full-text-search.svg?style=flat

[![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url] 

# EPUB-Search
## Search engine for EPUB3 documents 

This node module is a search engine for EPUB3 documents. It 
provides full-text searching on EPUB3 content.
It is built on top of  [search-index](https://github.com/fergiemcdowall/search-index).

###Features include:

* Full text search 
* Instant search (provide suggestions)
* Full javascript
* Hits including [cfi](http://www.idpf.org/epub/linking/cfi/epub-cfi.html) references

## Usage
### Create a new search engine object 
```javascript
var se = new SearchEngine();
``` 
### Indexing 

run this function to index your **unzipped** EPUB3 content
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

## Installation

## Example 
Install all dependent modules: ``` npm install ```.

Start up the example ```npm run express-service```. It should run an express server on your local machine.

When navigating to [http://localhost:8080/](http://localhost:8080/) then you can see a test page where you can enter a search query.

Note: The indexing process starts automatically and it takes a few seconds until the search service is really available.    

