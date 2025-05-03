require('dotenv').config();
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuid4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {nanoid} = require('nanoid');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const slug = nanoid(6);

// Set up Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Cloudinary folder name
        format: async (req, file) => file.mimetype.split('/')[1], // Get file format dynamically
        public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    }
});

const upload = multer({ storage });
/*
let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },

}).single('myfile');
*/

router.post('/', upload.single('myfile'), async (req, res) => {
    try {
        console.log("Headers:", req.headers);  // ✅ Debug headers
        console.log("Received file:", req.file); // 🔍 Debugging
        console.log("File Received:", req.file);
        if (!req.file) {
            return res.status(400).json({ error: 'No file received' });
        }
        // Modify Cloudinary URL to enforce download
        const fileUrl = req.file.path.replace('/upload/', '/upload/fl_attachment/');
        // Store in Database
        const file = new File({
            filename: req.file.filename,
            originalname: req.file.originalname,
            uuid: uuid4(),
            public_id: req.file.public_id,
            path: fileUrl,
            size: req.file.size,
            slug: slug
        });

        const response = await file.save();
        console.log("File saved in DB:", response); // 🔍 Debugging log

        return res.json({ file: `${process.env.APP_BASE_URL}/s/${slug}` });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: 'File upload failed' });
    }
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