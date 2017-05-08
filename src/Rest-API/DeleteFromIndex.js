import searchEngine from './../SearchEngine';

module.exports = function (req, res) {

    const beginsWith = req.query['uuid'];
    if (!beginsWith) {
        res.status(500).send('Can`t found query parameter beginsWith -> /deleteFromIndex?uuid=uuid');
        return;
    }

    const uuid = req.query['uuid'];
    console.log('[INFO] client request delete');
    console.log('[INFO] uuid: ' + uuid);

    searchEngine({})
        .then(se => {
            se.del(uuid)
                .then(() => {
                    res.send('Document with ID ' + uuid + ' deleted.');
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
                    res.send('Somthing goes wrong:  ID ' + uuid);
                });
        })
        .fail(err => {
            console.error('[ERROR] ' + err);
        });
};