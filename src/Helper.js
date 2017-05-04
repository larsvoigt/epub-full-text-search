import request from 'request';


const Helper = {};


Helper.fetchUrlContent = function (href, callback) {

    request(href, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            return callback(body);
        }
        else
            console.error('[ERROR] ' + error);
    });
};


module.exports = Helper;

