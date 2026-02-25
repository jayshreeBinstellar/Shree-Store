const pool = require('../db');
const catchAsync = require('../utils/catchAsync');
const couponUtils = require('../utils/couponUtils');
const { finalizeOrder } = require('../utils/orderLifecycle');

exports.getProducts = catchAsync(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        category,
        search,
        minPrice,
        maxPrice,
        rating,
        stock
    } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM products";
    let countQuery = "SELECT COUNT(*) FROM products";
    let params = [];
    let conditions = [];

    conditions.push(`is_active = true`);
    conditions.push(`is_soft_deleted = false`);

    if (category) {
        const categories = category.split(',');
        conditions.push(`category = ANY($${params.length + 1})`);
        params.push(categories);
    }

    if (search) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
    }

    if (minPrice) {
        conditions.push(`price >= $${params.length + 1}`);
        params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
        conditions.push(`price <= $${params.length + 1}`);
        params.push(parseFloat(maxPrice));
    }

    if (rating) {
        conditions.push(`rating >= $${params.length + 1}`);
        params.push(parseFloat(rating));
    }

    if (stock === 'true') {
        conditions.push(`stock > 0`);
    } else if (stock === 'false') {
        conditions.push(`stock = 0`);
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


exports.getProductById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({
            status: "error",
            message: "Product not found"
        });
    }
    res.status(200).json({
        status: "success",
        product: result.rows[0]
    });
});

exports.getRelatedProducts = catchAsync(async (req, res) => {
    const { id } = req.params;
    // First get the category of the product
    const productResult = await pool.query("SELECT category FROM products WHERE product_id = $1", [id]);
    if (productResult.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }
    const category = productResult.rows[0].category;

    // Then get related products (excluding current one)
    const relatedResult = await pool.query(
        "SELECT * FROM products WHERE category = $1 AND product_id != $2 LIMIT 4",
        [category, id]
    );

    res.status(200).json({
        status: "success",
        products: relatedResult.rows
    });
});

exports.createOrder = catchAsync(async (req, res) => {
    const { items, addressId, shippingId, couponCode } = req.body;
    const userId = req.user.id;
    const TAX_RATE = 0.18;

    if (!items || !items.length) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Validate items
        // Fetch fresh product data to ensure prices are correct (removed FOR UPDATE lock as we are not deducting stock yet)
        const productIds = items.map(item => item.id);
        const productsResult = await client.query(
            "SELECT * FROM products WHERE product_id = ANY($1)",
            [productIds]
        );

        const dbProductsMap = new Map();
        productsResult.rows.forEach(p => dbProductsMap.set(p.product_id, p));

        const invalidProducts = items.filter(item => !dbProductsMap.has(item.id));
        if (invalidProducts.length > 0) {
            throw new Error(`One or more products not found`);
        }

        const processedItems = items.map(item => {
            const dbProduct = dbProductsMap.get(item.id);
            // Optional: You might still want to check if stock is > 0 to prevent ordering OOS items
            if (dbProduct.stock < item.qty) {
                throw new Error(`Insufficient stock for product: ${dbProduct.title}`);
            }
            return {
                ...item,
                price: parseFloat(dbProduct.price), // Use DB price for security
                title: dbProduct.title,
                thumbnail: dbProduct.thumbnail,
                qty: parseInt(item.qty)
            };
        });

        // 2. Calculate subtotal
        let subtotal = 0;
        processedItems.forEach(item => {
            subtotal += item.price * item.qty;
        });

        // Calculate Shipping
        let shippingCost = 0;
        if (shippingId) {
            const shipRes = await client.query("SELECT cost FROM shipping_options WHERE shipping_id = $1", [shippingId]);
            if (shipRes.rows.length > 0) {
                shippingCost = parseFloat(shipRes.rows[0].cost);
            }
        }

        // 3. Validate coupon & 4. Calculate discount
        let couponDiscount = 0;
        let couponId = null;

        if (couponCode) {
            // Find coupon
            const couponRes = await client.query("SELECT * FROM coupons WHERE code = $1", [couponCode]);
            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];

                // Validate and Calculate
                const discountResult = couponUtils.calculateDiscount(coupon, subtotal, processedItems);

                if (discountResult.valid) {
                    couponDiscount = discountResult.discountAmount;
                    couponId = coupon.coupon_id;
                }
            }
        }

        if (couponDiscount > subtotal) couponDiscount = subtotal;

        // Calculate Tax and Final Total
        const taxableAmount = subtotal - couponDiscount;
        const taxAmount = taxableAmount * TAX_RATE;
        const totalAmount = taxableAmount + taxAmount + shippingCost;

        //Insert order with PENDING status
        const orderResult = await client.query(
            "INSERT INTO orders (user_id, subtotal, tax_amount, shipping_fee, discount_amount, coupon_id, shipping_id, total_amount, status, address_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9, NOW()) RETURNING order_id",
            [userId, subtotal, taxAmount, shippingCost, couponDiscount, couponId, shippingId, totalAmount, addressId]
        );
        const { order_id: orderId } = orderResult.rows[0];

        //Insert order items
        for (const item of processedItems) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price, discount, effective_price, title, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [
                    orderId,
                    item.id,
                    item.qty,
                    item.price,
                    0,
                    item.price,
                    item.title,
                    item.thumbnail
                ]
            );
        }


        //Commit transaction
        await client.query('COMMIT');

        res.status(201).json({
            status: "success",
            message: "Order placed successfully",
            orderId,
            breakdown: {
                subtotal,
                shipping: shippingCost,
                discount: couponDiscount,
                tax: taxAmount,
                total: totalAmount
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating order:", error);
        if (error.message.includes("Insufficient stock") || error.message.includes("not found")) {
            return res.status(400).json({ status: "error", message: error.message });
        }
        throw error;
    } finally {
        client.release();
    }
});


exports.getOrderHistory = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT o.order_id, o.created_at, o.subtotal, o.tax_amount, o.shipping_fee, o.discount_amount, o.coupon_id, o.total_amount, o.status, u.full_name, u.email,
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
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE o.user_id = $1
        GROUP BY o.order_id, u.full_name, u.email
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = `SELECT COUNT(*) FROM orders WHERE user_id = $1`;

    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);
    const countResult = await pool.query(countQuery, [userId]);
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

// Reviews
exports.addProductReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
        return res.status(400).json({ message: "Rating and comment are required" });
    }

    const result = await pool.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
        [id, userId, rating, comment]
    );

    // Update product average rating
    await pool.query(
        "UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = $1) WHERE product_id = $1",
        [id]
    );

    res.status(201).json({
        status: "success",
        message: "Review added successfully",
        review: result.rows[0]
    });
});

exports.getProductReviews = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT r.*, u.full_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.user_id 
        WHERE r.product_id = $1 
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = `SELECT COUNT(*) FROM reviews WHERE product_id = $1`;

    const result = await pool.query(query, [id, parseInt(limit), parseInt(offset)]);
    const countResult = await pool.query(countQuery, [id]);
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

// Wishlist
exports.getWishlist = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await pool.query(
        `SELECT p.* 
            FROM wishlist w 
            JOIN products p ON w.product_id = p.product_id 
            WHERE w.user_id = $1`,
        [userId]
    );
    res.status(200).json({
        status: "success",
        wishlist: result.rows
    });
});

exports.addToWishlist = catchAsync(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    await pool.query(
        "INSERT INTO wishlist (user_id, product_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
        [userId, productId]
    );
    res.status(201).json({
        status: "success",
        message: "Added to wishlist"
    });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
        "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
        [userId, id]
    );
    res.status(200).json({
        status: "success",
        message: "Removed from wishlist"
    });
});



exports.validateCoupon = catchAsync(async (req, res) => {
    const { code, cartItems, cartTotal } = req.body;

    const couponResult = await pool.query("SELECT * FROM coupons WHERE code = $1", [code]);
    if (couponResult.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Invalid coupon code" });
    }

    const coupon = couponResult.rows[0];
    const validation = couponUtils.calculateDiscount(coupon, cartTotal, cartItems);

    if (!validation.valid) {
        return res.status(400).json({ status: "error", message: validation.reason });
    }

    const { discountAmount, appliedToDesc } = validation;

    res.status(200).json({
        status: "success",
        valid: true,
        coupon: {
            id: coupon.coupon_id,
            code: coupon.code,
            discountAmount: discountAmount,
            type: coupon.type,
            description: appliedToDesc
        }
    });
});

exports.getBanners = catchAsync(async (req, res) => {
    const result = await pool.query("SELECT * FROM banners ORDER BY position ASC, created_at DESC");
    res.status(200).json({ status: "success", banners: result.rows });
});



exports.getCart = catchAsync(async (req, res) => {
    const userId = req.user.id;
    // Join with products to get current details
    const query = `
        SELECT 
            c.cart_id, 
            c.quantity as qty, 
            p.product_id as id, 
            p.title, 
            p.price, 
            p.thumbnail, 
            p.stock, 
            p.discount_price as "discountPercentage", 
            p.category, 
            p.rating
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json({ status: "success", cart: result.rows });
});

exports.addToCart = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    // Check stock
    const productRes = await pool.query("SELECT stock FROM products WHERE product_id = $1", [productId]);
    if (productRes.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }
    const stock = productRes.rows[0].stock;

    // Check existing cart item
    const existing = await pool.query("SELECT * FROM cart WHERE user_id = $1 AND product_id = $2", [userId, productId]);

    let newQty = parseInt(quantity);
    if (existing.rows.length > 0) {
        newQty += existing.rows[0].quantity;
    }

    if (newQty > stock) {
        return res.status(400).json({ message: "Insufficient stock" });
    }

    if (existing.rows.length > 0) {
        await pool.query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3", [newQty, userId, productId]);
    } else {
        await pool.query("INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)", [userId, productId, newQty]);
    }

    res.status(200).json({ status: "success", message: "Added to cart" });
});

exports.updateCartItem = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (quantity <= 0) {
        await pool.query("DELETE FROM cart WHERE user_id = $1 AND product_id = $2", [userId, productId]);
        return res.status(200).json({ status: "success", message: "Item removed" });
    }

    // Check stock
    const productRes = await pool.query("SELECT stock FROM products WHERE product_id = $1", [productId]);
    if (productRes.rows.length === 0) return res.status(404).json({ message: "Product not found" });

    if (quantity > productRes.rows[0].stock) {
        return res.status(400).json({ message: "Insufficient stock" });
    }

    await pool.query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3", [quantity, userId, productId]);
    res.status(200).json({ status: "success", message: "Cart updated" });
});

exports.removeFromCart = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // product_id

    await pool.query("DELETE FROM cart WHERE user_id = $1 AND product_id = $2", [userId, id]);
    res.status(200).json({ status: "success", message: "Item removed from cart" });
});
