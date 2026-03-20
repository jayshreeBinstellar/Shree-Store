const pool = require('../db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logActivity, getIpAddress } = require('../utils/auditLogger');
const APIFeatures = require('../utils/apiFeatures');



//this APi for get all banners in admin panel
exports.getBanners = catchAsync(async (req, res) => {
    const baseQuery = "SELECT * FROM banners";

    const searchableColumns = ['title', 'position', 'is_active'];

    const columnMapping = {
        'banner': 'title',
        'position': 'position',
        'status': 'is_active'
    }


    const features = new APIFeatures(baseQuery, req.query, pool, searchableColumns, columnMapping);
    features.filter();

    const { data, meta } = await features.execute('', 'ORDER BY created_at DESC');

    res.status(200).json({
        statusCode: 200,
        data,
        meta
    });
});

//this APi for add banner in admin panel
exports.addBanner = catchAsync(async (req, res) => {
    const { title, description, image_url, position, display_order, is_active } = req.body;
    const result = await pool.query(
        "INSERT INTO banners (title, description, image_url, position, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title,
            description,
            image_url,
            position,
            display_order || 0,
            is_active !== false]
    );
    logActivity(req.user.id, 'Created Banner', getIpAddress(req), { title })
        .catch(err => console.error('Activity log error:', err));
    res.status(201).json({ status: "success", banner: result.rows[0] });
});

//this APi for delete banner in admin panel
exports.deleteBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM banners WHERE banner_id = $1", [id]);

    logActivity(req.user.id, 'Deleted Banner', getIpAddress(req), { banner_id: id })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", message: "Banner deleted" });
});

//this APi for update banner in admin panel
exports.updateBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, position, display_order, is_active } = req.body;

    const result = await pool.query(
        `UPDATE banners 
            SET title = $1, description = $2, image_url = $3, 
                position = $4, display_order = $5, is_active = $6::BOOLEAN, updated_at = CURRENT_TIMESTAMP
            WHERE banner_id = $7 
            RETURNING *`,
        [title, description, image_url, position, display_order, is_active !== false, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Banner not found" });
    }

    // Fire and forget - don't block on logging
    logActivity(req.user.id, 'Updated Banner', getIpAddress(req), { banner_id: id, title })
        .catch(err => console.error('Activity log error:', err));
    res.status(200).json({ status: "success", banner: result.rows[0] });
});

//this API for upload banner image
exports.uploadBannerImage = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const fs = require('fs');
    const path = require('path');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/banners');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `banner_${timestamp}_${req.file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Return image URL (adjust based on your server setup)
    const imageUrl = `/uploads/banners/${filename}`;

    res.status(200).json({
        status: "success",
        imageUrl: imageUrl,
        url: imageUrl,
        message: "Image uploaded successfully"
    });
});