const express = require('express');
const adminController = require('../controller/admin');
const commonController = require('../controller/common');
const verifyToken = require('../middleware/token');
const isAdmin = require('../middleware/admin');
const upload = require('../middleware/upload');
const router = express.Router();

// Apply both middlewares to all admin routes
router.use(verifyToken, isAdmin);

router.get('/stats', adminController.getSalesStats);
router.get('/products', adminController.getProducts);
router.post('/products', adminController.addProduct);
router.post('/products/bulk', adminController.bulkAddProducts);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.put('/products/:id/status', adminController.toggleProductStatus);
router.delete('/products/:id/soft', adminController.softDeleteProduct);
router.post('/products/bulk-delete', adminController.bulkDeleteProducts);
router.post('/products/bulk-status', adminController.bulkUpdateProductStatus);

// Order Management 
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/bulk-status', adminController.bulkUpdateOrderStatus);
router.put('/orders/:id/shipping', adminController.updateOrderShipping);

// Customer Management
router.get('/customers', adminController.getAllCustomers);
router.post('/customers', adminController.addCustomer);
router.put('/customers/:id/block', adminController.toggleUserBlock);
router.post('/customers/bulk-block', adminController.bulkToggleUserBlock);
router.put('/customers/:id/role', adminController.updateUserRole);

// Logs 
router.get('/logs', adminController.getActivityLogs);

// Categories 
router.get('/categories', adminController.adminGetCategories);
router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/bulk-delete', adminController.bulkDeleteCategories);

// Coupons 
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.addCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);
router.post('/coupons/bulk-delete', adminController.bulkDeleteCoupons);

// Banners 
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.addBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);
router.post('/banners/bulk-delete', adminController.bulkDeleteBanners);
router.post('/reviews/bulk-status', adminController.bulkUpdateReviewStatus);
router.post('/transactions/bulk-status', adminController.bulkUpdateTransactionStatus);
router.post('/tickets/bulk-status', adminController.bulkUpdateTicketStatus);
router.post('/upload-banner-image', upload.single('image'), adminController.uploadBannerImage);

router.post('/upload-product-image', upload.single('image'), adminController.uploadProductImage);

// Support
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

// Reviews
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);

// Shipping 
router.get('/shipping-options', adminController.getShippingOptions);
router.post('/shipping-options', adminController.addShippingOption);
router.put('/shipping-options/:id', adminController.updateShippingOption);
router.delete('/shipping-options/:id', adminController.deleteShippingOption);


// Payments 
router.get('/transactions', adminController.getTransactionLogs);

// router.get('/payments/:paymentId/stripe', adminController.getStripePaymentDetails); //pending
// router.post('/payments/sync', adminController.syncStripeTransaction); //pending

// Settings
router.get('/settings', commonController.getStoreSettings);
router.put('/settings', adminController.updateStoreSettings);

module.exports = router;
