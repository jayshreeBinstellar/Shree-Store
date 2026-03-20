const express = require('express');
const adminController = require('../controller/admin');
const commonController = require('../controller/common');
const bulkAdminController = require('../controller/bulkAdmin');
const shippingAdminController = require('../controller/shippingAdmin');
const bannerAdminController = require('../controller/bannerAdmin');
const productAdminController = require('../controller/productAdmin');
const verifyToken = require('../middleware/token');
const isAdmin = require('../middleware/admin');
const upload = require('../middleware/upload');
const router = express.Router();

// Apply both middlewares to all admin routes
router.use(verifyToken, isAdmin);

router.get('/stats', adminController.getSalesStats);
router.get('/products', productAdminController.getProducts);
router.post('/products', productAdminController.addProduct);
router.post('/products/bulk', bulkAdminController.bulkAddProducts);
router.put('/products/bulk-restore', bulkAdminController.bulkRestoreProducts)
router.post('/products/bulk-delete', bulkAdminController.bulkDeleteProducts);
router.post('/products/bulk-status', bulkAdminController.bulkUpdateProductStatus);
router.put('/products/:id', productAdminController.updateProduct);
// router.delete('/products/:id', productAdminController.deleteProduct);
router.put('/products/restore/:id', productAdminController.restoreProduct)
router.put('/products/:id/status', productAdminController.toggleProductStatus);
router.delete('/products/:id/soft', productAdminController.softDeleteProduct);

// Order Management 
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/bulk-status', bulkAdminController.bulkUpdateOrderStatus);
router.put('/orders/:id/shipping', adminController.updateOrderShipping);

// Customer Management
router.get('/customers', adminController.getAllCustomers);
router.post('/customers', adminController.addCustomer);
router.put('/customers/:id/block', adminController.toggleUserBlock);
router.post('/customers/bulk-block', bulkAdminController.bulkToggleUserBlock);
router.put('/customers/:id/role', adminController.updateUserRole);

// Logs 
router.get('/logs', adminController.getActivityLogs);

// Categories 
router.get('/categories', adminController.adminGetCategories);
router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/bulk-delete', bulkAdminController.bulkDeleteCategories);

// Coupons 
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.addCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);
router.post('/coupons/bulk-delete', bulkAdminController.bulkDeleteCoupons);

// Banners 
router.get('/banners', bannerAdminController.getBanners);
router.post('/banners', bannerAdminController.addBanner);
router.put('/banners/:id', bannerAdminController.updateBanner);
router.delete('/banners/:id', bannerAdminController.deleteBanner);
router.post('/banners/bulk-delete', bulkAdminController.bulkDeleteBanners);
router.post('/reviews/bulk-status', bulkAdminController.bulkUpdateReviewStatus);
router.post('/transactions/bulk-status', bulkAdminController.bulkUpdateTransactionStatus);
router.post('/tickets/bulk-status', bulkAdminController.bulkUpdateTicketStatus);
router.post('/upload-banner-image', upload.single('image'), bannerAdminController.uploadBannerImage);

router.post('/upload-product-image', upload.single('image'), productAdminController.uploadProductImage);

// Support
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

// Reviews
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);

// Shipping 
router.get('/shipping-options', shippingAdminController.getShippingOptions);
router.post('/shipping-options', shippingAdminController.addShippingOption);
router.put('/shipping-options/:id', shippingAdminController.updateShippingOption);
router.delete('/shipping-options/:id', shippingAdminController.deleteShippingOption);


// Payments 
router.get('/transactions', adminController.getTransactionLogs);

// router.get('/payments/:paymentId/stripe', adminController.getStripePaymentDetails); //pending
// router.post('/payments/sync', adminController.syncStripeTransaction); //pending

// Settings
router.get('/settings', commonController.getStoreSettings);
router.put('/settings', adminController.updateStoreSettings);

module.exports = router;
