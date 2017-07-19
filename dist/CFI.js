'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _string = require('string');

var _string2 = _interopRequireDefault(_string);

var _MathML = require('./MathML.js');

var _MathML2 = _interopRequireDefault(_MathML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//const cfiLib from 'epub-cfi');
//const jsdom from 'jsdom').jsdom;


/**************
 * public
 *************/
exports.generate = function (data) {

    var html = _fs2.default.readFileSync(data.spineItemPath);
    var $dom = _cheerio2.default.load(html);
    //const cfis = [];
    var needMathMlOffset = false;

    //const document = jsdom(html,{features:{FetchExternalResources: false}});
    _MathML2.default.process($dom, function (needOffset) {
        needMathMlOffset = needOffset;
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

        var textNode = elements[key].textNode;
        var child = textNode.parent();
        var childContents = child.contents();

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
                inOff = needOffset && parent[0].name === 'body',
                id = child.attr('id'),
                idSelector = id ? '[' + id + ']' : '',
                part = (index + 1) * 2 + (inOff ? 2 : 0) + idSelector;

            cfiParts.unshift(part);

            child = parent;
            parent = child.parent();
        }
        var startOffset = elements[key].range.startOffset,
            endOffset = elements[key].range.endOffset;

        var inlinePath = ',/' + textNodeIndex + ':';
        var cfi = cfiBase + '/' + cfiParts.join('/') + inlinePath + startOffset + inlinePath + endOffset;

        cfiList.push({ cfi: cfi, excerpt: elements[key].excerpt });
    }
    return cfiList;
}

function getAllTextNodesContainsQuery(q, $) {

    var matches = [];

    $('body').find("*").contents().filter(function () {

        return this.nodeType === 3 && $(this).text().toLowerCase().indexOf(q) > -1;
    }).each(function () {

        var text = $(this).text();

        // the query can match several times in the same text element
        // so it necessary to get all indices 
        var indices = allIndexOf(text, q);

        for (var i in indices) {
            var startOffset = indices[i],
                endOffset = startOffset + q.length;

            var excerptLength = 80;
            var startExcerpt = startOffset - Math.floor((excerptLength - q.length) / 2);
            if (startExcerpt < 0) {
                // Start from the begining of the text if there are not enough characters before it
                startExcerpt = 0;
            }
            var excerpt = text.slice(startExcerpt);
            excerpt = excerpt.slice(excerpt.indexOf(' ') + 1); // trim to start on a full word
            excerpt = (0, _string2.default)(excerpt).truncate(excerptLength).s;
            if (startExcerpt > 0) {
                excerpt = '...' + excerpt; // add begining ellipsis
            }

            matches.push({
                textNode: $(this),
                range: {
                    startOffset: startOffset,
                    endOffset: endOffset
                },
                excerpt: excerpt
            });
        }
    });
    return matches;
}

function allIndexOf(str, q) {
    var matchCase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


    var indices = [];
    if (!matchCase) str = str.toLowerCase();
    for (var pos = str.indexOf(q); pos !== -1; pos = str.indexOf(q, pos + 1)) {
        indices.push(pos);
    }return indices;
}