const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JSON Web Token的中间件
exports.protect = async (req, res, next) => {
  let token;
  
  // 从请求头中获取token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // 如果token不存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权，请登录'
    });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的令牌，请重新登录'
    });
  }
};

// 验证是否为管理员的中间件
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
};
