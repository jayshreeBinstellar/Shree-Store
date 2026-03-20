
const pool = require('../db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logActivity, getIpAddress } = require('../utils/auditLogger');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');


//this APi for get products in admin panel
exports.getProducts = catchAsync(async (req, res) => {
    const baseQuery = "SELECT * FROM products";

    const searchableColumns = [
        'title',
        'description',
        'category',
        'price',
        'stock',
        'is_active'
    ];
    const features = new APIFeatures(baseQuery, req.query, pool, searchableColumns);
    features.filter();

    const { data, meta } = await features.execute('', 'ORDER BY created_at DESC');

    res.status(200).json({
        statusCode: 200,
        data,
        meta
    });
});

//this APi for add product in admin panel
exports.addProduct = catchAsync(async (req, res) => {
    const { title, description, price, old_price, thumbnail, stock, category, images, sizes } = req.body;
    const result = await pool.query(
        "INSERT INTO products (title, description, price, old_price, thumbnail, stock, category, images, sizes, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0) RETURNING *",
        [title, description, price, old_price, thumbnail, stock, category, images || [], sizes || []]
    );
    logActivity(req.user.id, 'Created Product', getIpAddress(req), { product_id: result.rows[0].product_id, title: result.rows[0].title })
        .catch(err => console.error('Activity log error:', err));
    res.status(201).json({ status: "success", product: result.rows[0] });
});



//this APi for update product in admin panel
exports.updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, old_price, thumbnail, stock, category, images, sizes } = req.body;
    const result = await pool.query(
        "UPDATE products SET title = $1, description = $2, price = $3, old_price = $4, thumbnail = $5, stock = $6, category = $7, images = $8, sizes = $9 WHERE product_id = $10 RETURNING *",
        [title, description, price, old_price, thumbnail, stock, category, images || [], sizes || [], id]
    );
    if (result.rows.length > 0) {
        logActivity(req.user.id, 'Updated Product', getIpAddress(req), { product_id: id, title: title })
            .catch(err => console.error('Activity log error:', err));
    }
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ status: "success", product: result.rows[0] });
});

//this APi for delete product in admin panel
// exports.deleteProduct = catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const result = await pool.query("DELETE FROM products WHERE product_id = $1 RETURNING *", [id]);
//     if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Product not found" });
//     }
//     logActivity(req.user.id, 'Deleted Product', getIpAddress(req), { product_id: id })
//         .catch(err => console.error('Activity log error:', err));
//     res.status(200).json({ status: "success", message: "Product deleted" });
// });

//this APi for toggle product status in admin panel
exports.toggleProductStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        "UPDATE products SET is_active = NOT is_active WHERE product_id = $1 RETURNING *",
        [id]
    );
    if (result.rows.length > 0) {
        logActivity(req.user.id, 'Toggled Product Status', getIpAddress(req), { product_id: id, status: result.rows[0].is_active })
            .catch(err => console.error('Activity log error:', err));
    }
    res.status(200).json({ status: "success", product: result.rows[0] });
});

//this APi for soft delete product in admin panel
exports.softDeleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query(
        "UPDATE products SET is_soft_deleted = TRUE WHERE product_id = $1",
        [id]);

    logActivity(req.user.id, 'Archived Product', getIpAddress(req), { product_id: id })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", message: "Product moved to archive" });
});

//this API for restore product 
exports.restoreProduct = catchAsync(async (req, res) => {
    const { id } = req.params
    await pool.query(
        "UPDATE products SET is_soft_deleted = FALSE WHERE product_id = $1",
        [id]);
    logActivity(req.user.id, "restore the product", getIpAddress(req), { product_id: id })
        .catch(err => console.error('Activity log error', err));
    res.status(200).json({ status: "success", message: "product restore sucessfully" })
})



//this API for upload product image
exports.uploadProductImage = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const fs = require('fs');
    const path = require('path');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `product_${timestamp}_${req.file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Return image URL (adjust based on your server setup)
    const imageUrl = `/uploads/products/${filename}`;

    res.status(200).json({
        status: "success",
        imageUrl: imageUrl,
        url: imageUrl,
        message: "Image uploaded successfully"
    });
});