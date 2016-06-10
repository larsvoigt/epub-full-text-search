var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var mathML = require('./MathML.js');
var teaser = require('./Teaser.js');
//var cfiLib = require('epub-cfi');
//var jsdom = require('jsdom').jsdom;


exports.generate = function (hits, epubTitle, query) {

    var hitSet = {};
    hitSet.version = 0.2;
    hitSet.spineItemIds = [];
    hitSet.hits = [];

    for (var key in hits) {

        var doc = hits[key].document;

        var title = doc.id.split(':')[1];

        hitSet.spineItemIds.push(doc.id.split(':')[0]);

        if (title === epubTitle || epubTitle === '*') {

            var html = fs.readFileSync(doc.spineItemPath);
            var $ = cheerio.load(html);

            var needMathMlOffset = false;
            mathML.process($, function (needOffset) {
                needMathMlOffset = needOffset
            });

            var elements = getElementsThatContainsQuery(query, $);

            hitSet.hits.push.apply(hitSet.hits, generateCFIs(doc.baseCfi, elements, needMathMlOffset));
        }
    }
    return hitSet;
    //return generateCFIs(html, data.query); 
};


function generateCFIs(cfiBase, elements, needOffset) {

    var cfiList = [];

    for (var key in elements) {

        var cfiParts = [];

        var textNode = elements[key].textNode,
            child = textNode.parent(),
            childContents = child.contents();

        var textNodeIndex = childContents.index(textNode) + 1;

        // "mixed content" context
        // the first chunk is located before the first child element
        // <p><span></span>text</p>
        if (childContents.first()[0].type === "tag") {
            textNodeIndex += 1;
        }

        var parent = child.parent();
        while (parent[0]) {
            var index = child.index(),
                inOff = (needOffset && parent[0].name === 'body'),
                id = child.attr('id'),
                idSelector = id ? '[' + id + ']' : '',
                part = ((index + 1) * 2 + (inOff ? 2 : 0)) + idSelector;

            cfiParts.unshift(part);

            child = parent;
            parent = child.parent();
        }
        var startOffset = elements[key].range.startOffset,
            endOffset = elements[key].range.endOffset;

        var inlinePath = ',/' + textNodeIndex + ':';
        var cfi = cfiBase + '/' + cfiParts.join('/') + inlinePath + startOffset + inlinePath + endOffset;

        //console.log('-----------------------------------------------------');
        //console.log('cfi: ' + cfi + ' \ntext: ' + elements[i].element.text());

        cfiList.push({'cfi': cfi, 'teaser': teaser.get(elements[key])});
    }
    return cfiList;
}

function getElementsThatContainsQuery(query, $) {

    var matches = [];

    $('body').find("*").contents().filter(function () {
        return (this.nodeType === 3 && $(this).text().toLowerCase().indexOf(query[0]) > -1);
    }).each(function () {
        var startOffset = $(this).text().toLowerCase().indexOf(query[0]),
            endOffset = startOffset + query[0].length;

        matches.push({
            textNode: $(this),
            range: {
                startOffset: startOffset,
                endOffset: endOffset
            }
        });
    });
    return matches;
}


function groupBooks(hits) {

    var books = [];

    for (var key in hits) {

        title = hits[key].id.split(':')[1];

        if (books.length === 0) {
            books.push([hits[key]]);
            continue;
        }

        for (var i in books) {
            if (title === books[i][0].id.split(':')[1]) {
                books[i].push(hits[key]);
                continue;
            }
        }
        books.push([hits[key]]);
    }
    return books;
}
