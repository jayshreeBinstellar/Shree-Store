const pool = require('../db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logActivity, getIpAddress } = require('../utils/auditLogger');
const APIFeatures = require('../utils/apiFeatures');




//this APi for get all shipping options in admin panel with pagination and filtering
exports.getShippingOptions = catchAsync(async (req, res) => {
    const baseQuery = "SELECT * FROM shipping_options";

    const searchableColumns = ['name', 'cost', 'estimated_days'];

    // Add custom column mapping
    const columnMapping = {
        'name': 'name',
        'cost': 'cost',
        'estimated_days': 'estimated_days'
    };

    const features = new APIFeatures(baseQuery, req.query, pool, searchableColumns, columnMapping);
    features.filter();

    const { data, meta } = await features.execute('', 'ORDER BY cost ASC');

    res.status(200).json({
        statusCode: 200,
        data,
        meta
    });
});

//this APi for add shipping option in admin panel
exports.addShippingOption = catchAsync(async (req, res) => {
    const { name, cost, estimated_days } = req.body;
    const result = await pool.query(
        "INSERT INTO shipping_options (name, cost, estimated_days) VALUES ($1, $2, $3) RETURNING *",
        [name,
            cost,
            estimated_days]
    );
    logActivity(req.user.id, 'Added Shipping Option', getIpAddress(req), { name, cost })
        .catch(err => console.error('Activity log error:', err));
    res.status(201).json({ status: "success", option: result.rows[0] });
});

//this APi for update shipping option in admin panel
exports.updateShippingOption = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, cost, estimated_days } = req.body;
    const result = await pool.query(
        "UPDATE shipping_options SET name = $1, cost = $2, estimated_days = $3 WHERE shipping_id = $4 RETURNING *",
        [name, cost, estimated_days, id]
    );
    // Fire and forget - don't block on logging
    logActivity(req.user.id, 'Updated Shipping Option', getIpAddress(req), { shipping_id: id, name })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", option: result.rows[0] });
});

//this APi for delete shipping option in admin panel
exports.deleteShippingOption = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM shipping_options WHERE shipping_id = $1", [id]);
    // Fire and forget - don't block on logging
    logActivity(req.user.id, 'Deleted Shipping Option', getIpAddress(req), { shipping_id: id })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", message: "Shipping option deleted" });
});

//this APi for update order shipping in admin panel
exports.updateOrderShipping = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { tracking_number, shipping_carrier, status } = req.body;
    const result = await pool.query(
        "UPDATE orders SET tracking_number = $1, shipping_carrier = $2, status = $3 WHERE order_id = $4 RETURNING *",
        [tracking_number, shipping_carrier, status, id]
    );
    logActivity(req.user.id, 'Updated Order Shipping', getIpAddress(req), { order_id: id, tracking_number })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", order: result.rows[0] });
});