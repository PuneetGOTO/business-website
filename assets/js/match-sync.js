/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    // 立即同步
    syncMatchesToFrontend();
});

/**
 * 将比赛数据从localStorage同步到前端页面
 */
function syncMatchesToFrontend() {
    console.log('开始同步比赛数据到前端');
    
    // 从localStorage获取比赛数据
    const matchesData = JSON.parse(localStorage.getItem('upcomingMatchesForm'));
    if (!matchesData) {
        console.log('没有找到比赛数据');
        return;
    }
    
    console.log('找到比赛数据:', matchesData);
    
    // 更新标题
    const titleElement = document.querySelector('.match-title h2');
    if (titleElement && matchesData.upcomingMatchesTitle) {
        titleElement.textContent = matchesData.upcomingMatchesTitle;
    }
    
    // 获取所有比赛卡片
    const matchCards = document.querySelectorAll('.upcoming_matches_content');
    if (matchCards.length === 0) {
        console.log('找不到比赛卡片元素');
        return;
    }
    
    // 更新比赛1
    if (matchCards.length > 0 && matchesData.match1Teams) {
        updateMatchCard(matchCards[0], {
            teams: matchesData.match1Teams,
            date: matchesData.match1Date,
            time: matchesData.match1Time,
            groups: matchesData.match1Groups,
            players: matchesData.match1Players,
            prizeLabel: matchesData.match1PrizeLabel || 'Prize Pool',
            prize: matchesData.match1Prize
        });
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
            prize: matchesData.match2Prize
        });
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
            prize: matchesData.match3Prize
        });
    }
    
    console.log('比赛数据同步完成');
}

/**
 * 更新单个比赛卡片
 * @param {HTMLElement} card - 比赛卡片元素
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, data) {
    // 更新比赛名称（在center_portion中的第一个p元素）
    const matchName = card.querySelector('.center_portion p');
    if (matchName && data.teams) {
        matchName.textContent = data.teams;
    }
    
    // 更新日期和时间
    const dateSpan = card.querySelector('.center_span_wrapper span:first-of-type');
    if (dateSpan && data.date) {
        dateSpan.textContent = data.date;
    }
    
    const timeSpan = card.querySelector('.center_span_wrapper span:last-of-type');
    if (timeSpan && data.time) {
        timeSpan.textContent = data.time;
    }
    
    // 更新分组信息
    const groupsSpan = card.querySelector('.last_span_wrapper .groups');
    if (groupsSpan && data.groups) {
        groupsSpan.textContent = data.groups;
    }
    
    // 更新玩家数量
    const playersSpan = card.querySelector('.last_span_wrapper .players');
    if (playersSpan && data.players) {
        playersSpan.textContent = data.players;
    }
    
    // 更新奖金标签和金额
    const prizeLabelSpan = card.querySelector('.last_span_wrapper2 .groups');
    if (prizeLabelSpan && data.prizeLabel) {
        prizeLabelSpan.textContent = data.prizeLabel;
    }
    
    const prizeValueSpan = card.querySelector('.last_span_wrapper2 .players');
    if (prizeValueSpan && data.prize) {
        prizeValueSpan.textContent = data.prize;
    }
}
