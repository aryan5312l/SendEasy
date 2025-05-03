const router = require('express').Router();
const File = require('../models/file');

router.get('/:slug', async (req, res) => {
    try {
        const file = await File.findOne({ slug: req.params.slug });
        if (!file) {
            return res.render('download', { error: 'Link expired or not found' });
        }

        // Redirect to the existing UUID route
        return res.redirect(`/files/${file.uuid}`);
    } catch (error) {
        console.error(error);
        return res.status(500).render('download', { error: 'Internal Server Error' });
    }
});

module.exports = router;