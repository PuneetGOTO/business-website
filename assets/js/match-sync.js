/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 延迟执行以确保DOM完全加载
    setTimeout(function() {
        syncMatchesToFrontend();
    }, 1000); // 增加延迟时间到1000ms
});

/**
 * 将比赛数据从localStorage同步到前端页面
 */
function syncMatchesToFrontend() {
    console.log('开始同步比赛数据到前端');
    
    // 从localStorage获取比赛数据
    const matchesData = JSON.parse(localStorage.getItem('upcomingMatchesForm'));
    console.log('localStorage中的所有数据:', localStorage);
    console.log('upcomingMatchesForm数据:', localStorage.getItem('upcomingMatchesForm'));
    
    if (!matchesData) {
        console.error('没有找到比赛数据或数据格式不正确');
        
        // 尝试遍历localStorage中的所有键，寻找可能的比赛数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`localStorage键[${i}]: ${key}, 值: ${localStorage.getItem(key).substring(0, 50)}...`);
        }
        return;
    }
    
    console.log('找到比赛数据:', matchesData);
    
    // 更新标题
    const titleElement = document.querySelector('.upcoming_matches_section h2');
    if (titleElement && matchesData.upcomingMatchesTitle) {
        titleElement.textContent = matchesData.upcomingMatchesTitle;
        console.log('更新了比赛标题:', matchesData.upcomingMatchesTitle);
    } else {
        console.log('未找到比赛标题元素或无标题数据');
        console.log('页面中的h2元素:', document.querySelectorAll('h2').length);
        document.querySelectorAll('h2').forEach((h2, index) => {
            console.log(`h2[${index}]: ${h2.textContent}`);
        });
    }
    
    // 尝试多种选择器查找比赛卡片
    let matchCards = document.querySelectorAll('.upcoming_matches_content');
    
    // 调试日志
    console.log('找到 .upcoming_matches_content 元素数量:', matchCards.length);
    
    // 如果找不到，尝试更详细的选择器
    if (matchCards.length === 0) {
        matchCards = document.querySelectorAll('.upcoming_matches_section .upcoming_matches_content');
        console.log('使用更详细选择器，找到元素数量:', matchCards.length);
    }
    
    // 如果仍找不到，尝试基于行结构的选择器
    if (matchCards.length === 0) {
        matchCards = document.querySelectorAll('.upcoming_matches_section .col-lg-12 > div');
        console.log('使用基于行结构的选择器，找到元素数量:', matchCards.length);
    }
    
    // 输出页面DOM结构调试信息
    if (matchCards.length === 0) {
        console.log('找不到比赛卡片元素，以下是页面结构:');
        console.log('upcoming_matches_section存在:', !!document.querySelector('.upcoming_matches_section'));
        console.log('页面URL:', window.location.href);
        
        // 记录页面结构用于调试
        const domStructure = document.querySelector('.upcoming_matches_section');
        if (domStructure) {
            console.log('upcoming_matches_section HTML:', domStructure.outerHTML.substring(0, 500));
        }
        return;
    }
    
    console.log('成功找到比赛卡片元素:', matchCards.length);
    
    // 更新比赛1
    if (matchCards.length > 0 && matchesData.match1Teams) {
        updateMatchCard(matchCards[0], {
            teams: matchesData.match1Teams,
            date: matchesData.match1Date,
            time: matchesData.match1Time,
            groups: matchesData.match1Groups,
            players: matchesData.match1Players,
            prizeLabel: matchesData.match1PrizeLabel || 'Prize Pool',
            prize: matchesData.match1Prize,
            team1Logo: matchesData.match1Team1Logo,
            team2Logo: matchesData.match1Team2Logo
        });
        console.log('更新了比赛1:', matchesData.match1Teams);
    }
    
    // 更新比赛2
    if (matchCards.length > 1 && matchesData.match2Teams) {
        updateMatchCard(matchCards[1], {
            teams: matchesData.match2Teams,
            date: matchesData.match2Date,
            time: matchesData.match2Time,
            groups: matchesData.match2Groups,
            players: matchesData.match2Players,
            prizeLabel: matchesData.match2PrizeLabel || 'Prize Pool',
            prize: matchesData.match2Prize,
            team1Logo: matchesData.match2Team1Logo,
            team2Logo: matchesData.match2Team2Logo
        });
        console.log('更新了比赛2:', matchesData.match2Teams);
    }
    
    // 更新比赛3
    if (matchCards.length > 2 && matchesData.match3Teams) {
        updateMatchCard(matchCards[2], {
            teams: matchesData.match3Teams,
            date: matchesData.match3Date,
            time: matchesData.match3Time,
            groups: matchesData.match3Groups,
            players: matchesData.match3Players,
            prizeLabel: matchesData.match3PrizeLabel || 'Prize Pool',
            prize: matchesData.match3Prize,
            team1Logo: matchesData.match3Team1Logo,
            team2Logo: matchesData.match3Team2Logo
        });
        console.log('更新了比赛3:', matchesData.match3Teams);
    }
    
    console.log('比赛数据同步完成');
}

/**
 * 更新单个比赛卡片
 * @param {HTMLElement} card - 比赛卡片元素
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, data) {
    try {
        console.log('正在更新比赛卡片:', card);
        console.log('使用数据:', data);
        
        // 更新比赛名称（在center_portion中的第一个p元素）
        const matchName = card.querySelector('.center_portion p');
        if (matchName && data.teams) {
            matchName.textContent = data.teams;
            console.log('更新比赛名称:', data.teams);
        } else {
            console.log('未找到比赛名称元素:', !!matchName, '或无teams数据');
            if (card.querySelector('.center_portion')) {
                console.log('.center_portion内容:', card.querySelector('.center_portion').innerHTML);
            }
        }
        
        // 更新日期和时间
        const dateSpan = card.querySelector('.center_span_wrapper span:first-of-type');
        if (dateSpan && data.date) {
            dateSpan.textContent = data.date;
            console.log('更新比赛日期:', data.date);
        } else {
            console.log('未找到日期元素或无date数据');
        }
        
        const timeSpan = card.querySelector('.center_span_wrapper span:last-of-type');
        if (timeSpan && data.time) {
            timeSpan.textContent = data.time;
            console.log('更新比赛时间:', data.time);
        } else {
            console.log('未找到时间元素或无time数据');
        }
        
        // 更新分组信息
        const groupsSpan = card.querySelector('.last_span_wrapper .groups');
        if (groupsSpan && data.groups) {
            groupsSpan.textContent = data.groups;
            console.log('更新比赛分组:', data.groups);
        } else {
            console.log('未找到分组元素或无groups数据');
        }
        
        // 更新玩家数量
        const playersSpan = card.querySelector('.last_span_wrapper .players');
        if (playersSpan && data.players) {
            playersSpan.textContent = data.players;
            console.log('更新玩家数量:', data.players);
        } else {
            console.log('未找到玩家数量元素或无players数据');
        }
        
        // 更新奖金标签和金额
        const prizeLabelSpan = card.querySelector('.last_span_wrapper2 .groups');
        if (prizeLabelSpan && data.prizeLabel) {
            prizeLabelSpan.textContent = data.prizeLabel;
            console.log('更新奖金标签:', data.prizeLabel);
        } else {
            console.log('未找到奖金标签元素或无prizeLabel数据');
        }
        
        const prizeValueSpan = card.querySelector('.last_span_wrapper2 .players');
        if (prizeValueSpan && data.prize) {
            prizeValueSpan.textContent = data.prize;
            console.log('更新奖金:', data.prize);
        } else {
            console.log('未找到奖金元素或无prize数据');
        }
        
        // 更新团队logo
        if (data.team1Logo) {
            const team1LogoImg = card.querySelector('.first_portion figure:first-of-type img');
            if (team1LogoImg) {
                team1LogoImg.src = data.team1Logo;
                console.log('更新队伍1标志:', data.team1Logo);
            }
        }
        
        if (data.team2Logo) {
            const team2LogoImg = card.querySelector('.first_portion figure:last-of-type img');
            if (team2LogoImg) {
                team2LogoImg.src = data.team2Logo;
                console.log('更新队伍2标志:', data.team2Logo);
            }
        }
    } catch (error) {
        console.error('更新比赛卡片时出错:', error);
    }
}
