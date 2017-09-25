import winston from './../Logger';

module.exports = function (req, res) {

    winston.log('info', 'client request search');

    if (!req.query['q']) {
        res.status(500).send('Can`t find query parameter q -> /search?q=word');
        return;
    }

    const q = req.query['q'].toLowerCase().split(/\s+/);

    var bookTitle = req.query['t'];
    var uuid = req.query['uuid'];
    uuid = uuid || '-1';
    bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
    winston.log('info', 'request search'.blue + ' -> query: ' + q + ' -> bookTitle: ' + bookTitle + ' -> uuid: ' + uuid);

    req.app.se.search(q[0], bookTitle, uuid)
        .then(result => {
            res.send(result);
        })
        .fail(err => {
            res.send(err);
        });

};
