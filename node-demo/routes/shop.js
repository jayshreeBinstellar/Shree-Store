const express = require('express');
const shopController = require('../controller/shop');
const paymentController = require('../controller/payment');
const commonController = require('../controller/common');
const supportController = require('../controller/support');
const verifyToken = require('../middleware/token');
const router = express.Router();

router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProductById);
router.get('/products/:id/related', shopController.getRelatedProducts);
router.post('/checkout', verifyToken, paymentController.createCheckoutSession);
router.post('/orders', verifyToken, shopController.createOrder);
router.post('/orders/verify-payment', verifyToken, shopController.verifyPayment);
router.get('/orders/history', verifyToken, shopController.getOrderHistory);

// Reviews
router.post('/products/:id/reviews', verifyToken, shopController.addProductReview);
router.get('/products/:id/reviews', shopController.getProductReviews);

router.get('/categories', commonController.getCategories);
router.get('/banners', shopController.getBanners);

// Wishlist
router.get('/wishlist', verifyToken, shopController.getWishlist);
router.post('/wishlist', verifyToken, shopController.addToWishlist);
router.delete('/wishlist/:id', verifyToken, shopController.removeFromWishlist);

// Shipping & Coupons
router.get('/shipping-options', commonController.getShippingOptions);
router.post('/coupons/validate', shopController.validateCoupon);

// Support/Tickets
router.post('/support/tickets', verifyToken, supportController.createTicket);
router.get('/support/tickets', verifyToken, supportController.getUserTickets);
router.get('/support/tickets/:ticket_id', verifyToken, supportController.getTicketDetails);
router.post('/support/tickets/:ticket_id/replies', verifyToken, supportController.addTicketReply);
router.get('/support/tickets/:ticket_id/replies', verifyToken, supportController.getTicketReplies);
router.put('/support/tickets/:ticket_id/close', verifyToken, supportController.closeTicket);
router.put('/support/tickets/:ticket_id/reopen', verifyToken, supportController.reopenTicket);
router.get('/support/categories', supportController.getSupportCategories);

// Cart
router.get('/cart', verifyToken, shopController.getCart);
router.post('/cart', verifyToken, shopController.addToCart);
router.put('/cart', verifyToken, shopController.updateCartItem);
router.delete('/cart/:id', verifyToken, shopController.removeFromCart);

module.exports = router;
