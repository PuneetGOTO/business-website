const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 获取端口 - 确保使用Railway提供的PORT
const PORT = process.env.PORT || 5000;

// 基本中间件
app.use(cors());
app.use(express.json());

// 极简路由 - Railway推荐的健康检查路由
app.get('/', (req, res) => {
  res.status(200).send('应用程序正在运行');
});

// 开始监听请求 - 明确在所有网络接口上监听
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
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
