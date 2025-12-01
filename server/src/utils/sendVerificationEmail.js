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
        <title>Verify Your Learnoverse Account</title>
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
            .token-info { 
                background-color: #f8f9fa; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 25px 0;
                border-left: 4px solid #667eea;
            }
            .token-info strong {
                color: #667eea;
            }
            .token-info p {
                margin: 8px 0;
                font-size: 14px;
            }
            .benefits {
                background-color: #f0f4ff;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .benefits h3 {
                color: #667eea;
                margin-top: 0;
                font-size: 18px;
            }
            .benefits ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .benefits li {
                margin: 8px 0;
                color: #555;
            }
            .info-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px 20px;
                border-radius: 6px;
                margin: 25px 0;
                font-size: 14px;
                color: #856404;
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
                <h1>✨ Welcome to Learnoverse!</h1>
                <div class="brand">Your EduTech Learning Journey Begins Here</div>
            </div>
            <div class="content">
                <div class="greeting">Hello, ${name}!</div>
                
                <div class="message">
                    <p>Thank you for joining Learnoverse! We're excited to have you as part of our learning community. To complete your registration and unlock all features, please verify your email address.</p>
                </div>
                
                <div class="button-container">
                    <a href="${verifyEmail}" class="button">Verify My Email</a>
                </div>
                
                <div class="benefits">
                    <h3>🎓 What You'll Get Access To:</h3>
                    <ul>
                        <li>📚 Extensive library of educational content</li>
                        <li>💡 Interactive learning experiences</li>
                        <li>👥 Connect with learners worldwide</li>
                        <li>📊 Track your learning progress</li>
                        <li>🎯 Personalized learning recommendations</li>
                    </ul>
                </div>
                
                <div class="token-info">
                    <p><strong>📱 Alternative Verification Method:</strong></p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;"><a href="${verifyEmail}" style="color: #667eea;">${verifyEmail}</a></p>
                </div>
                
                <div class="info-box">
                    ⏰ <strong>Important:</strong> This verification link will expire in 24 hours for security reasons. If you didn't create a Learnoverse account, please ignore this email.
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
        subject: '✨ Welcome to Learnoverse - Verify Your Email',
        html: htmlTemplate,
    });
};

export default sendVerificationEmail;
