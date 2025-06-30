const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.render('download', { error: 'Link has expired' });
        }

        // Redirect to the file path
        return res.redirect(file.path);
    } catch (error) {
        console.error(error);
        return res.render('download', { error: 'Internal Server Error' });
    }
});

module.exports = router;