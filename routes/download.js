const router = require('express').Router();
const File = require('../models/file');
const axios = require('axios');

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.render('download', { error: 'Link has expired' });
        }

        // Proxy raw file downloads to set the correct filename
        if (file.path.includes('/raw/')) {
            const cloudinaryUrl = file.path.split('?')[0]; // Use direct URL, no fl_attachment
            const response = await axios({
                url: cloudinaryUrl,
                method: 'GET',
                responseType: 'stream'
            });
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
            res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
            response.data.pipe(res);
        } else {
            // For images, just redirect
            return res.redirect(file.path);
        }
    } catch (error) {
        console.error(error);
        return res.render('download', { error: 'Internal Server Error' });
    }
});

module.exports = router;