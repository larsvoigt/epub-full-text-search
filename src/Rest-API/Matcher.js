import winston from './../Logger';

module.exports = function (req, res) {

    const beginsWith = req.query['beginsWith'];
    if (!beginsWith) {
        res.status(500).send('Can`t find query parameter beginsWith -> /matcher?beginsWith=word');
        return;
    }

    var bookTitle = req.query['t'];
    var uuid = req.query['uuid'];


    uuid = uuid || '-1';
    bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
    winston.log('info', 'request autocomplete'.yellow + ' -> beginsWith: ' + beginsWith + ' -> bookTitle: ' + bookTitle +
        ' -> uuid: ' + uuid);

    req.app.se.match(beginsWith, bookTitle, uuid)
        .then(matches => {
            res.send(matches);
        })
        .fail(err => {
            winston.log('error', err);
        });

};