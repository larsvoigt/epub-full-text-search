
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var mathJax = require("MathJax-node/lib/mj-single");
mathJax.start();
//var cfiLib = require('/home/albert/workspace/readium-js-viewer/readium-js/epub-modules/epub-renderer/src/readium-shared-js/lib/epub_cfi.js');


exports.generate = function (data) {

    var elements = getElementsForQuery(data.query, data.spineItemPath);

    return  generateCFIs(data.baseCfi, elements);
   
    //GenerateCFIs(result.hits[i].document.baseCfi, elements); 
};



function generateCFIs(cfiBase, elements) {

    var cfiList = [];

    for (i in elements) {

        var cfiParts = [];
        var child = elements[i].element;
        //console.log(child[0].name);
        var parent = child.parent();
        //console.log(child.parents().length);

        while (parent[0]) {

            var index = child.index();

            if (child.attr('id'))
                cfiParts.unshift((index + 1) * 2 + '[' + child.attr('id') + ']');
            else
                cfiParts.unshift((index + 1) * 2);
            child = parent;
            parent = child.parent();

            //if (parent[0])
            //    console.log(parent[0].name);

        }
        var startOffset = elements[i].range.startOffset;
        var endOffset = elements[i].range.endOffset;

        var cfi = cfiBase + '/' + cfiParts.join('/') + ',/1:' + startOffset + ',/1:' + endOffset;

        //TODO: fix cfi for ranges with paths to inline element -> text
        //console.log('-----------------------------------------------------');
        //console.log('cfi: ' + cfi + ' \ntext: ' + elements[i].element.text());

        cfiList.push(cfi);
    }
    return cfiList;
}

function getElementsForQuery(query, file) {

    var html = fs.readFileSync(file);
    var $ = cheerio.load(html);

    //var mathNodes = $('mml\\:math, math').get();
    //
    //if (mathNodes.length > 0) {
    //
    //    async.each(mathNodes, processMath, function (err) {
    //        if (err) {
    //            throw err;
    //        }
    //        fs.writeFile(file + '.math', $.html(), function (err) {
    //            if (err) {
    //                throw err;
    //            }
    //        });
    //        console.log("It\'s saved!");
    //    });
    //
    //    function processMath(mathNode, callback) {
    //        var thisMathNode = mathNode;
    //        var mmlString = $.html(mathNode);
    //        console.log(mmlString);
    //        typeset({
    //            format: "MathML",
    //            math: mmlString,
    //            svg: true,
    //        }, function (data) {
    //            if (!data.errors && data.svg) {
    //                var svgNode = data.svg;
    //                $(thisMathNode).parent().append(svgNode);
    //            }
    //            callback(data.errors);
    //        });
    //    }
    //}


    var matches = [];
    $("*").each(function () {
        if ($(this).children().length < 1 && $(this).text().toLowerCase().indexOf(query[0]) > -1) {

            var startOffset = $(this).text().toLowerCase().indexOf(query[0]);
            var endOffset = startOffset + query[0].length;
            matches.push({element: $(this), range: {startOffset: startOffset, endOffset: endOffset}});
            //console.log($(this).text().toLowerCase().indexOf(query[0]));
        }
    });
    return matches;
}

//function GenerateCFIs(cfiBase, elements) {
//
//    var cfiList = [];
//
//    for (i in elements) {
//
//        var cfiParts = [];
//
//        var startOffset = elements[i].range.startOffset;
//        var endOffset = elements[i].range.endOffset;
//        var element = elements[i].element[0];
//
//        var cfi = cfiLib.EPUBcfi.Generator.generateCompleteCFI(
//            element,
//            startOffset,
//            element,
//            endOffset,
//            ["cfi-marker"],
//            [],
//            []
//        );
//
//        console.log('-----------------------------------------------------');
//        console.log('cfiLib: ' + cfi);
//
//        cfiList.push(cfi);
//    }
//    return cfiList;
//}