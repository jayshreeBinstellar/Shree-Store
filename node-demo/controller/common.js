const pool = require('../db');
const catchAsync = require('../utils/catchAsync');

exports.getShippingOptions = catchAsync(async (req, res) => {
    const result = await pool.query("SELECT * FROM shipping_options ORDER BY cost ASC");
    res.status(200).json({ status: "success", options: result.rows });
});

exports.getCategories = catchAsync(async (req, res) => {
    let query = "SELECT * FROM categories";

    const isAdmin = req.user && req.user.isAdmin;

    if (!isAdmin) {
        query += " WHERE is_active = true";
    }

    query += " ORDER BY sort_order ASC, name ASC";

    const result = await pool.query(query);
    res.status(200).json({ status: "success", categories: result.rows });
});

exports.getStoreSettings = catchAsync(async (req, res) => {
    const result = await pool.query("SELECT * FROM store_settings LIMIT 1");
    // If no settings exist yet, return defaults
    const settings = result.rows[0] || {
        store_name: 'My Store',
        currency: 'USD',
        currency_symbol: '$',
        tax_percent: 0,
        contact_email: '',
        contact_phone: '',
        address: ''
    };
    res.status(200).json({ status: "success", settings });
});
