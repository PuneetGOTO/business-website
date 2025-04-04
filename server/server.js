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

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// 如果不是API请求，重定向到前端
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
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
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
