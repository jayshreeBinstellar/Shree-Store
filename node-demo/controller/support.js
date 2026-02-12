const pool = require('../db');
const catchAsync = require('../utils/catchAsync');

// User creates a support ticket
exports.createTicket = catchAsync(async (req, res) => {
    const user_id = req.user.id;
    const { subject, message, priority = 'Medium' } = req.body;


    if (!subject || !message) {
        return res.status(400).json({ status: "error", message: "Subject and message are required" });
    }

    const result = await pool.query(
        `INSERT INTO support_tickets (user_id, subject, message, description, priority, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $3, $4, 'Open', NOW(), NOW()) 
         RETURNING *`,
        [user_id, subject, message, priority]
    );

    res.status(201).json({
        status: "success",
        ticket: result.rows[0],
        message: "Your support ticket has been created successfully. We'll get back to you soon!"
    });
});

// Get user's support tickets
exports.getUserTickets = catchAsync(async (req, res) => {
    const user_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM support_tickets WHERE user_id = $1`;
    let countQuery = `SELECT COUNT(*) FROM support_tickets WHERE user_id = $1`;
    let params = [user_id];
    let countParams = [user_id];

    if (status && status !== 'All') {
        query += ` AND status = $${params.length + 1}`;
        countQuery += ` AND status = $${countParams.length + 1}`;
        params.push(status);
        countParams.push(status);
    }

    query += ` ORDER BY updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, countParams);
    const totalTickets = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        tickets: result.rows,
        total: totalTickets,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalTickets / limit)
    });
});

// Get single ticket details
exports.getTicketDetails = catchAsync(async (req, res) => {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
        `SELECT t.*, u.full_name, u.email 
         FROM support_tickets t 
         JOIN users u ON t.user_id = u.user_id 
         WHERE t.ticket_id = $1 AND t.user_id = $2`,
        [ticket_id, user_id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }

    res.status(200).json({
        status: "success",
        ticket: result.rows[0]
    });
});

// Add reply/comment to ticket
exports.addTicketReply = catchAsync(async (req, res) => {
    const { ticket_id } = req.params;
    const user_id = req.user.id;
    const { reply_text, is_admin = false } = req.body;

    if (!reply_text) {
        return res.status(400).json({ status: "error", message: "Reply text is required" });
    }

    // Check if ticket belongs to user
    const ticketCheck = await pool.query(
        `SELECT * FROM support_tickets WHERE ticket_id = $1`,
        [ticket_id]
    );

    if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }

    const ticket = ticketCheck.rows[0];
    if (ticket.user_id !== user_id && !is_admin) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    // Determine sender label
    const senderLabel = is_admin ? 'Admin' : 'User';

    // Update ticket with reply
    const replyResult = await pool.query(
        `UPDATE support_tickets SET message = CONCAT(message, E'\n\n--- ' || $3 || ' Reply: ' || NOW()::text || ' ---\n' || $1), updated_at = NOW() WHERE ticket_id = $2 RETURNING *`,
        [reply_text, ticket_id, senderLabel]
    );

    res.status(201).json({
        status: "success",
        ticket: replyResult.rows[0],
        message: "Reply added successfully"
    });
});

// Get ticket replies/conversation
exports.getTicketReplies = catchAsync(async (req, res) => {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    // Verify user owns this ticket
    const ticketCheck = await pool.query(
        `SELECT user_id FROM support_tickets WHERE ticket_id = $1`,
        [ticket_id]
    );

    if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }

    if (ticketCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    // Return the ticket with message content
    const result = await pool.query(
        `SELECT ticket_id, message, admin_reply, updated_at FROM support_tickets WHERE ticket_id = $1`,
        [ticket_id]
    );

    res.status(200).json({
        status: "success",
        replies: result.rows
    });
});

// Close ticket
exports.closeTicket = catchAsync(async (req, res) => {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    // Verify user owns this ticket
    const ticketCheck = await pool.query(
        `SELECT user_id FROM support_tickets WHERE ticket_id = $1`,
        [ticket_id]
    );

    if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }

    if (ticketCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    const result = await pool.query(
        `UPDATE support_tickets SET status = 'Closed', updated_at = NOW() WHERE ticket_id = $1 RETURNING *`,
        [ticket_id]
    );

    res.status(200).json({
        status: "success",
        ticket: result.rows[0],
        message: "Ticket closed successfully"
    });
});

// Reopen ticket
exports.reopenTicket = catchAsync(async (req, res) => {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    const ticketCheck = await pool.query(
        `SELECT user_id FROM support_tickets WHERE ticket_id = $1`,
        [ticket_id]
    );

    if (ticketCheck.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }

    if (ticketCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    const result = await pool.query(
        `UPDATE support_tickets SET status = 'Open', updated_at = NOW() WHERE ticket_id = $1 RETURNING *`,
        [ticket_id]
    );

    res.status(200).json({
        status: "success",
        ticket: result.rows[0],
        message: "Ticket reopened successfully"
    });
});

// Get support categories (removed - using static list)
exports.getSupportCategories = catchAsync(async (req, res) => {
    const categories = [
        { id: 1, name: 'General Inquiry', value: 'General' },
        { id: 2, name: 'Order Issue', value: 'Order' },
        { id: 3, name: 'Product Quality', value: 'Product' },
        { id: 4, name: 'Shipping & Delivery', value: 'Shipping' },
        { id: 5, name: 'Payment Issue', value: 'Payment' },
        { id: 6, name: 'Account & Login', value: 'Account' },
        { id: 7, name: 'Return & Refund', value: 'Return' },
        { id: 8, name: 'Other', value: 'Other' }
    ];

    res.status(200).json({
        status: "success",
        categories: categories
    });
});
