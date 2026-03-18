
//this finalizeOrder function is used to finalize the order after payment is successful. it will deduct the stock, increment coupon usage, and clear user cart. it is used in both webhook and verifyPayment endpoint.
exports.finalizeOrder = async (client, orderId, userId, couponId) => {
    //Get Order Items
    const itemsRes = await client.query("SELECT * FROM order_items WHERE order_id = $1", [orderId]);
    const orderItems = itemsRes.rows;

    //Deduct Stock (Strict Check)
    for (const item of orderItems) {
        const stockRes = await client.query("SELECT stock, title FROM products WHERE product_id = $1 FOR UPDATE", [item.product_id]);
        if (stockRes.rows.length === 0) throw new Error(`Product ${item.product_id} not found`);

        const currentStock = stockRes.rows[0].stock;
        if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${stockRes.rows[0].title}`);
        }

        await client.query("UPDATE products SET stock = stock - $1 WHERE product_id = $2", [item.quantity, item.product_id]);
    }

    //Increment Coupon Usage
    if (couponId) {
        await client.query("UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1", [couponId]);
    }

    //Clear User Cart
    if (userId) {
        await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);
    }
};


