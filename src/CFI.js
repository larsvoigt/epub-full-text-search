import cheerio from 'cheerio';
import mathML from './MathML.js';
import readFile from 'fs-readfile-promise';
import validUrl from 'valid-url';
import rp from 'request-promise';
import winston from './Logger';


/**************
 * public
 *************/
exports.generate = function (data) {

    return new Promise(function (resolve, reject) {

        const fetch = validUrl.isUri(data.spineItemPath) ? rp(data.spineItemPath) : readFile(data.spineItemPath);

        fetch
            .then(html => {

                const $dom = cheerio.load(html);
                var needMathMlOffset = false;

                mathML.process($dom, needOffset => {
                    needMathMlOffset = needOffset
                });

                const elements = getAllTextNodesContainsQuery(data.searchFor, $dom);
                const result = generateCFIs(data.baseCfi, elements, needMathMlOffset);
                resolve(result);
            })
            .catch(err => {
                winston.log('error', err);
                reject(err);
            });
    });
};

/**************
 * private
 *************/
function generateCFIs(cfiBase, elements, needOffset) {

    const cfiList = [];

    for (const key in elements) {

        const cfiParts = [];

        const textNode = elements[key].textNode;
        var child = textNode.parent();
        const childContents = child.contents();


        var textNodeIndex = childContents.index(textNode) + 1;

        // "mixed content" context
        // the first chunk is located before the first child element
        // <p><span></span>text</p>
        if (childContents.first()[0].type === "tag") {
            textNodeIndex += 1;
        }

        var parent = child.parent();
        while (parent[0]) {
            const index = child.index(),
                inOff = (needOffset && parent[0].name === 'body'),
                id = child.attr('id'),
                idSelector = id ? '[' + id + ']' : '',
                part = ((index + 1) * 2 + (inOff ? 2 : 0)) + idSelector;

            cfiParts.unshift(part);

            child = parent;
            parent = child.parent();
        }
        const startOffset = elements[key].range.startOffset,
            endOffset = elements[key].range.endOffset;

        const inlinePath = ',/' + textNodeIndex + ':';
        const cfi = cfiBase + '/' + cfiParts.join('/') + inlinePath + startOffset + inlinePath + endOffset;

        cfiList.push(cfi);
    }
    return cfiList;
}

function getAllTextNodesContainsQuery(q, $) {

    const matches = [];

    $('body').find("*").contents().filter(function () {

        return (this.nodeType === 3 && $(this).text().toLowerCase().indexOf(q) > -1);

    }).each(function () {

        const text = $(this).text();

        // the query can match several times in the same text element
        // so it necessary to get all indices
        const indices = allIndexOf(text, q);

        for (var i in indices) {
            const startOffset = indices[i],
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

    const indices = [];
    if (!matchCase)
        str = str.toLowerCase();
    for (var pos = str.indexOf(q); pos !== -1; pos = str.indexOf(q, pos + 1))
        indices.push(pos);
    return indices;
}