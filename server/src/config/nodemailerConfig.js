import dotenv from 'dotenv';
dotenv.config();
export const nodemailerConfig = {
    host: process.env.SMTP_SERVER,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};
