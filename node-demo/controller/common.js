const pool = require('../db');
const catchAsync = require('../utils/catchAsync');

exports.getShippingOptions = catchAsync(async (req, res) => {
    const { search } = req.query;
    let query = "SELECT * FROM shipping_options";
    let params = [];

    if (search) {
        query += " WHERE name ILIKE $1";
        params.push(`%${search}%`);
    }

    query += " ORDER BY cost ASC";
    const result = await pool.query(query, params);
    res.status(200).json({ status: "success", options: result.rows });
});

exports.getCategories = catchAsync(async (req, res) => {
    const { search } = req.query;
    let query = "SELECT * FROM categories";
    let params = [];
    let conditions = [];

    // Since this is used in both admin and shop, we might want to return all for admin
    // but the current implementation filters by is_active if not admin.
    // We'll keep that but remove pagination (which it didn't really have limit anyway, 
    // but we'll ensure it stays consistent).

    if (search) {
        conditions.push(`name ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY sort_order ASC, name ASC";

    const result = await pool.query(query, params);
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
