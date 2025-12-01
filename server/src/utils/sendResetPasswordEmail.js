// import sendEmail from './sendEmail';
import sendEmail from './sendEmail.js';

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
    const resetURL = `${origin}/reset-password?token=${token}&email=${email}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Learnoverse Password</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 30px 20px; 
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .brand {
                font-size: 14px;
                margin-top: 8px;
                opacity: 0.9;
                letter-spacing: 1px;
            }
            .content { 
                background-color: #ffffff; 
                padding: 40px 30px;
            }
            .greeting {
                font-size: 20px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                color: #555;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .warning { 
                background-color: #fff3cd; 
                border-left: 4px solid #ffc107;
                padding: 15px 20px; 
                border-radius: 6px; 
                margin: 25px 0;
                color: #856404;
            }
            .warning strong {
                display: block;
                margin-bottom: 8px;
                color: #856404;
            }
            .security-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 25px;
                font-size: 14px;
                color: #666;
            }
            .footer { 
                background-color: #f8f9fa;
                text-align: center; 
                padding: 30px 20px;
                color: #6b7280; 
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer-brand {
                font-weight: 600;
                color: #667eea;
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <div class="brand">LEARNOVERSE - Your EduTech Partner</div>
            </div>
            <div class="content">
                <div class="greeting">Hello, ${name}!</div>
                
                <div class="message">
                    <p>We received a request to reset the password for your Learnoverse account. To continue your learning journey securely, please click the button below to create a new password.</p>
                </div>
                
                <div class="button-container">
                    <a href="${resetURL}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <p style="margin: 5px 0;">• This reset link will expire in <strong>10 minutes</strong> for your security.</p>
                    <p style="margin: 5px 0;">• If you didn't request this password reset, please ignore this email.</p>
                    <p style="margin: 5px 0;">• If you're concerned about your account security, please contact our support team immediately.</p>
                </div>
                
                <div class="security-info">
                    <strong>Need help?</strong><br>
                    If you're having trouble with the button above, you can copy and paste this link into your browser:<br>
                    <a href="${resetURL}" style="color: #667eea; word-break: break-all;">${resetURL}</a>
                </div>
            </div>
            <div class="footer">
                <p class="footer-brand">Learnoverse</p>
                <p>Empowering Education Through Technology</p>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} Learnoverse. All rights reserved.</p>
                <p>This is an automated email, please do not reply directly to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: htmlTemplate,
    });
};

export default sendResetPasswordEmail;
