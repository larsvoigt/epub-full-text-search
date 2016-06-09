var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var mathML = require('./MathML.js');
//var cfiLib = require('epub-cfi');
//var jsdom = require('jsdom').jsdom;


exports.generate = function (data) {

    var html = fs.readFileSync(data.spineItemPath);
    var $ = cheerio.load(html);
    //var cfis = [];
    var needMathMlOffset = false;


//var document = jsdom(html,{features:{FetchExternalResources: false}});
    mathML.process($, function (needOffset) {
        needMathMlOffset = needOffset
    });

    var elements = getElementsThatContainsQuery(data.query, $);

    return generateCFIs(data.baseCfi, elements, needMathMlOffset);
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

        cfiList.push(cfi);
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