const START_TAG = '<b class=&#39;hit&#39;>';
const END_TAG = '</b>';

exports.get = function (element) {

    var textNode = element.textNode;
    var text = textNode.parent().contents();

    if (text[0].type === 'text')
        console.log("Text:   " + tagQuery(text[0].data, element.range.startOffset, element.range.endOffset));
};


function tagQuery(value, start, end) {

    return value.substring(0, start) + START_TAG +
        value.substring(start, end) + END_TAG +
        value.substring(end);
}