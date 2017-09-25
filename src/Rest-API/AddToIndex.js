import winston from './../Logger';

module.exports = function (req, res) {
// TODO: testing
    if (!req.query['url'] || !req.query['uuid']) {
        res.status(500).send('Can`t found query parameter beginsWith -> /addToIndex?url=UrlToEPUB&uuid=uuid');
        return;
    }

    const url = req.query['url'];
    const uuid = req.query['uuid'];

    req.app.se.indexing(url, uuid)
        .then(() => {

            res.status(200).send('DONE! EPUB is indexed.');
            winston.log('info', 'DONE! EPUB is indexed.');

        })
        .catch(err => {
            res.status(500).send(err);
            winston.log('error', err);
        });
};