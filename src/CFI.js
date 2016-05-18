var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var mathML = require('./MathML.js');
//var cfiLib = require('epub-cfi');
//var jsdom = require('jsdom').jsdom;


exports.generate = function (hits, epubTitle, query) {
    
    var hitSet = {};
    hitSet.hits = [];
    
    for (var i in hits) {

        var title = hits[i].document.id.split(':')[1];
        //hits[i].document.id = result.hits[i].document.id.split(':')[0];
        //console.log(result.hits[i].document);

        if (title === epubTitle || epubTitle === '*') {

            var html = fs.readFileSync(hits[i].document.spineItemPath);
            var $ = cheerio.load(html);

            var needMathMlOffset = false;
            mathML.process($, function (needOffset) {
                needMathMlOffset = needOffset
            });

            var elements = getElementsThatContainsQuery(query, $);

            hitSet.hits.push.apply(hitSet.hits, generateCFIs(hits[i].document.baseCfi, elements, needMathMlOffset));
        }
    }
    return hitSet;
    //return generateCFIs(html, data.query); 
};


function generateCFIs(cfiBase, elements, needOffset) {

    //if (cfiBase === "/6/50[c25]!")
    //    console.log(cfiBase);

    var cfiList = [];

    for (i in elements) {

        var cfiParts = [];

        var textNode = elements[i].textNode;
        var child = textNode.parent();

        var textNodeIndex = child.contents().index(textNode) + 1;

        //// "mixed content" context
        //// the first chunk is located before the first child element
        //// <p><span></span>text</p>
        if (child.contents().first()[0].type === "tag")
            textNodeIndex += 1;

        //console.log(child[0].name);
        var parent = child.parent();
        //console.log(child.parents().length);


        while (parent[0]) {

            var index = child.index();
            var inOff = (needOffset && parent[0].name === 'body') ? true : false;

            if (child.attr('id'))
                cfiParts.unshift(((index + 1) * 2 + (inOff ? 2 : 0)) + '[' + child.attr('id') + ']');
            else
                cfiParts.unshift(((index + 1) * 2 + (inOff ? 2 : 0)));

            child = parent;
            parent = child.parent();
            //    console.log(parent[0].name);

        }
        var startOffset = elements[i].range.startOffset;
        var endOffset = elements[i].range.endOffset;

        var inlinePath = ',/' + textNodeIndex + ':';
        var cfi = cfiBase + '/' + cfiParts.join('/') + inlinePath + startOffset + inlinePath + endOffset;

        //console.log('-----------------------------------------------------');
        //console.log('cfi: ' + cfi + ' \ntext: ' + elements[i].element.text());
        
        cfiList.push({'cfi': cfi, 'teaser' : "Test"});
    }
    return cfiList;
}

function getElementsThatContainsQuery(query, $) {

    var matches = [];

    $('body').find("*").contents().filter(function () {
        //Node.TEXT_NODE === 3
        return (this.nodeType === 3 && $(this).text().toLowerCase().indexOf(query[0]) > -1);

    }).each(function (i, element) {

        var startOffset = $(this).text().toLowerCase().indexOf(query[0]);
        var endOffset = startOffset + query[0].length;
        matches.push({textNode: $(this), range: {startOffset: startOffset, endOffset: endOffset}});
        //console.log($(this).text().toLowerCase().indexOf(query[0]));
    });
    return matches;
}


//function generateCFIs(html, query) {
//
//    var cfiList = [];
//
//    var doc = jsdom(html);
//
//    function recursvie(element) {
//        if (element.childNodes.length > 0)
//            for (var i = 0; i < element.childNodes.length; i++)
//                recursvie(element.childNodes[i]);
//
//        if (element.nodeType === 3 && element.nodeValue != '' &&
//            element.nodeValue.toLowerCase().indexOf(query[0]) > -1) {
//            var startOffset = element.nodeValue.toLowerCase().indexOf(query[0]);
//            var endOffset = startOffset + query[0].length;
//
//            var cfi = cfiLib.generateCharOffsetRangeComponent(
//                element,
//                startOffset,
//                element,
//                endOffset
//            );
//            console.log('-----------------------------------------------------');
//            console.log('cfiLib: ' + cfi);
//
//            cfiList.push(cfi);
//        }
//
//    }
//
//    var html = doc.getElementsByTagName('html')[0];
//    recursvie(html);
//
//    return cfiList;
//}