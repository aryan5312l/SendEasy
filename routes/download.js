const router = require('express').Router();
const File = require('../models/file');
const fileDownload = require('js-file-download');

router.get('/:uuid', async (req, res) => {
    const file = await File.findOne({ uuid: req.params.uuid });

    if (!file) {
        return res.render('download', { error: 'Files is expired' });
    }

    fileDownload(file.path, file.filename);
})

module.exports = router;