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
    const matchCards = document.querySelectorAll('.match-box');
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
    
    console.log('比赛数据同步完成');
}

/**
 * 更新单个比赛卡片
 * @param {HTMLElement} card - 比赛卡片元素
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, data) {
    // 更新日期和时间
    const dateElement = card.querySelector('.date');
    if (dateElement) {
        dateElement.textContent = data.date || '';
    }
    
    const timeElement = card.querySelector('.time');
    if (timeElement) {
        timeElement.textContent = data.time || '';
    }
    
    // 更新比赛名称/队伍
    const matchName = card.querySelector('h4');
    if (matchName) {
        matchName.textContent = data.teams || '';
    }
    
    // 更新分组、玩家数量和奖金信息
    const groupsBadge = card.querySelector('.badge:nth-of-type(1)');
    if (groupsBadge) {
        groupsBadge.textContent = data.groups || '';
    }
    
    const playersBadge = card.querySelector('.badge:nth-of-type(2)');
    if (playersBadge) {
        playersBadge.textContent = data.players || '';
    }
    
    const prizeBadge = card.querySelector('.badge:nth-of-type(3)');
    if (prizeBadge) {
        // 分为标签和金额两部分
        const prizeLabel = prizeBadge.querySelector('span:first-child') || prizeBadge;
        const prizeValue = prizeBadge.querySelector('span:last-child') || prizeBadge;
        
        if (prizeLabel && data.prizeLabel) {
            prizeLabel.textContent = data.prizeLabel + ': ';
        }
        
        if (prizeValue && data.prize) {
            prizeValue.textContent = data.prize;
        } else if (prizeBadge && !prizeLabel.isEqualNode(prizeBadge)) {
            prizeBadge.textContent = (data.prizeLabel || 'Prize Pool') + ': ' + (data.prize || '');
        }
    }
}
