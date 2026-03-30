const express = require('express');
const router = express.Router();
const { register, login, completeOnboarding, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require JWT)
router.get('/me', auth, getMe);
router.put('/onboarding', auth, completeOnboarding);

module.exports = router;
