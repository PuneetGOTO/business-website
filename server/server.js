const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // 添加fs模块

// 导入路由
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');

// 导入初始化函数
const { initAdmin } = require('./controllers/authController');
const { initDefaultContent } = require('./controllers/contentController');

// 环境变量配置
dotenv.config();

// 创建Express应用
const app = express();

// 获取端口 - 确保使用Railway提供的PORT
const PORT = process.env.PORT || 5000;

// 添加CORS头 - 允许所有来源访问
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 预检请求处理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 基本中间件
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// 内容管理API路由
app.get('/api/content', async (req, res) => {
    try {
        if (!req.session.loggedIn) {
            return res.status(401).json({ success: false, message: '未授权访问' });
        }
        
        // 从数据库获取网站内容
        const content = await Content.findOne({});
        res.json({ success: true, content: content || {} });
    } catch (err) {
        console.error('获取内容时出错:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

app.post('/api/content', async (req, res) => {
    try {
        if (!req.session.loggedIn) {
            return res.status(401).json({ success: false, message: '未授权访问' });
        }
        
        const contentData = req.body;
        
        // 更新或创建内容
        let content = await Content.findOne({});
        if (content) {
            // 更新现有内容
            content = await Content.findOneAndUpdate({}, contentData, { new: true });
        } else {
            // 创建新内容
            content = new Content(contentData);
            await content.save();
        }
        
        res.json({ success: true, content });
    } catch (err) {
        console.error('保存内容时出错:', err);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 静态文件服务
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..')));

// 健康检查路由 - 为Railway添加
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 管理员路由
app.get('/admin', (req, res) => {
  res.redirect('/admin/login.html');
});

app.get('/admin/login', (req, res) => {
  res.redirect('/admin/login.html');
});

// 通配符路由
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', req.path), (err) => {
      if (err) {
        res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
      }
    });
  }
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // 初始化管理员用户和默认内容
  await initAdmin();
  await initDefaultContent();
  
  // 创建HTTP服务器 - 关键配置：显式监听所有网络接口
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // 添加进程事件处理
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
