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

// 获取首页HTML内容
router.get('/html/index', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../index.html');
        
        // 验证文件路径，确保不会发生目录遍历
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(path.join(__dirname, '../../'))) {
            return res.status(403).json({ message: '拒绝访问此文件' });
        }
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.json({ content });
        } else {
            res.status(404).json({ message: '文件不存在' });
        }
    } catch (error) {
        console.error('获取HTML内容错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新HTML内容
router.post('/html/update', (req, res) => {
    try {
        const { fileName, content } = req.body;
        
        // 验证文件名，只允许特定的HTML文件被修改
        const allowedFiles = ['index.html', 'about.html', 'games.html', 'gallery.html', 'contact.html', 'match_detail.html'];
        if (!allowedFiles.includes(fileName)) {
            return res.status(403).json({ message: '不允许修改此文件' });
        }
        
        const filePath = path.join(__dirname, '../../', fileName);
        
        // 验证文件路径，确保不会发生目录遍历
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(path.join(__dirname, '../../'))) {
            return res.status(403).json({ message: '拒绝访问此文件' });
        }
        
        if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content, 'utf8');
            res.json({ success: true, message: '文件已成功更新' });
        } else {
            res.status(404).json({ message: '文件不存在' });
        }
    } catch (error) {
        console.error('更新HTML内容错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新特定元素的内容
router.post('/html/update-element', (req, res) => {
    try {
        const { fileName, selector, content, attribute } = req.body;
        
        // 验证文件名，只允许特定的HTML文件被修改
        const allowedFiles = ['index.html', 'about.html', 'games.html', 'gallery.html', 'contact.html', 'match_detail.html'];
        if (!allowedFiles.includes(fileName)) {
            return res.status(403).json({ message: '不允许修改此文件' });
        }
        
        const filePath = path.join(__dirname, '../../', fileName);
        
        // 验证文件路径，确保不会发生目录遍历
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(path.join(__dirname, '../../'))) {
            return res.status(403).json({ message: '拒绝访问此文件' });
        }
        
        if (fs.existsSync(filePath)) {
            // 读取HTML内容
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            
            // 使用cheerio（类似于服务器端的jQuery）来修改HTML
            const cheerio = require('cheerio');
            const $ = cheerio.load(htmlContent);
            
            // 根据请求修改内容
            if (attribute) {
                // 如果指定了属性，修改该属性
                $(selector).attr(attribute, content);
            } else {
                // 否则修改元素的文本内容
                $(selector).text(content);
            }
            
            // 保存修改后的HTML
            fs.writeFileSync(filePath, $.html(), 'utf8');
            
            res.json({ success: true, message: '元素已成功更新' });
        } else {
            res.status(404).json({ message: '文件不存在' });
        }
    } catch (error) {
        console.error('更新HTML元素错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 批量更新HTML元素
router.post('/html/update-elements', (req, res) => {
    try {
        const { fileName, updates } = req.body;
        
        // 验证文件名，只允许特定的HTML文件被修改
        const allowedFiles = ['index.html', 'about.html', 'games.html', 'gallery.html', 'contact.html', 'match_detail.html'];
        if (!allowedFiles.includes(fileName)) {
            return res.status(403).json({ message: '不允许修改此文件' });
        }
        
        const filePath = path.join(__dirname, '../../', fileName);
        
        // 验证文件路径，确保不会发生目录遍历
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(path.join(__dirname, '../../'))) {
            return res.status(403).json({ message: '拒绝访问此文件' });
        }
        
        if (fs.existsSync(filePath)) {
            // 读取HTML内容
            let htmlContent = fs.readFileSync(filePath, 'utf8');
            
            // 不使用cheerio，使用简单的字符串替换来修改HTML
            updates.forEach(update => {
                const { selector, content, attribute } = update;
                
                // 简单实现：直接使用正则表达式查找和替换内容
                // 这种方法不如cheerio精确，但不需要额外的依赖
                
                // 按选择器类型处理
                if (selector === '.banner-section-content h1') {
                    // 替换首页标题
                    const titleRegex = /(<h1[^>]*>)([^<]*)<\/h1>/;
                    htmlContent = htmlContent.replace(titleRegex, `$1${content}</h1>`);
                } 
                else if (selector === '.banner-section-content p') {
                    // 替换首页描述
                    const descRegex = /(<div class="banner-section-content">[\s\S]*?<h1[^>]*>[^<]*<\/h1>[\s\S]*?<p[^>]*>)([^<]*)<\/p>/;
                    htmlContent = htmlContent.replace(descRegex, `$1${content}</p>`);
                }
                else if (selector.includes('.trending_content') && selector.includes('.trending_span_wrapper span')) {
                    // 处理游戏服务标题
                    // 这里简化处理，实际可能需要更复杂的逻辑
                    if (selector.includes(':nth-child(1)')) {
                        const serviceRegex = /(class="trending_span_wrapper"><span>)([^<]*)<\/span>/;
                        htmlContent = htmlContent.replace(serviceRegex, `$1${content}</span>`);
                    } else if (selector.includes(':nth-child(2)')) {
                        // 找到第一个后再找第二个
                        const firstMatch = htmlContent.match(/(class="trending_span_wrapper"><span>)([^<]*)<\/span>/);
                        if (firstMatch) {
                            const restOfHtml = htmlContent.substring(htmlContent.indexOf(firstMatch[0]) + firstMatch[0].length);
                            const secondMatch = restOfHtml.match(/(class="trending_span_wrapper"><span>)([^<]*)<\/span>/);
                            if (secondMatch) {
                                const fullSecondMatch = secondMatch[0];
                                const replacement = secondMatch[1] + content + '</span>';
                                htmlContent = htmlContent.replace(fullSecondMatch, replacement);
                            }
                        }
                    } else if (selector.includes(':nth-child(3)')) {
                        // 找到前两个后再找第三个
                        let tempHtml = htmlContent;
                        let count = 0;
                        let lastIndex = 0;
                        
                        const regex = /(class="trending_span_wrapper"><span>)([^<]*)<\/span>/g;
                        let match;
                        while ((match = regex.exec(tempHtml)) !== null && count < 2) {
                            count++;
                            lastIndex = regex.lastIndex;
                        }
                        
                        if (count === 2) {
                            const restOfHtml = tempHtml.substring(lastIndex);
                            const thirdMatch = restOfHtml.match(/(class="trending_span_wrapper"><span>)([^<]*)<\/span>/);
                            if (thirdMatch) {
                                const fullThirdMatch = thirdMatch[0];
                                const replacement = thirdMatch[1] + content + '</span>';
                                htmlContent = tempHtml.substring(0, lastIndex) + restOfHtml.replace(fullThirdMatch, replacement);
                            }
                        }
                    }
                }
            });
            
            // 保存修改后的HTML
            fs.writeFileSync(filePath, htmlContent, 'utf8');
            
            res.json({ success: true, message: '元素已批量成功更新' });
        } else {
            res.status(404).json({ message: '文件不存在' });
        }
    } catch (error) {
        console.error('批量更新HTML元素错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

module.exports = router;
