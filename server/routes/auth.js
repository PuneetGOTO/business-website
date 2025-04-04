const express = require('express');
const router = express.Router();
const { login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 登录路由
router.post('/login', login);

// 获取当前用户信息（需要认证）
router.get('/me', protect, getCurrentUser);

module.exports = router;
