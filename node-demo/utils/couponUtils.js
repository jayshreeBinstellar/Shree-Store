exports.calculateDiscount = (coupon, cartTotal, cartItems) => {
    const now = new Date();

    // Basic validation
    if (new Date(coupon.expiry_date) < now) {
        return { valid: false, reason: 'Coupon expired' };
    }

    if (cartTotal < parseFloat(coupon.min_cart_value)) {
        return { valid: false, reason: `Minimum cart value of $${coupon.min_cart_value} required` };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, reason: 'Coupon usage limit reached' };
    }

    let discountAmount = 0;
    let appliedToDesc = "";

    if (coupon.type === 'cart_fixed') {
        discountAmount = parseFloat(coupon.value);
        appliedToDesc = "Cart Discount";
    } else if (coupon.type === 'cart_percent') {
        discountAmount = (cartTotal * parseFloat(coupon.value)) / 100;
        appliedToDesc = `${coupon.value}% off Cart`;
    } else if (coupon.type === 'item_fixed' || coupon.type === 'item_percent') {
        const targetId = coupon.target_product_id;
        // Match by id or product_id
        const targetItem = cartItems.find(i => i.id == targetId || i.product_id == targetId);

        if (!targetItem) {
            return { valid: false, reason: 'Coupon not applicable to items in cart' };
        }

        const itemQty = parseInt(targetItem.qty);

        // Use effective price if available, otherwise price
        const itemPrice = targetItem.effectivePrice !== undefined ? targetItem.effectivePrice : parseFloat(targetItem.price);


        if (coupon.type === 'item_fixed') {
            discountAmount = parseFloat(coupon.value) * itemQty;
        } else {
            // Percent off the effective price of the item
            discountAmount = (itemPrice * itemQty * parseFloat(coupon.value)) / 100;
        }
        appliedToDesc = "Item Discount";
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    return {
        valid: true,
        discountAmount,
        appliedToDesc,
        couponId: coupon.coupon_id
    };
};
