const express = require('express');
const router = express.Router();
const { getAllContent, getContentByType, updateContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 获取所有内容 - 公开路由
router.get('/', getAllContent);

// HTML文件编辑API - 获取HTML文件内容
router.get('/html', async (req, res) => {
    try {
        const fileName = req.query.file;
        if (!fileName) {
            return res.status(400).json({ success: false, message: '未指定文件名' });
        }
        
        // 验证文件名是否有效（防止目录遍历攻击）
        if (!fileName.match(/^[a-zA-Z0-9_-]+\.html$/)) {
            return res.status(400).json({ success: false, message: '无效的文件名' });
        }
        
        // 构建文件路径（相对于项目根目录）
        const filePath = path.join(__dirname, '../..', fileName);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }
        
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        
        res.json({ success: true, content });
    } catch (err) {
        console.error('读取HTML文件时出错:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// HTML文件编辑API - 保存HTML文件内容
router.post('/html', async (req, res) => {
    try {
        const { file, content } = req.body;
        if (!file || !content) {
            return res.status(400).json({ success: false, message: '文件名或内容不能为空' });
        }
        
        // 验证文件名是否有效（防止目录遍历攻击）
        if (!file.match(/^[a-zA-Z0-9_-]+\.html$/)) {
            return res.status(400).json({ success: false, message: '无效的文件名' });
        }
        
        // 构建文件路径（相对于项目根目录）
        const filePath = path.join(__dirname, '../..', file);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }
        
        // 保存文件前备份
        const backupPath = `${filePath}.bak.${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        
        // 写入新内容
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`HTML文件已更新: ${file}`);
        
        res.json({ success: true, message: '文件已保存' });
    } catch (err) {
        console.error('保存HTML文件时出错:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取特定类型的内容 - 公开路由
router.get('/:contentType', getContentByType);

// 更新内容 - 需要管理员权限
router.put('/:contentType', protect, admin, updateContent);

module.exports = router;
