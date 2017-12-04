import winston from './Logger';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
const proxy = process.env.http_proxy || 'http://192.168.1.135:8080';

const Helper = {};

Helper.getContent = function (endpoint) {
    // from here https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
    return new Promise((resolve, reject) => {

        winston.log('info','attempting to GET %j', endpoint);

        // select http or https module, depending on reqested url
        const lib = endpoint.startsWith('https') ? require('https') : require('http');
        const options = url.parse(endpoint);
        const agent = new HttpsProxyAgent(proxy);
        // options.agent = agent; // uncomment to set proxy settings

        const request = lib.get(options, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page for normalization, status code: ' + response.statusCode));
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks

            response.on('end', () => resolve(body.join('')));
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
};
module.exports = Helper;

