const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// 配置CORS - 允许特定域名访问API
const corsOptions = {
  origin: [
    'https://ttsb-production.up.railway.app',  // 生产环境前端
    'https://business-website-production.up.railway.app', // 生产环境同域
    'http://localhost:3000',  // 本地开发前端
    'http://localhost:5000',  // 本地开发后端
    'http://127.0.0.1:3000',  // 本地开发前端备选
    'http://127.0.0.1:5000'   // 本地开发后端备选
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 基本中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

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
