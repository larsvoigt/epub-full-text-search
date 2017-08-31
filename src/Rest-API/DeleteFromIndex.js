import searchEngine from './../SearchEngine';
import winston from './../Logger';

module.exports = function (req, res) {

    const beginsWith = req.query['uuid'];
    if (!beginsWith) {
        res.status(500).send('Can`t find query parameter beginsWith -> /deleteFromIndex?uuid=uuid');
        return;
    }

    const uuid = req.query['uuid'];
    winston.log('info', 'client request delete -> uuid: ' + uuid);

    if (!uuid) {
        res.status(500).send('Uuid is undefined.');
        return;
    }

    searchEngine({})
        .then(se => {
            se.del(uuid)
                .then(() => {
                    res.send('Document with ID ' + uuid + ' deleted.');
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
                    res.send('Somthing goes wrong:  ID ' + uuid);
                });
        })
        .fail(err => {
            winston.log('error', err);
        });
};