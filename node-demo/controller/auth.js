const pool = require('../db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require("dotenv").config();
const catchAsync = require('../utils/catchAsync');

const SECRET_KEY = process.env.SECRET_KEY;

exports.Login = catchAsync(async (req, res) => {
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
        return res.status(400).json({ message: "all filed is requried" })
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
    const { email } = req.body
    const result = await pool.query("SELECT * from users WHERE email = $1", [email])

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "email is not register" })
    }
    const user = result.rows[0];

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp, "verify otp");

    res.status(200).json({
        status: "sucess",
        message: "send otp sucessfully",
        user
    })
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
    const { fullname, dob, gender } = req.body;
    const result = await pool.query(
        "UPDATE users SET full_name = $1, dob = $2, gender = $3 WHERE user_id = $4 RETURNING user_id, full_name, email, dob, gender",
        [fullname, dob, gender, userId]
    );
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
