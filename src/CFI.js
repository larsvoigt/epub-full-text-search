var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var mathML = require('./MathML.js');
//var cfiLib = require('epub-cfi');
//var jsdom = require('jsdom').jsdom;


/**************
 * public
 *************/
exports.generate = function (data) {

    var html = fs.readFileSync(data.spineItemPath);
    var $dom = cheerio.load(html);
    //var cfis = [];
    var needMathMlOffset = false;


//var document = jsdom(html,{features:{FetchExternalResources: false}});
    mathML.process($dom, function (needOffset) {
        needMathMlOffset = needOffset
    });

    var elements = getAllTextNodesContainsQuery(data.searchFor, $dom);

    return generateCFIs(data.baseCfi, elements, needMathMlOffset);
};

/**************
 * private
 *************/
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

function getAllTextNodesContainsQuery(q, $) {

    var matches = [];

    $('body').find("*").contents().filter(function () {

        return (this.nodeType === 3 && $(this).text().toLowerCase().indexOf(q) > -1);

    }).each(function () {

        var text = $(this).text();

        // the query can match several times in the same text element
        // so it necessary to get all indices 
        const indices = allIndexOf(text, q);

        for (var i in indices) {
            var startOffset = indices[i],
                endOffset = startOffset + q.length;

            matches.push({
                textNode: $(this),
                range: {
                    startOffset: startOffset,
                    endOffset: endOffset
                }
            });
        }
    });
    return matches;
}

function allIndexOf(str, q, matchCase = false) {

    var indices = [];
    if (!matchCase)
        str = str.toLowerCase();
    for (var pos = str.indexOf(q); pos !== -1; pos = str.indexOf(q, pos + 1))
        indices.push(pos);
    return indices;
}