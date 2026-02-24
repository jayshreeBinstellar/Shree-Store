const pool = require('../db');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { logActivity, getIpAddress } = require('../utils/auditLogger');

//this APi for get stats for dashboard
exports.getSalesStats = catchAsync(async (req, res) => {
    const query = `
        SELECT 
            DATE(created_at) as date,
            SUM(total_amount) as total_sales,
            COUNT(order_id) as total_orders
        FROM orders
        WHERE status != 'Cancelled'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
    `;
    const result = await pool.query(query);

    // Also get some quick stats
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM orders WHERE status = 'Ordered') as pending_orders,
            (SELECT SUM(total_amount) FROM orders WHERE status != 'Cancelled') as lifetime_sales,
            (SELECT COUNT(*) FROM orders WHERE status != 'Cancelled') as total_orders,
            (SELECT COUNT(*) FROM users WHERE is_admin = FALSE) as total_customers,
            (SELECT COUNT(*) FROM products WHERE is_soft_deleted = FALSE) as total_products,
            (SELECT COUNT(*) FROM products WHERE stock < 10 AND is_soft_deleted = FALSE) as low_stock_count
    `;
    const statsResult = await pool.query(statsQuery);

    // Sales by category
    const categoryQuery = `
        SELECT p.category, SUM(oi.price * oi.quantity) as sales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status != 'Cancelled'
        GROUP BY p.category
        ORDER BY sales DESC
    `;
    const categoryResult = await pool.query(categoryQuery);

    // Top selling products
    const topProductsQuery = `
        SELECT p.title, p.thumbnail, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status != 'Cancelled'
        GROUP BY p.product_id, p.title, p.thumbnail
        ORDER BY total_sold DESC
        LIMIT 5
    `;
    const topProductsResult = await pool.query(topProductsQuery);

    res.status(200).json({
        status: "success",
        chartData: result.rows.reverse(),
        stats: statsResult.rows[0],
        categoryData: categoryResult.rows,
        topProducts: topProductsResult.rows
    });
});

//this APi for get products in admin panel
exports.getProducts = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM products";
    let countQuery = "SELECT COUNT(*) FROM products";
    let params = [];
    let conditions = [];

    if (search) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
    const totalProducts = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        products: result.rows,
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalProducts / limit)
    });
});

//this APi for add product in admin panel
exports.addProduct = catchAsync(async (req, res) => {
    const { title, description, price, old_price, thumbnail, stock, category, images } = req.body;
    const result = await pool.query(
        "INSERT INTO products (title, description, price, old_price, thumbnail, stock, category, images, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0) RETURNING *",
        [title, description, price, old_price, thumbnail, stock, category, images || []]
    );
    await logActivity(req.user.id, 'Created Product', getIpAddress(req), { product_id: result.rows[0].product_id, title: result.rows[0].title });
    res.status(201).json({ status: "success", product: result.rows[0] });
});

//this APi for bulk add products in admin panel
exports.bulkAddProducts = catchAsync(async (req, res) => {
    const { products } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const inserted = [];
        for (const p of products) {
            const res = await client.query(
                "INSERT INTO products (title, description, price, old_price, stock, category, thumbnail, images, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *",
                [p.title, p.description, p.price, p.old_price || null, p.stock, p.category, p.thumbnail, p.images || []]
            );
            inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
        await logActivity(req.user.id, 'Bulk Added Products', getIpAddress(req), { count: inserted.length });
        res.status(201).json({ status: "success", count: inserted.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Bulk upload error:", error);
        throw error; // Rethrow to be caught by catchAsync
    } finally {
        client.release();
    }
});

//this APi for update product in admin panel
exports.updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, old_price, thumbnail, stock, category, images } = req.body;
    const result = await pool.query(
        "UPDATE products SET title = $1, description = $2, price = $3, old_price = $4, thumbnail = $5, stock = $6, category = $7, images = $8 WHERE product_id = $9 RETURNING *",
        [title, description, price, old_price, thumbnail, stock, category, images || [], id]
    );
    if (result.rows.length > 0) {
        await logActivity(req.user.id, 'Updated Product', getIpAddress(req), { product_id: id, title: title });
    }
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ status: "success", product: result.rows[0] });
});

//this APi for delete product in admin panel
exports.deleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE product_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }
    await logActivity(req.user.id, 'Deleted Product', getIpAddress(req), { product_id: id });
    res.status(200).json({ status: "success", message: "Product deleted" });
});

//this APi for toggle product status in admin panel
exports.toggleProductStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        "UPDATE products SET is_active = NOT is_active WHERE product_id = $1 RETURNING *",
        [id]
    );
    if (result.rows.length > 0) {
        await logActivity(req.user.id, 'Toggled Product Status', getIpAddress(req), { product_id: id, status: result.rows[0].is_active });
    }
    res.status(200).json({ status: "success", product: result.rows[0] });
});

//this APi for soft delete product in admin panel
exports.softDeleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("UPDATE products SET is_soft_deleted = TRUE WHERE product_id = $1", [id]);
    await logActivity(req.user.id, 'Archived Product', getIpAddress(req), { product_id: id });
    res.status(200).json({ status: "success", message: "Product moved to archive" });
});


//this APi for update store settings in admin panel
exports.updateStoreSettings = catchAsync(async (req, res) => {
    const { store_name, currency, currency_symbol, tax_percent, contact_email, contact_phone, address } = req.body;
    const result = await pool.query(
        `UPDATE store_settings SET 
            store_name = $1, currency = $2, currency_symbol = $3, 
            tax_percent = $4, contact_email = $5, contact_phone = $6, 
            address = $7, updated_at = NOW() 
            WHERE setting_id = (SELECT setting_id FROM store_settings LIMIT 1) 
            RETURNING *`,
        [store_name, currency, currency_symbol, tax_percent, contact_email, contact_phone, address]
    );
    await logActivity(req.user.id, 'Updated Store Settings', getIpAddress(req), req.body);
    res.status(200).json({ status: "success", settings: result.rows[0] });
});

//this APi for get all orders in admin panel
exports.getAllOrders = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let countQuery = `SELECT COUNT(*) FROM orders o`;
    let query = `
        SELECT o.*, 
                u.full_name, u.email,
                c.code as coupon_code,
                s.name as shipping_name,
                json_agg(json_build_object(
                    'product_id', p.product_id,
                    'title', COALESCE(oi.title, p.title),
                    'thumbnail', COALESCE(oi.thumbnail, p.thumbnail),
                    'price', oi.price,
                    'quantity', oi.quantity,
                    'discount', oi.discount,
                    'effective_price', oi.effective_price
                )) as items
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN coupons c ON o.coupon_id = c.coupon_id
        LEFT JOIN shipping_options s ON o.shipping_id = s.shipping_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
    `;

    let params = [];
    let conditions = [];

    if (status && status !== 'All') {
        conditions.push(`o.status = $${params.length + 1}`);
        params.push(status);
    }

    if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` GROUP BY o.order_id, u.full_name, u.email, c.code, s.name
                ORDER BY o.created_at DESC 
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
    const totalOrders = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        orders: result.rows,
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
    });
});

//this APi for update order status in admin panel
exports.updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
        "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
        [status, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
    }
    await logActivity(req.user.id, 'Updated Order Status', getIpAddress(req), { order_id: id, status });
    res.status(200).json({ status: "success", order: result.rows[0] });
});

// exports.updateOrderShipping = catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const { tracking_number, shipping_carrier, status } = req.body;

//     const result = await pool.query(
//         "UPDATE orders SET tracking_number = $1, shipping_carrier = $2, status = COALESCE($3, status) WHERE order_id = $4 RETURNING *",
//         [tracking_number, shipping_carrier, status, id]
//     );
//     if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Order not found" });
//     }
//     res.status(200).json({ status: "success", order: result.rows[0] });
// });

// this APi for get all customers in admin panel
exports.getAllCustomers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT 
            user_id, full_name, email, dob, gender, is_blocked, role, created_at,
            (SELECT COUNT(*) FROM orders WHERE user_id = u.user_id) as total_orders,
            (SELECT SUM(total_amount) FROM orders WHERE user_id = u.user_id AND status != 'Cancelled') as total_spent
        FROM users u
        WHERE is_admin = FALSE
    `;
    let countQuery = `SELECT COUNT(*) FROM users u WHERE is_admin = FALSE`;
    let params = [];
    let conditions = [];

    if (search) {
        conditions.push(`(full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        const whereClause = " AND " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
    const totalCustomers = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        customers: result.rows,
        total: totalCustomers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCustomers / limit)
    });
});

//this APi for toggle user block in admin panel
exports.toggleUserBlock = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        "UPDATE users SET is_blocked = NOT is_blocked WHERE user_id = $1 RETURNING *",
        [id]
    );
    if (result.rows.length > 0) {
        await logActivity(req.user.id, 'Toggled User Block', getIpAddress(req), { target_user_id: id, is_blocked: result.rows[0].is_blocked });
    }
    res.status(200).json({ status: "success", customer: result.rows[0] });
});

//this APi for add customer in admin panel
exports.addCustomer = catchAsync(async (req, res) => {
    const { fullname, email, password, dob, gender, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ status: "error", message: "User already exists with this email" });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'Customer'; // Default to Customer if created from admin panel
    const isAdmin = userRole === 'Super Admin' || userRole === 'Staff';

    const result = await pool.query(
        "INSERT INTO users (full_name, email, password_hash, dob, gender, role, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
        [fullname, email, hash, dob || null, gender || 'Other', userRole, isAdmin]
    );

    await logActivity(req.user.id, 'Created User from Admin', getIpAddress(req), {
        target_user_id: result.rows[0].user_id,
        role: userRole,
        email: email
    });

    res.status(201).json({ status: "success", user: result.rows[0] });
});

//this APi for update user role in admin panel
exports.updateUserRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const isAdmin = role === 'Super Admin' || role === 'Staff';
    const result = await pool.query(
        "UPDATE users SET role = $1, is_admin = $2 WHERE user_id = $3 RETURNING *",
        [role, isAdmin, id]
    );
    if (result.rows.length > 0) {
        await logActivity(req.user.id, 'Updated User Role', getIpAddress(req), { target_user_id: id, role });
    }
    res.status(200).json({ status: "success", user: result.rows[0] });
});

//this APi for get all activity logs in admin panel
exports.getActivityLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT a.*, u.full_name as admin_name 
        FROM activity_logs a 
        JOIN users u ON a.user_id = u.user_id 
        ORDER BY a.created_at DESC 
        LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(*) FROM activity_logs`;

    const result = await pool.query(query, [parseInt(limit), parseInt(offset)]);
    const countResult = await pool.query(countQuery);
    const totalLogs = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        logs: result.rows,
        total: totalLogs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalLogs / limit)
    });
});

//this APi for add category in admin panel
exports.addCategory = catchAsync(async (req, res) => {
    const { name, slug, parent_id, sort_order } = req.body;
    const result = await pool.query(
        "INSERT INTO categories (name, slug, parent_id, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, slug, parent_id || null, sort_order || 0]
    );
    await logActivity(req.user.id, 'Created Category', getIpAddress(req), { category: name });
    res.status(201).json({ status: "success", category: result.rows[0] });
});

//this APi for update category in admin panel
exports.updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, slug, parent_id, sort_order, is_active } = req.body;
    const result = await pool.query(
        "UPDATE categories SET name = $1, slug = $2, parent_id = $3, sort_order = $4, is_active = $5 WHERE category_id = $6 RETURNING *",
        [name, slug, parent_id || null, sort_order || 0, is_active, id]
    );
    await logActivity(req.user.id, 'Updated Category', getIpAddress(req), { category_id: id, name });
    res.status(200).json({ status: "success", category: result.rows[0] });
});

//this APi for delete category in admin panel
exports.deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE category_id = $1", [id]);
    await logActivity(req.user.id, 'Deleted Category', getIpAddress(req), { category_id: id });
    res.status(200).json({ status: "success", message: "Category deleted" });
});

//this APi for get all coupons in admin panel
exports.getCoupons = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM coupons";
    let countQuery = "SELECT COUNT(*) FROM coupons";
    let params = [];
    let conditions = [];

    if (search) {
        conditions.push(`code ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
    const totalCoupons = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        coupons: result.rows,
        total: totalCoupons,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCoupons / limit)
    });
});

//this APi for add coupon in admin panel
exports.addCoupon = catchAsync(async (req, res) => {
    const { code, discount_type, discount_value, min_order_value, expiry_date, usage_limit } = req.body;
    const result = await pool.query(
        "INSERT INTO coupons (code, type, value, min_cart_value, expiry_date, usage_limit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [code, discount_type, discount_value, min_order_value, expiry_date, usage_limit || 100]
    );
    await logActivity(req.user.id, 'Created Coupon', getIpAddress(req), { code });
    res.status(201).json({ status: "success", coupon: result.rows[0] });
});

//this APi for delete coupon in admin panel
exports.deleteCoupon = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM coupons WHERE coupon_id = $1", [id]);
    await logActivity(req.user.id, 'Deleted Coupon', getIpAddress(req), { coupon_id: id });
    res.status(200).json({ status: "success", message: "Coupon deleted" });
});

//this APi for get all banners in admin panel
exports.getBanners = catchAsync(async (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM banners ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const countQuery = `SELECT COUNT(*) FROM banners`;

    const result = await pool.query(query, [parseInt(limit), parseInt(offset)]);
    const countResult = await pool.query(countQuery);
    const totalBanners = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        banners: result.rows,
        total: totalBanners,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalBanners / limit)
    });
});

//this APi for add banner in admin panel
exports.addBanner = catchAsync(async (req, res) => {
    const { title, description, image_url, position, display_order, is_active } = req.body;
    const result = await pool.query(
        "INSERT INTO banners (title, description, image_url, position, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, description, image_url, position, display_order || 0, is_active !== false]
    );
    await logActivity(req.user.id, 'Created Banner', getIpAddress(req), { title });
    res.status(201).json({ status: "success", banner: result.rows[0] });
});

//this APi for delete banner in admin panel
exports.deleteBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM banners WHERE banner_id = $1", [id]);
    await logActivity(req.user.id, 'Deleted Banner', getIpAddress(req), { banner_id: id });
    res.status(200).json({ status: "success", message: "Banner deleted" });
});

//this APi for update banner in admin panel
exports.updateBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, position, display_order, is_active } = req.body;

    const result = await pool.query(
        `UPDATE banners 
            SET title = $1, description = $2, image_url = $3, 
                position = $4, display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
            WHERE banner_id = $7 
            RETURNING *`,
        [title, description, image_url, position, display_order, is_active !== false, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Banner not found" });
    }

    await logActivity(req.user.id, 'Updated Banner', getIpAddress(req), { banner_id: id, title });
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

//this APi for get all support tickets in admin panel
exports.getTickets = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT t.*, u.full_name, u.email 
        FROM support_tickets t 
        JOIN users u ON t.user_id = u.user_id
    `;
    let countQuery = `SELECT COUNT(*) FROM support_tickets t`;
    let params = [];
    let conditions = [];

    if (status && status !== 'All') {
        conditions.push(`t.status = $${params.length + 1}`);
        params.push(status);
    }

    if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
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

//this APi for update support ticket status in admin panel
exports.updateTicketStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;

    let result;
    if (reply) {
        result = await pool.query(
            "UPDATE support_tickets SET status = $1, message = CONCAT(message, E'\n\n--- Admin Reply: ' || NOW()::text || ' ---\n' || $2), updated_at = NOW() WHERE ticket_id = $3 RETURNING *",
            [status, reply, id]
        );
    } else {
        result = await pool.query(
            "UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE ticket_id = $2 RETURNING *",
            [status, id]
        );
    }

    if (result.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Ticket not found" });
    }
    await logActivity(req.user.id, reply ? 'Replied to Ticket' : 'Updated Ticket Status', getIpAddress(req), { ticket_id: id, status });
    res.status(200).json({ status: "success", ticket: result.rows[0] });
});

//this APi for get all reviews in admin panel
exports.getAllReviews = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT r.*, u.full_name, p.title as product_title, p.thumbnail as product_image
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN products p ON r.product_id = p.product_id
    `;
    let countQuery = `SELECT COUNT(*) FROM reviews r`;
    let params = [];
    let conditions = [];

    if (status && status !== 'All') {
        conditions.push(`r.status = $${params.length + 1}`);
        params.push(status);
    }

    if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const result = await pool.query(query, finalParams);
    const countResult = await pool.query(countQuery, params);
    const totalReviews = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        reviews: result.rows,
        total: totalReviews,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalReviews / limit)
    });
});

//this APi for update review status in admin panel
exports.updateReviewStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;
    const result = await pool.query(
        "UPDATE reviews SET status = $1, admin_reply = $2 WHERE review_id = $3 RETURNING *",
        [status, reply || null, id]
    );
    await logActivity(req.user.id, reply ? 'Replied to Review' : 'Updated Review Status', getIpAddress(req), { review_id: id, status });
    res.status(200).json({ status: "success", review: result.rows[0] });
});

//this APi for add shipping option in admin panel
exports.addShippingOption = catchAsync(async (req, res) => {
    const { name, cost, estimated_days } = req.body;
    const result = await pool.query(
        "INSERT INTO shipping_options (name, cost, estimated_days) VALUES ($1, $2, $3) RETURNING *",
        [name, cost, estimated_days]
    );
    await logActivity(req.user.id, 'Added Shipping Option', getIpAddress(req), { name, cost });
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
    await logActivity(req.user.id, 'Updated Shipping Option', getIpAddress(req), { shipping_id: id, name });
    res.status(200).json({ status: "success", option: result.rows[0] });
});

//this APi for delete shipping option in admin panel
exports.deleteShippingOption = catchAsync(async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM shipping_options WHERE shipping_id = $1", [id]);
    await logActivity(req.user.user_id, 'Deleted Shipping Option', getIpAddress(req), { shipping_id: id });
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
    await logActivity(req.user.user_id, 'Updated Order Shipping', getIpAddress(req), { order_id: id, tracking_number });
    res.status(200).json({ status: "success", order: result.rows[0] });
});

//this APi for get transaction logs in admin panel
exports.getTransactionLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT order_id, user_id, total_amount, payment_id, payment_method, status, created_at
        FROM orders
        WHERE payment_id IS NOT NULL OR status = 'paid' OR status = 'Delivered'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `;
    const countQuery = `
        SELECT COUNT(*) FROM orders
        WHERE payment_id IS NOT NULL OR status = 'paid' OR status = 'Delivered'
    `;

    const result = await pool.query(query, [parseInt(limit), parseInt(offset)]);
    const countResult = await pool.query(countQuery);
    const totalTransactions = parseInt(countResult.rows[0].count);

    res.status(200).json({
        status: "success",
        transactions: result.rows,
        total: totalTransactions,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalTransactions / limit)
    });
});

exports.getStripePaymentDetails = catchAsync(async (req, res) => {
    const { paymentId } = req.params;

    if (!paymentId || paymentId === 'PENDING' || paymentId === 'TEST_PAYMENT') {
        return res.status(400).json({ status: "error", message: "Invalid or missing Payment ID" });
    }

    try {
        // Retrieve the PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

        // Retrieve the latest charge to get receipt URL and other details
        let charge = null;
        if (paymentIntent.latest_charge) {
            charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        }

        res.status(200).json({
            status: "success",
            payment: paymentIntent,
            charge: charge
        });
    } catch (error) {
        console.error("Stripe Fetch Error:", error);
        return res.status(400).json({ status: "error", message: error.message });
    }
});

exports.syncStripeTransaction = catchAsync(async (req, res) => {
    const { paymentId, orderId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ status: "error", message: "Payment ID is required" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

        let receiptUrl = null;
        let paymentMethodType = 'card';

        if (paymentIntent.latest_charge) {
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
            receiptUrl = charge.receipt_url;
            paymentMethodType = charge.payment_method_details?.type || 'card';
        }

        // Update Order directly if orderId is provided, otherwise just return info
        if (!orderId) {
            return res.status(400).json({
                status: "error",
                message: "Order ID is required to sync transaction to an order",
                scannedPayment: {
                    paymentId,
                    amount: paymentIntent.amount / 100,
                    status: paymentIntent.status
                }
            });
        }

        const result = await pool.query(
            `UPDATE orders 
             SET status = 'paid',
                 payment_method = $1,
                 receipt_url = $2,
                 payment_raw = $3,
                 payment_id = $4
             WHERE order_id = $5 
             RETURNING *`,
            [
                paymentMethodType,
                receiptUrl,
                JSON.stringify(paymentIntent),
                paymentId,
                orderId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "error", message: "Order not found or update failed" });
        }

        res.status(200).json({
            status: "success",
            message: "Transaction synced to order successfully",
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Sync Error:", error);
        return res.status(400).json({ status: "error", message: error.message });
    }
});