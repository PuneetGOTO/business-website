const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

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

// 获取端口，确保使用Railway分配的端口
const PORT = process.env.PORT || 5000;

// 基本中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查端点 - 为Railway添加
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// 静态文件服务 - 简化配置
app.use(express.static(path.join(__dirname, '..')));

// 根路由
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

// 通配符路由 - 简化
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path), (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
    }
  });
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
  
  // 创建HTTP服务器，明确支持所有网络接口
  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
