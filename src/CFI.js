import fs from 'fs';
import cheerio from 'cheerio';
import S from 'string';
import mathML from './MathML.js';
//const cfiLib from 'epub-cfi');
//const jsdom from 'jsdom').jsdom;


/**************
 * public
 *************/
exports.generate = function (data)  {

    const html = fs.readFileSync(data.spineItemPath);
    const $dom = cheerio.load(html);
    //const cfis = [];
    var needMathMlOffset = false;


//const document = jsdom(html,{features:{FetchExternalResources: false}});
    mathML.process($dom, (needOffset) => {
        needMathMlOffset = needOffset
    });

    const elements = getAllTextNodesContainsQuery(data.searchFor, $dom);

    return generateCFIs(data.baseCfi, elements, needMathMlOffset);
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

        cfiList.push({ cfi, excerpt: elements[key].excerpt });
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

            const excerptLength = 80;
            let startExcerpt = startOffset - Math.floor((excerptLength - q.length) / 2);
            if (startExcerpt < 0) {
                // Start from the begining of the text if there are not enough characters before it
                startExcerpt = 0;
            }
            let excerpt = text.slice(startExcerpt);
            excerpt = excerpt.slice(excerpt.indexOf(' ') + 1); // trim to start on a full word
            excerpt = S(excerpt).truncate(excerptLength).s;
            if (startExcerpt > 0) {
                excerpt = `...${excerpt}`; // add begining ellipsis
            }

            matches.push({
                textNode: $(this),
                range: {
                    startOffset: startOffset,
                    endOffset: endOffset
                },
                excerpt,
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