import sendEmail from './sendEmail.js';

const sendVerificationEmail = async ({
    name,
    email,
    verificationToken,
    origin,
}) => {
    const verifyEmail = `${origin}/verify-email?token=${verificationToken}&email=${email}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .token-info { background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐾 Pet Management System</h1>
                <p>Email Verification Required</p>
            </div>
            <div class="content">
                <h2>Hello, ${name}!</h2>
                <p>Thank you for registering with Pet Management System. To complete your registration and start managing your pets, please verify your email address.</p>
                
                <div style="text-align: center;">
                    <a href="${verifyEmail}" class="button">Verify Email Address</a>
                </div>
                
                <div class="token-info">
                    <p><strong>Alternative verification:</strong></p>
                    <p>If the button doesn't work, you can manually verify by visiting the verification page and entering:</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Token:</strong> ${verificationToken}</p>
                </div>
                
                <p>This verification link will expire in 24 hours for security reasons.</p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2024 Pet Management System. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: '🐾 Pet Management System - Verify Your Email',
        html: htmlTemplate,
    });
};

export default sendVerificationEmail;
