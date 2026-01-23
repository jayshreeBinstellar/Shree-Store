const express = require('express')
const userController = require('../../controller/auth');
const verifyToken = require('../../middleware/token');
const router = express.Router();

router.post('/login', userController.Login)
router.post('/register', userController.register)
router.post('/forgetpassword', userController.forgetPassword)
router.get('/profile', verifyToken, userController.getProfile)
router.put('/profile', verifyToken, userController.updateProfile)
router.get('/addresses', verifyToken, userController.getAddresses)
router.post('/addresses', verifyToken, userController.addAddress)
router.delete('/addresses/:id', verifyToken, userController.deleteAddress)

module.exports = router;
