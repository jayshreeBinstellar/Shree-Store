const nodemailer = require('nodemailer');

require('dotenv').config();
// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER ,
            pass: process.env.EMAIL_PASS
        }
    });
};

console.log( process.env.EMAIL_USER,"email");


// Send OTP email
const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Admin Panel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Password Reset Request</h2>
                    <p>You requested to reset your password for the Admin Panel.</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #6B7280;">Your OTP is:</p>
                        <h1 style="color: #4F46E5; font-size: 32px; margin: 10px 0; letter-spacing: 8px;">${otp}</h1>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">
                        This OTP will expire in 10 minutes.<br>
                        If you didn't request this, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                    <p style="color: #9CA3AF; font-size: 12px;">
                        This is an automated email from Admin Panel. Please do not reply.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(` OTP email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(' Error sending email:', error);
        // For development, log the OTP anyway
        console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail
};

