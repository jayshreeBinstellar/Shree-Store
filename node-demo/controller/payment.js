const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');
const catchAsync = require('../utils/catchAsync');
const couponUtils = require('../utils/couponUtils');

exports.createCheckoutSession = catchAsync(async (req, res) => {
    const { items, addressId, shippingId, couponCode } = req.body;
    const userId = req.user.id;
    const TAX_RATE = 0.18;

    // Calculate Items Subtotal & Item-Level Discounts
    let grossSubtotal = 0;
    let itemSavings = 0;

    const processedItems = items.map(item => {
        const price = parseFloat(item.price);
        const qty = parseInt(item.qty);
        const discountPercent = parseFloat(item.discountPercentage || item.discount || 0);

        const discountAmount = (price * discountPercent) / 100;
        const effectivePrice = price - discountAmount;

        grossSubtotal += price * qty;
        itemSavings += discountAmount * qty;

        return {
            ...item,
            price: price,
            qty: qty,
            discountPercent: discountPercent,
            effectivePrice: effectivePrice
        };
    });

    const netSubtotal = grossSubtotal - itemSavings;

    // Fetch & Calculate Shipping
    let shippingCost = 0;
    if (shippingId) {
        const shipRes = await pool.query("SELECT cost FROM shipping_options WHERE shipping_id = $1", [shippingId]);
        if (shipRes.rows.length > 0) {
            shippingCost = parseFloat(shipRes.rows[0].cost);
        }
    }

    // Check & Calculate Coupon Discount
    let couponDiscount = 0;
    let couponId = null;

    if (couponCode) {
        const couponRes = await pool.query("SELECT * FROM coupons WHERE code = $1", [couponCode]);
        if (couponRes.rows.length > 0) {
            const coupon = couponRes.rows[0];
            const discountResult = couponUtils.calculateDiscount(coupon, netSubtotal, processedItems);

            if (discountResult.valid) {
                couponDiscount = discountResult.discountAmount;
                couponId = coupon.coupon_id;
            }
        }
    }

    // Safety check: Discount cannot exceed subtotal
    if (couponDiscount > netSubtotal) couponDiscount = netSubtotal;

    //  Calculate Tax & Final Total
    // Logic matches frontend: (Subtotal - ItemSavings - CouponDiscount) * TaxRate
    const taxableAmount = Math.max(0, netSubtotal - couponDiscount);
    const taxAmount = taxableAmount * TAX_RATE;

    // Final Payable: Taxable + Tax + Shipping
    const totalAmount = taxableAmount + taxAmount + shippingCost;


    // Store order data in session metadata instead of creating order now
    const orderData = {
        userId,
        items: processedItems,
        netSubtotal,
        taxAmount,
        shippingCost,
        couponDiscount,
        couponId,
        shippingId,
        totalAmount,
        addressId
    };

    // Create Stripe Session
    // We use a single line item to ensure the charge amount matches the calculated total exactly.
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `Purchase of ${items.length} items`,
                    description: `Purchase of ${items.length} items. Includes Shipping & Tax.`,
                    // Optional: Add images from first few items
                    images: items.slice(0, 3).map(i => i.thumbnail),
                },
                unit_amount: Math.round(totalAmount * 100), // Stripe expects cents
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url:  `http://192.168.0.134:3002/main/dashboard`,
        cancel_url:  `http://192.168.0.134:3002/main/dashboard`,
        metadata: {
            orderData: JSON.stringify(orderData)
        }
    });

    res.status(200).json({ id: session.id, url: session.url });
});

exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // if (event.type === 'checkout.session.completed') {
    //     const session = event.data.object;
    //     const orderData = JSON.parse(session.metadata.orderData);

    //     console.log(`[Webhook] checkout.session.completed - sessionId: ${session.id}, userId: ${orderData.userId}`);

    //     const client = await pool.connect();

    //     try {
    //         await client.query('BEGIN');

    //         // Create the order now that payment is successful
    //         const orderResult = await client.query(
    //             "INSERT INTO orders (user_id, subtotal, tax_amount, shipping_fee, discount_amount, coupon_id, shipping_id, total_amount, status, address_id, payment_method, payment_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Paid', $9, 'Stripe', $10, NOW()) RETURNING order_id",
    //             [
    //                 orderData.userId,
    //                 orderData.netSubtotal,
    //                 orderData.taxAmount,
    //                 orderData.shippingCost,
    //                 orderData.couponDiscount,
    //                 orderData.couponId,
    //                 orderData.shippingId,
    //                 orderData.totalAmount,
    //                 orderData.addressId,
    //                 session.payment_intent
    //             ]
    //         );
    //         const orderId = orderResult.rows[0].order_id;

    //         // Insert Order Items
    //         for (const item of orderData.items) {
    //             await client.query(
    //                 "INSERT INTO order_items (order_id, product_id, quantity, price, discount, effective_price, title, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    //                 [orderId, item.id, item.qty, item.price, item.discountPercent, item.effectivePrice, item.title, item.thumbnail]
    //             );
    //         }

    //         // Deduct Stock
    //         for (const item of orderData.items) {
    //             const stockRes = await client.query("SELECT stock FROM products WHERE product_id = $1 FOR UPDATE", [item.id]);
    //             if (stockRes.rows.length === 0) throw new Error(`Product ${item.id} not found`);

    //             const currentStock = stockRes.rows[0].stock;
    //             if (currentStock < item.qty) {
    //                 throw new Error(`Insufficient stock for product: ${item.title}`);
    //             }

    //             await client.query("UPDATE products SET stock = stock - $1 WHERE product_id = $2", [item.qty, item.id]);
    //         }

    //         // Increment Coupon Usage
    //         if (orderData.couponId) {
    //             await client.query("UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1", [orderData.couponId]);
    //         }

    //         // Clear User Cart
    //         await client.query("DELETE FROM cart WHERE user_id = $1", [orderData.userId]);

    //         await client.query('COMMIT');

    //         console.log(`[Webhook] Order ${orderId} created and payment verified successfully`);
    //     } catch (error) {
    //         await client.query('ROLLBACK');
    //         console.error(`[Webhook] Error processing payment for session ${session.id}:`, error.message);

    //         // In a real application, you might want to trigger a refund here
    //     } finally {
    //         client.release();
    //     }
    // }

    if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log("[Webhook] Session completed:", session.id);

    // 🛑 Metadata safety check
    if (!session.metadata || !session.metadata.orderData) {
        console.error("[Webhook] Missing orderData in metadata");
        return res.json({ received: true });
    }

    let orderData;
    try {
        orderData = JSON.parse(session.metadata.orderData);
    } catch (err) {
        console.error("[Webhook] Invalid JSON in metadata:", err);
        return res.json({ received: true });
    }

    console.log("[Webhook] Parsed orderData:", orderData);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 🛑 Idempotency check (Stripe may send event multiple times)
        const existingOrder = await client.query(
            "SELECT order_id FROM orders WHERE payment_id = $1",
            [session.payment_intent]
        );

        if (existingOrder.rows.length > 0) {
            console.log("[Webhook] Order already exists. Skipping insert.");
            await client.query('COMMIT');
            return res.json({ received: true });
        }

        // 🛑 Validate required fields
        if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
            throw new Error("Invalid order data received");
        }

        // ✅ Insert Order
        const orderResult = await client.query(
            `INSERT INTO orders 
            (user_id, subtotal, tax_amount, shipping_fee, discount_amount, coupon_id, shipping_id, total_amount, status, address_id, payment_method, payment_id, created_at) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Paid',$9,'Stripe',$10,NOW()) 
            RETURNING order_id`,
            [
                orderData.userId,
                orderData.netSubtotal,
                orderData.taxAmount,
                orderData.shippingCost,
                orderData.couponDiscount,
                orderData.couponId,
                orderData.shippingId,
                orderData.totalAmount,
                orderData.addressId,
                session.payment_intent
            ]
        );

        const orderId = orderResult.rows[0].order_id;
        console.log("[Webhook] Order created:", orderId);

        // ✅ Insert Items
        for (const item of orderData.items) {
            await client.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price, discount, effective_price, title, thumbnail) 
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [orderId, item.id, item.qty, item.price, item.discountPercent, item.effectivePrice, item.title, item.thumbnail]
            );
        }

        // ✅ Deduct Stock
        for (const item of orderData.items) {
            const stockRes = await client.query(
                "SELECT stock FROM products WHERE product_id = $1 FOR UPDATE",
                [item.id]
            );

            if (stockRes.rows.length === 0) throw new Error(`Product ${item.id} not found`);

            if (stockRes.rows[0].stock < item.qty) {
                throw new Error(`Insufficient stock for ${item.title}`);
            }

            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE product_id = $2",
                [item.qty, item.id]
            );
        }

        // ✅ Coupon usage
        if (orderData.couponId) {
            await client.query(
                "UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1",
                [orderData.couponId]
            );
        }

        // ✅ Clear Cart
        await client.query("DELETE FROM cart WHERE user_id = $1", [orderData.userId]);

        await client.query('COMMIT');

        console.log(`[Webhook] SUCCESS: Order ${orderId} committed`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("[Webhook] FULL ERROR:", error); // ← Important!
    } finally {
        client.release();
    }
}


    res.json({ received: true });
};
