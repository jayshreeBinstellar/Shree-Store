const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');
const catchAsync = require('../utils/catchAsync');
const couponUtils = require('../utils/couponUtils');
const { finalizeOrder } = require('../utils/orderLifecycle');

//read env file
require('dotenv').config();
const BASE_URL = process.env.BASE_URL;

exports.createCheckoutSession = catchAsync(async (req, res) => {
  const { items, addressId, shippingId, couponCode } = req.body;
  const userId = req.user.id;

  // Default tax rate in case DB fails
  let TAX_RATE = 0.18;

  if (!items || !items.length) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const client = await pool.connect();
  const hostUrl = BASE_URL;
  const getImageUrl = (path) => {
    if (!path) return [];
    if (path.startsWith('http')) return [path];
    return [`${hostUrl}${path}`];
  };

  try {
    //Get Tax Rate from Store Settings
    const settingsRes = await client.query("SELECT tax_percent FROM store_settings LIMIT 1");
    if (settingsRes.rows.length > 0) {
      TAX_RATE = Number.parseFloat(settingsRes.rows[0].tax_percent) / 100;
    }

    //Validate items & prices from DB
    const productIds = items.map(item => item.id);
    const productsResult = await client.query(
      "SELECT * FROM products WHERE product_id = ANY($1)",
      [productIds]
    );

    const dbProductsMap = new Map();
    productsResult.rows.forEach(p => dbProductsMap.set(p.product_id, p));

    //Check if all items exist
    const invalidProducts = items.filter(item => !dbProductsMap.has(item.id));
    if (invalidProducts.length > 0) {
      throw new Error(`One or more products not found`);
    }

    //Process items with db data
    const processedItems = items.map(item => {
      const dbProduct = dbProductsMap.get(item.id);

      if (dbProduct.stock < item.qty) {
        throw new Error(`Insufficient stock for product: ${dbProduct.title}`);
      }

      const price = parseFloat(dbProduct.price);
      const discountPercent = parseFloat(dbProduct.discount_price || 0);

      return {
        id: item.id,
        qty: parseInt(item.qty),
        price: price,
        title: dbProduct.title,
        thumbnail: dbProduct.thumbnail,
        discountPercent: discountPercent
      };
    });

    //Calculate Subtotal
    let subtotal = 0;
    processedItems.forEach(item => {
      subtotal += item.price * item.qty;
    });

    //Shipping
    let shippingCost = 0;
    if (shippingId) {
      const shipRes = await client.query("SELECT cost FROM shipping_options WHERE shipping_id = $1", [shippingId]);
      if (shipRes.rows.length > 0) {
        shippingCost = parseFloat(shipRes.rows[0].cost);
      }
    }

    //Coupon
    let couponDiscount = 0;
    let couponId = null;

    if (couponCode) {
      const couponRes = await client.query("SELECT * FROM coupons WHERE code = $1", [couponCode]);
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        const discountResult = couponUtils.calculateDiscount(coupon, subtotal, processedItems);
        if (discountResult.valid) {
          couponDiscount = discountResult.discountAmount;
          couponId = coupon.coupon_id;
        }
      }
    }

    if (couponDiscount > subtotal) couponDiscount = subtotal;

    //Calculate Final Totals
    const taxableAmount = subtotal - couponDiscount;
    const taxAmount = taxableAmount * TAX_RATE;
    const totalAmount = taxableAmount + taxAmount + shippingCost;

    // We send essential data to Stripe so we can reconstruct the order later
    const itemsMinified = processedItems.map(i => ({
      id: i.id,
      q: i.qty,
      p: i.price,
      d: i.discountPercent,
      t: i.title.substring(0, 20), // Truncate title to save space
    }));

    const itemsJson = JSON.stringify(itemsMinified);
    if (itemsJson.length > 500) {
      throw new Error("Order too large to process via this method. Please reduce cart size.");
    }

    const clientUrl = req.headers.origin || 'http://localhost:3002';

    const successUrl = `${clientUrl}/main/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientUrl}/main/cart`;
    const productData = {
      name: `Shree Store Purchase`,
      images: getImageUrl(processedItems[0].thumbnail),
    }
    console.log(productData);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        addressId: addressId ? addressId.toString() : "",
        shippingId: shippingId ? shippingId.toString() : "",
        couponId: couponId ? couponId.toString() : "",
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        shippingCost: shippingCost.toString(),
        discountAmount: couponDiscount.toString(),
        totalAmount: totalAmount.toString(),
        items: itemsJson
      }
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(400).json({ message: err.message || "Checkout failed" });
  } finally {
    client.release();
  }
});


//Helper to process success (Used by Webhook and VerifyPayment)
const processSuccessfulPayment = async (session) => {
  const { userId, items, addressId, shippingId, couponId, subtotal, taxAmount, shippingCost, discountAmount, totalAmount } = session.metadata;
  const paymentIntentId = session.payment_intent;

  if (!items || !userId) {
    throw new Error("Missing metadata in Stripe Session");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //Idempotency Check
    const existingOrder = await client.query("SELECT order_id FROM orders WHERE payment_id = $1", [paymentIntentId]);
    if (existingOrder.rows.length > 0) {
      await client.query("COMMIT");
      return { status: "already_processed", orderId: existingOrder.rows[0].order_id };
    }

    //Deserialize Items
    const orderItems = JSON.parse(items);

    //Insert Order (Directly as paid)
    const insertOrderQuery = `
            INSERT INTO orders 
            (user_id, subtotal, tax_amount, shipping_fee, discount_amount, coupon_id, shipping_id, total_amount, status, address_id, created_at, payment_id, payment_method)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid', $9, NOW(), $10, 'Stripe')
            RETURNING order_id
        `;

    const orderValues = [
      userId,
      parseFloat(subtotal),
      parseFloat(taxAmount),
      parseFloat(shippingCost),
      parseFloat(discountAmount),
      couponId || null,
      shippingId || null,
      parseFloat(totalAmount),
      addressId || null,
      paymentIntentId
    ];

    const orderResult = await client.query(insertOrderQuery, orderValues);
    const orderId = orderResult.rows[0].order_id;

    // Insert Order Items
    for (const item of orderItems) {
      const prodRes = await client.query("SELECT title, thumbnail FROM products WHERE product_id = $1", [item.id]);
      const prod = prodRes.rows[0] || { title: 'Unknown', thumbnail: '' };

      const price = parseFloat(item.p);
      const discount = parseFloat(item.d);
      const discountAmt = (price * discount) / 100;
      const effectivePrice = price - discountAmt;

      await client.query(
        `INSERT INTO order_items
                 (order_id, product_id, quantity, price, discount, effective_price, title, thumbnail)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          item.id,
          item.q,
          price,
          discount,
          effectivePrice,
          prod.title,
          prod.thumbnail
        ]
      );
    }

    //Finalize (Stock, Cart, Coupon)
    await finalizeOrder(client, orderId, userId, couponId);

    await client.query("COMMIT");
    return { status: "created", orderId };

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error processing successful payment:", err);
    throw err;
  } finally {
    client.release();
  }
};


exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    //Only process paid sessions
    if (session.payment_status === "paid") {
      try {
        const result = await processSuccessfulPayment(session);
        console.log(`[Webhook] Order processed: ${result.status} (Order ID: ${result.orderId})`);
      } catch (error) {
        console.error("[Webhook] Failed to process payment:", error);
      }
    }
  }

  res.json({ received: true });
};


exports.verifyPayment = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { sessionId, status } = req.body;

  console.log(`[verifyPayment] START - userId: ${userId}, sessionId: ${sessionId}`);

  if (status !== 'success') {
    return res.status(200).json({ status: "success", message: "Verification skipped" });
  }

  if (!sessionId) {
    return res.status(400).json({ status: "error", message: "Missing Session ID" });
  }

  try {
    // console.log(`[verifyPayment] Retrieving Stripe Session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ status: "error", message: "Payment not completed" });
    }

    // console.log(`[verifyPayment] Session paid. Processing Order Creation...`);
    const result = await processSuccessfulPayment(session);

    res.status(200).json({
      status: "success",
      message: "Payment verified, order created",
      orderId: result.orderId
    });

  } catch (error) {
    console.error("[verifyPayment] CRITICAL ERROR:", error);
    res.status(400).json({ status: "error", message: error.message });
  }
});
