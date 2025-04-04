const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 用户登录
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成令牌
    const token = generateToken(user._id);

    // 返回用户信息和令牌
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
};

// 初始化管理员用户（仅在首次运行时使用）
exports.initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 检查管理员是否已存在
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log('管理员用户已存在');
      return;
    }

    // 创建管理员用户
    await User.create({
      email: adminEmail,
      password: adminPassword,
      isAdmin: true
    });

    console.log('管理员用户已创建');
  } catch (error) {
    console.error('初始化管理员用户失败:', error);
  }
};
