const Content = require('../models/Content');

// 获取所有内容
exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.find();
    
    // 转换为便于前端使用的格式
    const contentMap = {};
    content.forEach(item => {
      contentMap[item.contentType] = item.data;
    });
    
    res.status(200).json({
      success: true,
      data: contentMap
    });
  } catch (error) {
    console.error('获取内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取特定类型的内容
exports.getContentByType = async (req, res) => {
  try {
    const { contentType } = req.params;
    
    const content = await Content.findOne({ contentType });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: '未找到内容'
      });
    }
    
    res.status(200).json({
      success: true,
      data: content.data
    });
  } catch (error) {
    console.error(`获取${req.params.contentType}内容错误:`, error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新或创建内容
exports.updateContent = async (req, res) => {
  try {
    const { contentType } = req.params;
    const contentData = req.body;
    
    // 使用upsert选项，如果内容不存在则创建
    const content = await Content.findOneAndUpdate(
      { contentType },
      { 
        data: contentData,
        updatedAt: Date.now(),
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: content.data
    });
  } catch (error) {
    console.error(`更新${req.params.contentType}内容错误:`, error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 初始化默认内容
exports.initDefaultContent = async () => {
  try {
    // 检查是否已有内容
    const contentCount = await Content.countDocuments();
    if (contentCount > 0) {
      console.log('内容已初始化，跳过默认内容创建');
      return;
    }
    
    // 定义默认内容
    const defaultContent = [
      {
        contentType: 'homeHeader',
        data: {
          homeTitle: 'Roblox The Strongest Battlegrounds Team',
          homeDescription: '团员要互相尊重，穿戴披风或名前带GJ者禁止亂罵人，穿戴披风或名前带GJ者不要隨便亂惡意Team人，不強制改名，但是盡量改名。'
        }
      },
      {
        contentType: 'trendingGames',
        data: {
          trendingGamesTitle: '游戏',
          game1: '全部',
          game2: '主要',
          game3: 'PLAYSTATION 4'
        }
      },
      {
        contentType: 'upcomingMatches',
        data: {
          upcomingMatchesTitle: '即将举行的比赛',
          matchName: '待添加 Tournament',
          matchDate: 'April 30,2025',
          matchTime: '6:00 Pm',
          matchGroups: '4 Groups',
          matchPlayers: '64 Players',
          matchPrize: '$10000'
        }
      },
      {
        contentType: 'aboutTitle',
        data: {
          aboutTitle: 'About Us',
          aboutSlogan: '注意事项',
          aboutDescription: '1.團員要互相尊重 2.穿戴披风或名前带GJ者禁止亂罵人 3.穿戴披风或名前带GJ者不要隨便亂惡意Team人 4.不強制改名---［但是盡量改名］--- 5.亂罵人者警告一次 6.三次警告将会踢出群聊. 以上是全部注意事项.'
        }
      },
      {
        contentType: 'stats',
        data: {
          teamMembers: '80',
          featuredGames: '30',
          regularClients: '40',
          winAwards: '50'
        }
      },
      {
        contentType: 'contactInfo',
        data: {
          contactTitle: 'Contact Us',
          contactAddress: 'King Street,Melbourne,Australia',
          contactPhone: '0-589-96369-95823',
          contactEmail: 'Croxesports@gmail.com'
        }
      }
    ];
    
    // 批量插入默认内容
    await Content.insertMany(defaultContent);
    console.log('默认内容已初始化');
  } catch (error) {
    console.error('初始化默认内容失败:', error);
  }
};
