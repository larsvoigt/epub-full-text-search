
[travis-url]: https://travis-ci.org/larsvoigt/epub-full-text-search
[travis-image]: https://travis-ci.org/larsvoigt/epub-full-text-search.svg?branch=master
[npm-url]: https://npmjs.org/package/epub-full-text-search
[npm-version-image]: http://img.shields.io/npm/v/epub-full-text-search.svg?style=flat
# EPUB-Search [![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url] 
## Search engine for digital publication based on EPUB 3

Welcome! EPUB-Search makes your digital publications searchable.

What is the use case:
* Server-side microservice to search for browser-based “cloud” readers within EPUBs
* For EPUBs that lives online
* To search within your local EPUB-stock


### Online Demo
[Demo](http://protected-dusk-3051.herokuapp.com/)

### Features included:

* Full text search (get all query matches for one epub-document or for a whole epub collection)  
* Autocomplete
* Full javascript
* Hits including [cfi](http://www.idpf.org/epub/linking/cfi/epub-cfi.html) references
* Response results in JSON format
* Pre-indexing
* Indexing on-the-fly


## Installation

For CLI use

```
[sudo] npm install epub-full-text-search -g
```

For library use

```
$ npm install epub-full-text-search --save
```

## Running as a Service 

**CLI**

```
$ epub-search 

Welcome to Epub search service

Usage: epub-search [action] [options]

Actions:
        start           Start the service
        stop            Stop the service
        logs            Show logs
        writeToIndex    Epub-book(s) which should be written to index.(Hint: the epub content have to be unzipped)

Options:
        -p      Path to epub folder which contains epub-book(s).

```

### Start Service

```
$ [sudo] epub-search start
```

### Modus operandi

EPUB search provides two *modus operandi*:
* The first one is **Indexing On-the-fly**. This means the ebook will be indexed in the background when it gets opened. 
The assumption for this *mode* is the EPUB3-book which is remote available. 
The generated search-index will be deleted if the ebook is closed.     
 
* The second one is **Pre-Indexing**. This means all ebooks on the local machine can be indexed 
and the generated search index will be persistent available during all reading sessions. So it possible the search terms within all indexed
ebooks. 


#### Indexing On-the-fly

#####Indexing

``` 
http://localhost:8085/addToIndex?url=${epub}/&uuid=${uuid}

```

##### Search
```
http://localhost:8085/search?q=${term}&uuid=${uuid}
```

##### Delete index
```
http://localhost:8085/deleteFromIndex?&uuid=${uuid}
```


#### Pre-Indexing

##### Indexing

Let´s start to index some EPUBs: 

```
$ epub-search writeToIndex -p  <path>
```

##### Search 

Search for term:

<pre>
http://localhost:8085/search?q=<i>${term}</i>&t=<i>${EPUB-title}</i>;
</pre>

##### Suggestions for Autocomplete 

<pre>
$  http://localhost:8085/matcher?beginsWith=<i>beginning-of-the-text-to-match</i>
</pre>

### Examples:

#### Indexing On-the-fly

TODO

#### Pre-indexing
At first, please install epub-search globally: 

```
[sudo] npm install epub-full-text-search -g
```

Start service: 

```
$ [sudo] epub-search start
```

Add sample epubs to index:

```
epub-search writeToIndex -p {prefix}/node_modules/epub-full-text-search/node_modules/epub3-samples
```

Now we should get some hits for the term ``epub``:

<sub>For requests you can use *$ curl -XGET "http://localhost:8085/search?q=math"* or the *browser*...</sub>

Search within the whole ebook-collection:

```
http://localhost:8085/search?q=math
```

Set the filter for the book-title ```t="..."``` to search only within a specific ebook:

```
http://localhost:8085/search?q=epub&t=Accessible+EPUB+3
```

Or we can get some suggestions for an autocomplete:

```
http://localhost:8085/matcher?beginsWith=epu
```

### For library use
TODO

<!--
```javascript
import epubSearch from 'epub-full-text-search';
const options = {'indexPath': 'path_to_index-DB'}; // an own path can be set optional
epubSearch(options || {})
    .then(searchInstance => {
        
        // INDEXING (write your **unzipped** EPUB3-Document to index)
        searchInstance.indexing('your_epub(s)_directory')
            .then(info => {
               winston.log('info', info);
            })
            .fail(function(err) {
                winston.log('error', err);
            });
       
        // SEARCHING
        // search(query, epubTitle)
        searchInstance.search('epub', "Accessible EPUB 3")
            .then(results => {
                winston.log('info', results);
            })
            .fail(function(err) {
                winston.log('error', err);
            });
            
        // COMPLEX SEARCHING
        // query(query, epubTitle)
        const search = 'epub';
        searchInstance.query({
            query: [
                {
                    AND: [
                        {'*': [search]},
                        {filename: ['accessible_epub_3']}
                    ]
                }
            ]
        }, search)
            .then(results => {
                winston.log('info', results);
            })
            .fail(function(err) {
                winston.log('error', err);
            });
     
        // SEARCH SUGGESTIONS
        // match(beginsWith, epubTitle)
        searchInstance.match('matrix', 'A First Course in Linear Algebra')
            .then(results => {
                winston.log('info', results);
            })
            .fail(function(err) {
                winston.log('error', err);
            });
    })
    .fail(function(err) {
        winston.log('error', err);
    });

``` 
   
-->

### Local testing 

Install all dependent modules: ``` npm install ```.

Start up the demo ```npm run start```. It should run an express server on your local machine.

When you are navigating to [http://localhost:8085/](http://localhost:8085/) you can see the demo?.

Note: The pre-indexing process starts automatically and it takes a few seconds until the pre-indexing search is available.    

### Technical Details

EPUB-Search uses [search-index](https://github.com/fergiemcdowall/search-index) 
to indexing book content.

### Contributing

Very welcome ... :-)  
