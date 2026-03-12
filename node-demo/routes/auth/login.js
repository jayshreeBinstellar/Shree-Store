const express = require('express')
const userController = require('../../controller/auth');
const verifyToken = require('../../middleware/token');
const router = express.Router();

router.post('/login', userController.logIn)
router.post('/register', userController.register)
router.post('/forgetpassword', userController.forgetPassword)
router.post('/verify-otp', userController.verifyOTP)
router.post('/reset-password', userController.resetPassword)
router.post('/resend-otp', userController.resendOTP)
router.get('/profile', verifyToken, userController.getProfile)
router.put('/edit-profile', verifyToken, userController.updateProfile)
router.get('/addresses', verifyToken, userController.getAddresses)
router.post('/addresses', verifyToken, userController.addAddress)
router.delete('/addresses/:id', verifyToken, userController.deleteAddress)

router.post('/logout', verifyToken, userController.logOut)
router.put('/change-password', verifyToken, userController.changeMyPassword)

module.exports = router;
