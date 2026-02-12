const pool = require('../db');

async function logActivity(userId, action, ipAddress, additionalData = null) {
    try {
        const query = `
            INSERT INTO activity_logs (user_id, action, ip_address, additional_data, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;

        const result = await pool.query(query, [
            userId,
            action,
            ipAddress,
            additionalData ? JSON.stringify(additionalData) : null
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

function getIpAddress(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        'Unknown';
}

function auditLoggingMiddleware(action) {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const ipAddress = getIpAddress(req);
                logActivity(
                    req.user.user_id,
                    action,
                    ipAddress,
                    {
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode
                    }
                ).catch(err => console.error('Audit log error:', err));
            }

            return originalSend.call(this, data);
        };

        next();
    };
}

module.exports = {
    logActivity,
    getIpAddress,
    auditLoggingMiddleware
};
