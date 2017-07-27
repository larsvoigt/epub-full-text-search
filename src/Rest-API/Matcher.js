import searchEngine from './../SearchEngine';
import winston from './../Logger';

module.exports = function (req, res) {

    const beginsWith = req.query['beginsWith'];
    if (!beginsWith) {
        res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
        return;
    }

    var bookTitle = req.query['t'];
    var uuid = req.query['uuid'];


    uuid = uuid || '-1';
    bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
    winston.log('info', 'request suggestion'.yellow + ' -> beginsWith: ' + beginsWith + ' -> bookTitle: ' + bookTitle +
    ' -> uuid: ' + uuid);

    searchEngine({})
        .then(se => {
            se.match(beginsWith, bookTitle, uuid)
                .then(matches => {

                    res.send(matches);
                    se.close(err => {
                        if (err)
                            winston.log('error', err);
                    });
                })
                .fail(err => {

                    se.close(err => {
                        if (err)
                            winston.log('error', err);
                    });
                    winston.log('error', err);
                });
        })
        .fail(err => {
            winston.log('error', err);
        });
};