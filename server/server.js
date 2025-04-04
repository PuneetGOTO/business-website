const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 获取端口
const PORT = process.env.PORT || 5000;

// 基本中间件
app.use(cors());
app.use(express.json());

// 极简路由 - 只有一个测试路由
app.get('/', (req, res) => {
  res.send('网站部署测试成功！其他功能正在配置中...');
});

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
