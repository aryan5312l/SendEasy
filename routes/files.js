const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuid4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },

}).single('myfile');


router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        console.log("Received file:", req.file); // 🔍 Check if file is received

        // Validate request
        if (!req.file) {
            return res.status(400).json({ error: 'No file received' });
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // Store in DataBase
        try {
            const file = new File({
                filename: req.file.filename,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size
            });

            const response = await file.save();
            console.log("File saved in DB:", response); // 🔍 Debugging log

            return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            return res.status(500).json({ error: 'Database save failed' });
        }
    });
});

router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;

    //Validate request
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required' });
    }

    //Get data from database
    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
        return res.status(422).send({ error: 'Email already sent' });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    //send email
    const sendMail = require('../services/emailServices');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'SendEasy file Shareing',
        text: `${emailFrom} shared a file with you`,
        html: require('../services/emailTemplate')({
            emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 1000) + ' KB',
            expires: '24 hours'
        })
    });

    return res.send({ success: 'Email Sent' });

})

module.exports = router;