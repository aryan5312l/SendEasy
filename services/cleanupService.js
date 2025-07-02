const cron = require('node-cron');
const File = require('../models/file');
const cloudinary = require('cloudinary').v2;

//Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Cleanup function
cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    const expiredFiles = await File.find({createdAt: {$lt: now - 24 * 60 * 60 * 1000}});
    for(const file of expiredFiles){
        if(file.public_id){
            try{
                await cloudinary.uploader.destroy(file.public_id);
            }catch(error){
                console.error('Error deleting file from Cloudinary:', error);
            }
        }
        await file.remove();
    }
    console.log('Cleanup completed');

});