const express = require('express')
const authController = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/users/search', authenticate, authController.searchUsers)
router.get('/me', authenticate, authController.getProfile)
router.patch('/me', authenticate, authController.updateProfile)

module.exports = router