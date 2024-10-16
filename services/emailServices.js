const nodemailer = require('nodemailer');

async function sendMail({from, to, subject, text, html}){
    let transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    let info = await transporter.sendMail({
        from : `SendEasy <${from}`,
        to,
        subject,
        text,
        html
    })

}

module.exports = sendMail;