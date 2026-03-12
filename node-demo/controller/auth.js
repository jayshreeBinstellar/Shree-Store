const pool = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');
require("dotenv").config();
const catchAsync = require('../utils/catchAsync');

const SECRET_KEY = process.env.SECRET_KEY;

const otpStore = new Map();

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

exports.logIn = catchAsync(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "field is required" })
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    if (result.rows.length === 0) {
        return res.status(401).json({ message: "user not registered" });
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "incorrect password" });
    }

    const token = jwt.sign(
        { id: user.user_id, email: user.email, isAdmin: user.is_admin, role: user.role },
        SECRET_KEY,
        { expiresIn: "7d" }
    );

    await pool.query(
        "UPDATE users SET current_token = $1 WHERE user_id = $2",
        [token, user.user_id]
    );

    return res.status(200).json({
        status: "success",
        message: "login successfully",
        token,
        user
    })
});

exports.register = catchAsync(async (req, res) => {
    const { fullname, email, password, dob, gender } = req.body

    if (!fullname || !email || !password || !dob || !gender) {
        return res.status(400).json({ message: "all field is required" })
    }
    const existingUser = await pool.query(
        "SELECT user_id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            status: "error",
            message: "Email already registered"
        });
    }

    //convert password bycrpt
    const hash = await bcrypt.hash(password, 10)

    const insertResult = await pool.query("INSERT INTO users (full_name, email, password_hash, dob, gender, role, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, 'Customer', FALSE, NOW()) RETURNING *",
        [fullname, email, hash, dob, gender]
    );
    const user = insertResult.rows[0];

    // Create token
    const token = jwt.sign(
        { id: user.user_id, email: user.email, isAdmin: user.is_admin, role: user.role },
        SECRET_KEY,
        { expiresIn: "7d" }
    );
    await pool.query("UPDATE users SET current_token = $1 WHERE user_id = $2", [token, user.user_id]);

    return res.status(201).json({
        status: true,
        message: "signup success",
        token,
        user
    });
});

exports.forgetPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
        // Return success even if email not found for security
        return res.status(200).json({ 
            status: "success", 
            message: "If the email exists, an OTP will be sent" 
        });
    }

    const user = result.rows[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiry
    otpStore.set(email, {
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        userId: user.user_id
    });

    console.log(`🔐 OTP for ${email}: ${otp}`);
    
    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
        status: "success",
        message: "OTP sent to your email",
        // In development, return OTP for testing (remove in production)
        devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
});

// Verify OTP endpoint
exports.verifyOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedOTP = otpStore.get(email);

    if (!storedOTP) {
        return res.status(400).json({ message: "OTP expired or not found. Please request a new OTP." });
    }

    if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (storedOTP.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // OTP is valid - generate a temporary reset token
    const resetToken = jwt.sign(
        { id: storedOTP.userId, email, type: 'password-reset' },
        SECRET_KEY,
        { expiresIn: "15m" }
    );

    // Clear the OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({
        status: "success",
        message: "OTP verified successfully",
        resetToken
    });
});

// Reset Password endpoint
exports.resetPassword = catchAsync(async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required" });
    }

    // Verify the reset token
    let decoded;
    try {
        decoded = jwt.verify(resetToken, SECRET_KEY);
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (decoded.type !== 'password-reset') {
        return res.status(400).json({ message: "Invalid token type" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await pool.query(
        "UPDATE users SET password_hash = $1 WHERE user_id = $2",
        [hash, decoded.id]
    );

    // Invalidate all existing tokens for this user (optional security measure)
    await pool.query(
        "UPDATE users SET current_token = NULL WHERE user_id = $1",
        [decoded.id]
    );

    res.status(200).json({
        status: "success",
        message: "Password reset successfully. Please login with your new password."
    });
});

// Resend OTP endpoint
exports.resendOTP = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
        return res.status(200).json({ 
            status: "success", 
            message: "If the email exists, an OTP will be sent" 
        });
    }

    // Delete existing OTP if any
    otpStore.delete(email);

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiry
    otpStore.set(email, {
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        userId: result.rows[0].user_id
    });

    console.log(`🔐 New OTP for ${email}: ${otp}`);
    
    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
        status: "success",
        message: "New OTP sent to your email",
        devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
});

exports.getProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await pool.query("SELECT user_id, full_name, email, dob, gender, created_at FROM users WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        status: "success",
        user: result.rows[0]
    });
});

exports.updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { full_name: fullname, dob, gender } = req.body;
    const result = await pool.query(
        "UPDATE users SET full_name = $1, dob = $2, gender = $3 WHERE user_id = $4 RETURNING user_id, full_name, email, dob, gender",
        [fullname, dob, gender, userId]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        status: "success",
        user: result.rows[0]
    });
});

exports.getAddresses = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC", [userId]);
    res.status(200).json({ status: "success", addresses: result.rows });
});

exports.addAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { type, fullname, phone, street, city, state, zip, isDefault } = req.body;
    if (isDefault) {
        await pool.query("UPDATE addresses SET is_default = FALSE WHERE user_id = $1", [userId]);
    }
    const result = await pool.query(
        "INSERT INTO addresses (user_id, type, full_name, phone, street_address, city, state, zip_code, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [userId, type, fullname, phone, street, city, state, zip, isDefault]
    );
    res.status(201).json({ status: "success", address: result.rows[0] });
});

exports.deleteAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("DELETE FROM addresses WHERE address_id = $1 AND user_id = $2", [id, userId]);
    res.status(200).json({ status: "success", message: "Address deleted" });
});



exports.logOut = catchAsync(async (req, res) => {
    const userId = req.user.id;
    
    await pool.query(
        "UPDATE users SET current_token = NULL WHERE user_id = $1",
        [userId]
    );
    
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
});

exports.changeMyPassword = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords required" });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    
    const result = await pool.query("SELECT password_hash FROM users WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "Current password incorrect" });
    }
    
    const newHash = await bcrypt.hash(newPassword, 10);
    
    await pool.query("UPDATE users SET password_hash = $1, current_token = NULL WHERE user_id = $2", [newHash, userId]);
    
    res.status(200).json({
        status: "success",
        message: "Password changed successfully. Please login again."
    });
});
