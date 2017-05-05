import searchEngine from './../SearchEngine';

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
    console.log('[INFO] client request match');
    console.log('[INFO] bookTitle: ' + bookTitle);
    console.log('[INFO] uuid: ' + uuid);

    searchEngine({})
        .then(se => {
            se.match(beginsWith, bookTitle, uuid)
                .then(matches => {

                    res.send(matches);
                    se.close(err => {
                        if (err)
                            console.error('[ERROR] ' + err);
                    });
                })
                .fail(err => {

                    se.close(err => {
                        if (err)
                            console.error('[ERROR] ' + err);
                    });
                    console.error('[ERROR] ' + err);
                });
        })
        .fail(err => {
            console.error('[ERROR] ' + err);
        });
};