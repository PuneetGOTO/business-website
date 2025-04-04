const express = require('express');
const router = express.Router();
const { getAllContent, getContentByType, updateContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/auth');

// 获取所有内容 - 公开路由
router.get('/', getAllContent);

// 获取特定类型的内容 - 公开路由
router.get('/:contentType', getContentByType);

// 更新内容 - 需要管理员权限
router.put('/:contentType', protect, admin, updateContent);

module.exports = router;
