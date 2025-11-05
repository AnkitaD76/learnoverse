import nodemailer from 'nodemailer';
import { nodemailerConfig } from '../config/index.js';

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.SENDER_EMAIL) {
            throw new Error(
                'SENDER_EMAIL is not defined in environment variables'
            );
        }

        const transporter = nodemailer.createTransport({
            ...nodemailerConfig,
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false,
            },
        });

        // Verify connection configuration
        await transporter.verify();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export default sendEmail;
