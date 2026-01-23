const pool = require('../db');

/**
 * Log user activity to the audit logs table
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Description of the action performed
 * @param {string} ipAddress - IP address of the user
 * @param {Object} additionalData - Optional additional data to store
 */
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
        // Don't throw - we don't want audit log failures to break the main operation
    }
}

/**
 * Get user's IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
function getIpAddress(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.ip || 
           'Unknown';
}

/**
 * Middleware to automatically log admin actions
 */
function auditLoggingMiddleware(action) {
    return async (req, res, next) => {
        // Store original send method
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log if the request was successful (2xx status)
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
            
            // Call original send
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
