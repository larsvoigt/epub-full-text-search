import searchEngine from './../SearchEngine';

module.exports = function (req, res) {

    console.log('[INFO] client request search');

    if (!req.query['q']) {
        res.status(500).send('Can`t found query parameter q -> /search?q=word');
        return;
    }

    const q = req.query['q'].toLowerCase().split(/\s+/);

    var bookTitle = req.query['t'];
    var uuid = req.query['uuid'];
    uuid = uuid || '-1';
    bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits
    console.log('[INFO] bookTitle: ' + bookTitle);
    console.log('[INFO] uuid: ' + uuid);

    searchEngine({})
        .then(se => {

            se.search(q[0], bookTitle, uuid)
                .then(result => {

                    res.send(result);
                    se.close(err => {
                        if (err)
                            console.error('[ERROR] ' + err);
                    });
                })
                .fail(err => {
                    res.send(err);

                    se.close(err => {
                        if (err)
                            console.error('[ERROR] ' + err);
                    });
                });
        })
        .fail(err => {
            console.error('[ERROR] ' + err);
        });
};
