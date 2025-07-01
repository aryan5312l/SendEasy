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

// Set up Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        format: async (req, file) => file.mimetype.startsWith('image/') ? file.mimetype.split('/')[1] : undefined,
        public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        resource_type: (req, file) => file.mimetype.startsWith('image/') ? 'image' : 'raw'
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
        // Determine resource type from the path
        const resourceType = req.file.path.includes('/raw/') ? 'raw' : 'image';
        let fileUrl;
        if (resourceType === 'raw') {
            fileUrl = req.file.path; // direct URL, no fl_attachment
        } else {
            const urlParts = req.file.path.split('/upload/');
            fileUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;
        }
        
        // Generate a unique slug for each upload
        const slug = nanoid(6);

        console.log("req.file: ", req.file);

        // Store in Database
        const file = new File({
            filename: req.file.filename,
            originalname: req.file.originalname,
            uuid: uuid4(),
            public_id: req.file.filename,
            path: fileUrl,
            size: req.file.size,
            slug: slug
        });

        const response = await file.save();
        console.log("File saved in DB:", response); // 🔍 Debugging log
        console.log("public_id:", req.file.public_id);

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