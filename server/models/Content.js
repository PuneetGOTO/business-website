const mongoose = require('mongoose');

// 定义一个通用的内容模型，可以存储网站上的任何内容
const ContentSchema = new mongoose.Schema({
  // 内容类型，例如：homeHeader, trendingGames, aboutTitle 等
  contentType: {
    type: String,
    required: true,
    index: true
  },
  // 内容数据，存储为JSON对象
  data: {
    type: Object,
    required: true
  },
  // 最后更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // 最后更新用户
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// 为contentType添加唯一索引，确保每种内容类型只有一个文档
ContentSchema.index({ contentType: 1 }, { unique: true });

module.exports = mongoose.model('Content', ContentSchema);
