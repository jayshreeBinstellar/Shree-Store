/**
 * Example Implementation: How to Add Audit Logging to Admin Controllers
 * 
 * This file shows best practices for integrating audit logging into
 * your existing admin controller functions.
 */

const { logActivity, getIpAddress } = require('../utils/auditLogger');

// ============================================================================
// EXAMPLE 1: Product Management
// ============================================================================

/**
 * Example: Log product creation
 */
exports.addProductWithLogging = catchAsync(async (req, res) => {
    const { title, description, price, old_price, thumbnail, stock, category, images } = req.body;
    
    // Perform the operation
    const result = await pool.query(
        "INSERT INTO products (title, description, price, old_price, thumbnail, stock, category, images, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0) RETURNING *",
        [title, description, price, old_price, thumbnail, stock, category, images || []]
    );
    
    const product = result.rows[0];
    
    // Log the action
    await logActivity(
        req.user.user_id,
        `Product Created: "${title}" (ID: ${product.product_id}, Price: $${price})`,
        getIpAddress(req),
        {
            productId: product.product_id,
            title: title,
            price: price,
            category: category
        }
    );
    
    res.status(201).json({ status: "success", product });
});

/**
 * Example: Log product deletion
 */
exports.deleteProductWithLogging = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Fetch product before deletion for audit trail
    const productResult = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
    const product = productResult.rows[0];
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    // Perform deletion
    await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
    
    // Log the action with product details
    await logActivity(
        req.user.user_id,
        `Product Deleted: "${product.title}" (ID: ${id})`,
        getIpAddress(req),
        {
            productId: id,
            productTitle: product.title,
            price: product.price
        }
    );
    
    res.status(200).json({ status: "success", message: "Product deleted" });
});

// ============================================================================
// EXAMPLE 2: Order Management
// ============================================================================

/**
 * Example: Log order status update
 */
exports.updateOrderStatusWithLogging = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Get current order status for comparison
    const currentResult = await pool.query("SELECT * FROM orders WHERE order_id = $1", [id]);
    const currentOrder = currentResult.rows[0];
    const previousStatus = currentOrder?.status;
    
    // Update the order
    const result = await pool.query(
        "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
        [status, id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
    }
    
    // Log the status change
    await logActivity(
        req.user.user_id,
        `Order Status Updated: #${id} (${previousStatus} → ${status})`,
        getIpAddress(req),
        {
            orderId: id,
            previousStatus: previousStatus,
            newStatus: status,
            userId: currentOrder.user_id
        }
    );
    
    res.status(200).json({ status: "success", order: result.rows[0] });
});

// ============================================================================
// EXAMPLE 3: Customer Management
// ============================================================================

/**
 * Example: Log user role change (security-sensitive action)
 */
exports.updateUserRoleWithLogging = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    // Get current user role
    const currentResult = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const currentUser = currentResult.rows[0];
    const previousRole = currentUser?.role;
    
    const isAdmin = role === 'Super Admin' || role === 'Staff';
    
    const result = await pool.query(
        "UPDATE users SET role = $1, is_admin = $2 WHERE user_id = $3 RETURNING *",
        [role, isAdmin, id]
    );
    
    // Log role change - IMPORTANT for security
    await logActivity(
        req.user.admin_id,  // Who changed it
        `User Role Changed: "${currentUser.full_name}" (${previousRole} → ${role})`,
        getIpAddress(req),
        {
            targetUserId: id,
            targetUserName: currentUser.full_name,
            previousRole: previousRole,
            newRole: role,
            isAdmin: isAdmin
        }
    );
    
    res.status(200).json({ status: "success", user: result.rows[0] });
});

/**
 * Example: Log user block/unblock action
 */
exports.toggleUserBlockWithLogging = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Get current block status
    const currentResult = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const currentUser = currentResult.rows[0];
    const wasBlocked = currentUser?.is_blocked;
    
    const result = await pool.query(
        "UPDATE users SET is_blocked = NOT is_blocked WHERE user_id = $1 RETURNING *",
        [id]
    );
    
    const customer = result.rows[0];
    
    // Log the security action
    await logActivity(
        req.user.user_id,
        `User ${customer.is_blocked ? 'Blocked' : 'Unblocked'}: "${customer.full_name}" (ID: ${id})`,
        getIpAddress(req),
        {
            userId: id,
            userName: customer.full_name,
            email: customer.email,
            blocked: customer.is_blocked
        }
    );
    
    res.status(200).json({ status: "success", customer });
});

// ============================================================================
// EXAMPLE 4: Content Management
// ============================================================================

/**
 * Example: Log banner creation
 */
exports.addBannerWithLogging = catchAsync(async (req, res) => {
    const { title, description, image_url, position, display_order, is_active } = req.body;
    
    const result = await pool.query(
        "INSERT INTO banners (title, description, image_url, position, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, description, image_url, position, display_order || 0, is_active !== false]
    );
    
    const banner = result.rows[0];
    
    // Log the content creation
    await logActivity(
        req.user.user_id,
        `Banner Created: "${title}" (Position: ${position})`,
        getIpAddress(req),
        {
            bannerId: banner.banner_id,
            title: title,
            position: position
        }
    );
    
    res.status(201).json({ status: "success", banner });
});

// ============================================================================
// EXAMPLE 5: Settings & Configuration Changes
// ============================================================================

/**
 * Example: Log store settings update (CRITICAL)
 */
exports.updateStoreSettingsWithLogging = catchAsync(async (req, res) => {
    const { store_name, currency, currency_symbol, tax_percent, contact_email, contact_phone, address } = req.body;
    
    // Get current settings for comparison
    const currentResult = await pool.query("SELECT * FROM store_settings LIMIT 1");
    const currentSettings = currentResult.rows[0];
    
    const result = await pool.query(
        `UPDATE store_settings SET 
            store_name = $1, currency = $2, currency_symbol = $3, 
            tax_percent = $4, contact_email = $5, contact_phone = $6, 
            address = $7, updated_at = NOW() 
            WHERE setting_id = (SELECT setting_id FROM store_settings LIMIT 1) 
            RETURNING *`,
        [store_name, currency, currency_symbol, tax_percent, contact_email, contact_phone, address]
    );
    
    // Log critical settings change
    await logActivity(
        req.user.user_id,
        'Store Settings Updated (CRITICAL)',
        getIpAddress(req),
        {
            changedFields: {
                storeName: currentSettings.store_name !== store_name ? 'YES' : 'NO',
                currency: currentSettings.currency !== currency ? 'YES' : 'NO',
                taxPercent: currentSettings.tax_percent !== tax_percent ? `${currentSettings.tax_percent}% → ${tax_percent}%` : 'NO',
                contactEmail: currentSettings.contact_email !== contact_email ? 'YES' : 'NO',
                address: currentSettings.address !== address ? 'YES' : 'NO'
            }
        }
    );
    
    res.status(200).json({ status: "success", settings: result.rows[0] });
});

// ============================================================================
// EXAMPLE 6: Using Middleware Approach
// ============================================================================

/**
 * In your routes/admin.js file, you can use middleware:
 * 
 * const { auditLoggingMiddleware } = require('../utils/auditLogger');
 * 
 * // Apply to specific routes
 * router.post('/products', 
 *     auditLoggingMiddleware('Product Created'),
 *     adminController.addProduct
 * );
 * 
 * router.delete('/products/:id', 
 *     auditLoggingMiddleware('Product Deleted'),
 *     adminController.deleteProduct
 * );
 * 
 * router.put('/customers/:id/role',
 *     auditLoggingMiddleware('User Role Changed'),
 *     adminController.updateUserRole
 * );
 * 
 * router.put('/settings',
 *     auditLoggingMiddleware('Store Settings Updated'),
 *     adminController.updateStoreSettings
 * );
 */

// ============================================================================
// BEST PRACTICES CHECKLIST
// ============================================================================

/**
 * ✅ DO:
 * - Include meaningful action descriptions
 * - Log who performed the action (req.user.user_id)
 * - Include affected resource IDs
 * - Use consistent action naming (verb + noun)
 * - Always capture IP address
 * - Include timestamps automatically (created_at)
 * - Log critical/security-sensitive actions
 * - Handle logging errors gracefully
 * 
 * ❌ DON'T:
 * - Log passwords or sensitive data
 * - Log encryption keys or tokens
 * - Log credit card numbers
 * - Let logging errors break the main operation
 * - Use vague action descriptions
 * - Forget to include context in additionalData
 * - Mix separate concerns into one log entry
 */
