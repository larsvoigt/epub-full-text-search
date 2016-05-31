'use strict'

/**
 * Module dependencies.
 * @private
 */
const _ = require('lodash');

/**
 * Module variables.
 * @private
 */
const START_TAG = "<b class='hit'>";
const END_TAG = '</b>';

exports.get = function (element) {

    var textNode = element.textNode;
    var text = textNode.parent().contents();

    if (text[0].type === 'text') {
        //console.log("Text:   " + tagQuery(text[0].data, element.range.startOffset, element.range.endOffset));
        text = tagQuery(text[0].data, element.range.startOffset, element.range.endOffset);
        return escapeHtml(text);

    }
    else
        return "";
};


function tagQuery(orgText, start, end) {

    var text = trim(orgText.substring(0, start), 10) + START_TAG +
        orgText.substring(start, end) + END_TAG +
        trim(orgText.substring(end), 10);

    // replace linebreaks 
    text = text.replace(/[\r\n]/g, ' ');
    // remove multi whitespace
    text = text.replace(/\s+/g, ' ');

    return text;
}

function trim(text, count) {

    const words = text.split(' ');

    return (_.takeRight(words, count)).join(' ');
}


function escapeHtml(unsafe) {
    //console.log(unsafe);
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}