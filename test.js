/**
 * Created by vagrant on 6/9/16.
 */

const searchEngine = require('./index'),
    constants = require("./src/Constants");

var se;
searchEngine({'indexPath': constants.TEST_DB})
    .then(function(_se) {
        se = _se;
        return se.query({
            query: [
            {
                AND: [
                    {'*': ['epub']},
                    {filename: ['accessible_epub_3']}
                ]
            },
            {
                AND: [
                    {'*': ['test']},
                    {filename: ['linear']}
                ]
            }
            ]
        }, ['test']);
    })
    .then(function(hits) {
        console.log(hits);
        console.log(hits.length);
        return se.close();
    })
    .fail(function(err) {
        console.log(err);
        se.close();
    });
