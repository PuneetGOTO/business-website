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

// 中间件 - 更全面的CORS配置
app.use(cors({
  origin: '*', // 允许所有来源访问
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// 处理特定资源类型请求
app.get('*.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
});

app.get('*.css', (req, res, next) => {
  res.set('Content-Type', 'text/css');
  next();
});

app.get('*.html', (req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

// 提供静态文件服务 - 优化静态文件服务顺序
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..')));

// 处理HTML页面路由
app.get('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'login.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.get('/games.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'games.html'));
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 其他未指定路由
app.get('*', (req, res) => {
  // 如果不是API请求也不是特定HTML页面
  if (!req.path.startsWith('/api') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else if (!req.path.startsWith('/api')) {
    // 处理其他静态资源
    res.sendFile(path.join(__dirname, '..', req.path), (err) => {
      if (err) {
        res.status(404).send('Not found');
      }
    });
  }
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error('应用错误:', err.stack);
  res.status(500).send('服务器内部错误');
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
