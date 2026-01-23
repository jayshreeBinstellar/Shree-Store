// ------------This is middleware--------------

const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ status: false, error: "missing token", });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        const result = await pool.query(
            "SELECT user_id, current_token FROM users WHERE user_id = $1",
            [decoded.id]
        );

        if (!result.rows.length) {
            return res.status(401).json({
                status: false,
                message: "user delete",
            });
        }

        if (result.rows[0].current_token !== token) {
            return res.status(401).json({
                message: "session expier",
                isExpired: true,
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res
            .status(403)
            .json({ status: false, error: "invalid token" });
    }
};



module.exports = verifyToken;




