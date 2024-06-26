import nodemailer from 'nodemailer';
import { emailUser, emailPassword } from '../config/config.js';

const sendEmail = async (to, subject, text) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
    });

    let mailOptions = {
        from: emailUser,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
