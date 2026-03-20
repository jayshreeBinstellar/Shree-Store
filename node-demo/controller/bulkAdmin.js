
const pool = require('../db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logActivity, getIpAddress } = require('../utils/auditLogger');
const APIFeatures = require('../utils/apiFeatures');


//this APi for bulk add products in admin panel
exports.bulkAddProducts = catchAsync(async (req, res) => {
    const { products } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const inserted = [];
        for (const p of products) {
            const res = await client.query(
                "INSERT INTO products (title, description, price, old_price, stock, category, thumbnail, images, sizes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *",
                [p.title, p.description, p.price, p.old_price || null, p.stock, p.category, p.thumbnail, p.images || [], p.sizes || []]
            );
            inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
        logActivity(req.user.id, 'Bulk Added Products', getIpAddress(req), { count: inserted.length })
            .catch(err => console.error('Activity log error:', err));
        res.status(201).json({ status: "success", count: inserted.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Bulk upload error:", error);
        throw error; // Rethrow to be caught by catchAsync
    } finally {
        client.release();
    }
});

exports.bulkDeleteProducts = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });

    await pool.query("UPDATE products SET is_soft_deleted = true WHERE product_id = ANY($1)", [ids]);

    logActivity(req.user.id, 'Bulk Deleted Products', getIpAddress(req), { count: ids.length, ids }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} products deleted` });
});

exports.bulkRestoreProducts = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "no id provided" });

    await pool.query("UPDATE products SET is_soft_deleted = false WHERE product_id = ANY($1)", [ids]);

    logActivity(req.user.id, 'bulk resotre products', getIpAddress(req), { count: ids.length, ids })
        .catch(err => console.error(err));
    res.status(200).json({ status: 'sucess', message: "products restore succesfulyy" })
})

exports.bulkUpdateProductStatus = catchAsync(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("UPDATE products SET is_active = $1::BOOLEAN WHERE product_id = ANY($2)", [status, ids]);
    logActivity(req.user.id, 'Bulk Updated Product Status', getIpAddress(req), { count: ids.length, status }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} products updated` });
});

exports.bulkUpdateOrderStatus = catchAsync(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("UPDATE orders SET status = $1 WHERE order_id = ANY($2)", [status, ids]);
    logActivity(req.user.id, 'Bulk Updated Order Status', getIpAddress(req), { count: ids.length, status }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} orders updated` });
});

exports.bulkToggleUserBlock = catchAsync(async (req, res) => {
    const { ids, is_blocked } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("UPDATE users SET is_blocked = $1::BOOLEAN WHERE user_id = ANY($2)", [is_blocked, ids]);
    logActivity(req.user.id, 'Bulk User Block Toggle', getIpAddress(req), { count: ids.length, is_blocked }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} users updated` });
});

exports.bulkDeleteCoupons = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("DELETE FROM coupons WHERE coupon_id = ANY($1)", [ids]);
    logActivity(req.user.id, 'Bulk Deleted Coupons', getIpAddress(req), { count: ids.length }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} coupons deleted` });
});

exports.bulkDeleteBanners = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("DELETE FROM banners WHERE banner_id = ANY($1)", [ids]);
    logActivity(req.user.id, 'Bulk Deleted Banners', getIpAddress(req), { count: ids.length }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} banners deleted` });
});

exports.bulkDeleteCategories = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("DELETE FROM categories WHERE category_id = ANY($1)", [ids]);
    logActivity(req.user.id, 'Bulk Deleted Categories', getIpAddress(req), { count: ids.length }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} categories deleted` });
});

exports.bulkUpdateReviewStatus = catchAsync(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("UPDATE reviews SET status = $1 WHERE review_id = ANY($2)", [status, ids]);
    logActivity(req.user.id, 'Bulk Updated Review Status', getIpAddress(req), { count: ids.length, status }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} reviews updated` });
});

exports.bulkUpdateTransactionStatus = catchAsync(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    // Assuming transactions are tracked via payment_id in the orders table
    await pool.query("UPDATE orders SET status = $1 WHERE payment_id = ANY($2)", [status, ids]);
    logActivity(req.user.id, 'Bulk Updated Transaction Status', getIpAddress(req), { count: ids.length, status }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} transactions updated` });
});

exports.bulkUpdateTicketStatus = catchAsync(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ status: "error", message: "No IDs provided" });
    await pool.query("UPDATE support_tickets SET status = $1 WHERE ticket_id = ANY($2)", [status, ids]);
    logActivity(req.user.id, 'Bulk Updated Ticket Status', getIpAddress(req), { count: ids.length, status }).catch(err => console.error(err));
    res.status(200).json({ status: "success", message: `${ids.length} tickets updated` });
});
