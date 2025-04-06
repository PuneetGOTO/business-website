/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 在后台页面设置同步按钮事件
    if (window.location.href.includes('admin') || window.location.href.includes('dashboard')) {
        // 调用增强版的初始化函数
        initializeAdminSync();
        return; // 在管理界面不自动同步前台内容
    }
    
    // 等待页面完全加载，包括所有资源
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始同步比赛数据');
        
        // 尝试同步比赛
        initMatchData();
    });
    
    // 立即尝试初始化数据，不等待load事件
    console.log('DOM已加载，开始初始化比赛数据...');
    initMatchData();
});

/**
 * 同步比赛数据到前端
 * @param {Object} passedMatchesData - 可选的直接传递的matchesData对象
 */
function syncMatchesToFrontend(passedMatchesData) {
    console.log('开始同步比赛数据到前端...');
    
    try {
        // 优先使用传入的matchesData
        let matchesData = passedMatchesData;
        
        // 如果没有传入数据，尝试从localStorage获取
        if (!matchesData) {
            console.log('未传入matchesData，尝试从localStorage获取');
            let matchesDataJson = localStorage.getItem('matchesData');
            
            // 如果没有matchesData，尝试从upcomingMatchesForm转换
            if (!matchesDataJson) {
                console.log('未找到matchesData，尝试从upcomingMatchesForm转换');
                const formDataJson = localStorage.getItem('upcomingMatchesForm');
                if (formDataJson) {
                    try {
                        const formData = JSON.parse(formDataJson);
                        console.log('找到upcomingMatchesForm数据，准备转换为matchesData格式');
                        matchesData = convertFormToMatchesData(formData);
                        localStorage.setItem('matchesData', JSON.stringify(matchesData));
                        console.log('成功将upcomingMatchesForm转换为matchesData格式');
                    } catch (e) {
                        console.error('转换upcomingMatchesForm数据时出错:', e);
                    }
                } else {
                    console.warn('没有找到保存的比赛数据');
                    return;
                }
            } else {
                try {
                    matchesData = JSON.parse(matchesDataJson);
                    console.log('从localStorage成功解析matchesData');
                } catch (e) {
                    console.error('解析matchesData数据时出错:', e);
                    return;
                }
            }
        } else {
            console.log('使用直接传入的matchesData');
        }
        
        // 验证matchesData格式
        if (!matchesData || !matchesData.matches || !Array.isArray(matchesData.matches)) {
            console.error('无效的比赛数据格式:', matchesData);
            return;
        }
        
        if (matchesData.matches.length === 0) {
            console.warn('比赛数据为空，没有可显示的比赛');
            return;
        }
        
        console.log('成功获取到比赛数据:', matchesData);
        
        // 查找比赛卡片容器 - 使用多种选择器查找策略
        const matchContainers = findMatchContainers();
        if (!matchContainers || matchContainers.length === 0) {
            console.error('未找到比赛卡片容器，无法应用更新');
            return;
        }
        
        console.log(`找到 ${matchContainers.length} 个比赛卡片容器`);
        
        // 更新比赛卡片内容
        updateMatchCards(matchContainers, matchesData.matches);
        
        console.log('比赛数据同步完成！');
    } catch (e) {
        console.error('同步比赛数据时发生错误:', e);
    }
}

/**
 * 查找页面中的比赛卡片容器元素
 * 使用多种选择器策略增加查找成功率
 */
function findMatchContainers() {
    console.log('开始查找比赛卡片容器...');
    
    // 使用多种选择器查找策略
    const selectors = [
        // 1. 直接类选择器
        '.upcoming_matches_content',
        // 2. 结构选择器
        '.col-lg-12 .upcoming_matches_content',
        // 3. 父容器选择器
        'div[data-aos="fade-up"] .upcoming_matches_content',
        // 4. 属性选择器
        'div[class*="upcoming_matches"]',
        // 5. 使用HTML5数据属性
        '[data-match-container]',
        // 6. 通过子元素反查
        '.first_portion, .center_portion, .last_portion',
        // 7. 通过VS标记查找
        '.vs_wrapper'
    ];
    
    // 存储找到的所有容器
    let allContainers = [];
    
    // 遍历所有选择器尝试查找
    for (const selector of selectors) {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                console.log(`使用选择器 "${selector}" 找到 ${elements.length} 个元素`);
                
                // 根据选择器类型找到正确的容器
                for (const el of elements) {
                    // 如果找到的是子元素，向上找到最近的容器
                    if (selector === '.first_portion' || selector === '.center_portion' || selector === '.last_portion' || selector === '.vs_wrapper') {
                        let container = el.closest('.upcoming_matches_content');
                        if (container && !allContainers.includes(container)) {
                            allContainers.push(container);
                        }
                    } 
                    // 否则直接添加到结果中
                    else if (el.classList.contains('upcoming_matches_content') || el.className.includes('upcoming_matches')) {
                        if (!allContainers.includes(el)) {
                            allContainers.push(el);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn(`使用选择器 "${selector}" 查找元素时出错:`, e);
        }
    }
    
    // 如果还是找不到，尝试遍历所有section查找可能的容器
    if (allContainers.length === 0) {
        console.log('通过标准选择器未找到容器，尝试遍历所有section...');
        const sections = document.querySelectorAll('section');
        for (const section of sections) {
            const possibleContainers = section.querySelectorAll('div[class*="matches"]');
            if (possibleContainers.length > 0) {
                console.log(`在section中找到 ${possibleContainers.length} 个可能的容器`);
                for (const container of possibleContainers) {
                    if (!allContainers.includes(container)) {
                        allContainers.push(container);
                    }
                }
            }
        }
    }
    
    // 如果仍然找不到，查找任何可能表示比赛的行元素
    if (allContainers.length === 0) {
        console.log('尝试查找任何可能的比赛行元素...');
        const possibleRows = document.querySelectorAll('.row');
        for (const row of possibleRows) {
            // 查找包含VS文本的行
            if (row.textContent.includes('VS') || row.innerHTML.includes('vs_wrapper')) {
                console.log('找到包含VS的行元素');
                allContainers.push(row);
            }
        }
    }
    
    console.log(`总共找到 ${allContainers.length} 个有效比赛容器`);
    return allContainers;
}

/**
 * 更新比赛卡片内容
 */
function updateMatchCards(containers, matches) {
    console.log(`开始更新 ${containers.length} 个比赛卡片，有 ${matches.length} 场比赛数据`);
    
    // 确保容器和比赛数量匹配
    const containerCount = containers.length;
    const matchCount = matches.length;
    
    // 最多更新能够匹配的数量
    const updateCount = Math.min(containerCount, matchCount);
    console.log(`将更新 ${updateCount} 个比赛卡片`);
    
    for (let i = 0; i < updateCount; i++) {
        const container = containers[i];
        const match = matches[i];
        
        console.log(`更新第 ${i+1} 个比赛卡片:`, match.teams || 'Unknown Teams');
        
        try {
            // 更新比赛卡片内容 - 使用HTML5兼容的查找方式
            updateSingleMatchCard(container, match);
        } catch (e) {
            console.error(`更新第 ${i+1} 个比赛卡片时出错:`, e);
        }
    }
}

/**
 * 更新单个比赛卡片的内容
 * 使用多种选择器策略和直接DOM访问
 */
function updateSingleMatchCard(container, match) {
    // 使用多种选择器和方法尝试更新比赛信息
    
    // 1. 更新团队logo
    updateTeamLogos(container, match);
    
    // 2. 更新比赛名称和日期时间
    updateMatchInfo(container, match);
    
    // 3. 更新比赛详情（组数、玩家数和奖池）
    updateMatchDetails(container, match);
}

/**
 * 更新队伍Logo - 简化版本，不加载Logo以减少错误
 * @param {HTMLElement} container - 比赛卡片容器
 * @param {Object} match - 比赛数据
 */
function updateTeamLogos(container, match) {
    try {
        console.log('Logo功能已禁用，使用默认图片代替');
        
        // 查找可能的图片元素
        const allImages = container.querySelectorAll('img');
        if (allImages && allImages.length > 0) {
            console.log(`找到 ${allImages.length} 个图片元素`);
            
            // 为所有可能的团队Logo图片设置占位图
            allImages.forEach(img => {
                const imgSrc = img.src || '';
                if (imgSrc.includes('team1') || imgSrc.includes('team2') || 
                    img.classList.contains('team-logo') || 
                    img.parentElement && (
                        img.parentElement.classList.contains('first_portion') || 
                        img.parentElement.classList.contains('last_portion')
                    )) {
                    // 使用占位图片替代
                    img.src = '../assets/picture/placeholder.png';
                    img.style.maxWidth = '60px';
                    img.style.maxHeight = '60px';
                    img.onerror = function() {
                        // 如果占位图也加载失败，则隐藏图片
                        this.style.display = 'none';
                    };
                }
            });
        }
    } catch (e) {
        console.error('处理团队logo时出错:', e);
    }
}

/**
 * 更新比赛基本信息（名称、日期、时间）
 */
function updateMatchInfo(container, match) {
    try {
        // 查找center_portion元素
        const centerPortion = findElementInContainer(container, '.center_portion');
        if (!centerPortion) {
            console.warn('未找到center_portion元素，尝试直接查找相关元素');
            
            // 尝试直接查找可能包含比赛名称的元素
            const possibleTeamElements = container.querySelectorAll('p, h3, h4, h5, span');
            for (const el of possibleTeamElements) {
                if (el.children.length === 0 && el.textContent.trim().length > 0) {
                    el.textContent = match.teams || 'Unknown Teams';
                    console.log('已直接更新比赛队伍名称');
                    break;
                }
            }
            
            // 尝试查找日期和时间元素
            const dateTimeElements = container.querySelectorAll('.mr-3, span');
            if (dateTimeElements.length >= 2) {
                for (const el of dateTimeElements) {
                    if (el.textContent.includes('20') || el.textContent.includes(',')) {
                        el.textContent = match.date || 'Unknown Date';
                    } else if (el.textContent.includes(':')) {
                        el.textContent = match.time || 'Unknown Time';
                    }
                }
                console.log('已直接更新日期和时间');
            }
            
            return;
        }
        
        // 更新比赛名称
        const teamElement = centerPortion.querySelector('p') || centerPortion.querySelector('h3') || centerPortion.querySelector('h4');
        if (teamElement) {
            teamElement.textContent = match.teams || 'Unknown Teams';
            console.log('已更新比赛队伍名称:', match.teams);
        }
        
        // 更新日期和时间
        const centerSpanWrapper = centerPortion.querySelector('.center_span_wrapper');
        if (centerSpanWrapper) {
            const spans = centerSpanWrapper.querySelectorAll('span');
            if (spans.length >= 2) {
                // 第一个span通常是日期
                spans[0].textContent = match.date || 'Unknown Date';
                // 第二个span通常是时间
                spans[1].textContent = match.time || 'Unknown Time';
                console.log('已更新比赛日期和时间:', match.date, match.time);
            } else {
                console.warn('在center_span_wrapper中未找到足够的span元素');
            }
        } else {
            console.warn('未找到center_span_wrapper元素');
        }
    } catch (e) {
        console.error('更新比赛信息时出错:', e);
    }
}

/**
 * 更新比赛详情（组数、玩家数和奖池）
 */
function updateMatchDetails(container, match) {
    try {
        // 查找last_portion元素
        const lastPortion = findElementInContainer(container, '.last_portion');
        if (!lastPortion) {
            console.warn('未找到last_portion元素，尝试直接查找相关元素');
            
            // 尝试直接查找可能包含详情的元素
            const allSpans = container.querySelectorAll('span');
            for (const span of allSpans) {
                const text = span.textContent.trim().toLowerCase();
                if (text.includes('group')) {
                    span.textContent = match.groups || '2 Groups';
                } else if (text.includes('player')) {
                    span.textContent = match.players || '32 Players';
                } else if (text.includes('prize') || text.includes('pool')) {
                    span.textContent = match.prize || match.prizePool || '$5000';
                }
            }
            console.log('已直接更新比赛详情');
            
            return;
        }
        
        // 更新组数和玩家数
        const lastSpanWrapper = lastPortion.querySelector('.last_span_wrapper');
        if (lastSpanWrapper) {
            const groupsSpan = lastSpanWrapper.querySelector('.groups');
            const playersSpan = lastSpanWrapper.querySelector('.players');
            
            if (groupsSpan) groupsSpan.textContent = match.groups || '2 Groups';
            if (playersSpan) playersSpan.textContent = match.players || '32 Players';
            console.log('已更新组数和玩家数:', match.groups, match.players);
        }
        
        // 更新奖池信息
        const lastSpanWrapper2 = lastPortion.querySelector('.last_span_wrapper2');
        if (lastSpanWrapper2) {
            const prizeLabelSpan = lastSpanWrapper2.querySelector('.groups');
            const prizeSpan = lastSpanWrapper2.querySelector('.players');
            
            if (prizeLabelSpan) prizeLabelSpan.textContent = match.prizeLabel || 'Prize Pool';
            if (prizeSpan) {
                // 优先使用prize字段，兼容prizePool字段
                prizeSpan.textContent = match.prize || match.prizePool || '$5000';
            }
            console.log('已更新奖池信息:', match.prizeLabel, match.prize || match.prizePool);
        }
    } catch (e) {
        console.error('更新比赛详情时出错:', e);
    }
}

/**
 * 在容器中查找元素，支持多种选择器和兼容方法
 */
function findElementInContainer(container, selector) {
    if (!container) return null;
    
    try {
        // 尝试直接查询
        let element = container.querySelector(selector);
        if (element) return element;
        
        // 尝试通过类名部分匹配
        if (selector.startsWith('.')) {
            const className = selector.substring(1);
            const allElements = container.querySelectorAll('*');
            
            for (const el of allElements) {
                if (el.className && el.className.includes(className)) {
                    return el;
                }
            }
        }
        
        // 尝试通过内容匹配
        if (selector === '.first_portion') {
            // first_portion通常包含VS
            const allElements = container.querySelectorAll('*');
            for (const el of allElements) {
                if (el.innerHTML && el.innerHTML.includes('VS')) {
                    return el.parentElement || el;
                }
            }
        } else if (selector === '.center_portion') {
            // center_portion通常包含日期或时间
            const allElements = container.querySelectorAll('*');
            for (const el of allElements) {
                if (el.innerHTML && (el.innerHTML.includes('calendar') || el.innerHTML.includes('clock'))) {
                    return el.parentElement || el;
                }
            }
        } else if (selector === '.last_portion') {
            // last_portion通常包含Groups或Players
            const allElements = container.querySelectorAll('*');
            for (const el of allElements) {
                if (el.textContent && (el.textContent.includes('Groups') || el.textContent.includes('Players') || el.textContent.includes('Prize'))) {
                    return el.parentElement || el;
                }
            }
        }
        
        return null;
    } catch (e) {
        console.error(`查找元素 "${selector}" 时出错:`, e);
        return null;
    }
}

/**
 * 同步按钮点击事件处理函数
 */
function onSyncButtonClick() {
    // 获取比赛1数据
    const match1Teams = document.getElementById('match1Teams').value;
    const match1Team1Logo = document.getElementById('match1Team1Logo').value;
    const match1Team2Logo = document.getElementById('match1Team2Logo').value;
    const match1Date = document.getElementById('match1Date').value;
    const match1Time = document.getElementById('match1Time').value;
    const match1Groups = document.getElementById('match1Groups').value;
    const match1Players = document.getElementById('match1Players').value;
    const match1PrizeLabel = document.getElementById('match1PrizeLabel').value;
    const match1Prize = document.getElementById('match1Prize').value;
    
    // 获取比赛2数据
    const match2Teams = document.getElementById('match2Teams').value;
    const match2Team1Logo = document.getElementById('match2Team1Logo').value;
    const match2Team2Logo = document.getElementById('match2Team2Logo').value;
    const match2Date = document.getElementById('match2Date').value;
    const match2Time = document.getElementById('match2Time').value;
    const match2Groups = document.getElementById('match2Groups').value;
    const match2Players = document.getElementById('match2Players').value;
    const match2PrizeLabel = document.getElementById('match2PrizeLabel').value;
    const match2Prize = document.getElementById('match2Prize').value;
    
    // 获取比赛3数据
    const match3Teams = document.getElementById('match3Teams').value;
    const match3Team1Logo = document.getElementById('match3Team1Logo').value;
    const match3Team2Logo = document.getElementById('match3Team2Logo').value;
    const match3Date = document.getElementById('match3Date').value;
    const match3Time = document.getElementById('match3Time').value;
    const match3Groups = document.getElementById('match3Groups').value;
    const match3Players = document.getElementById('match3Players').value;
    const match3PrizeLabel = document.getElementById('match3PrizeLabel').value;
    const match3Prize = document.getElementById('match3Prize').value;
    
    // 获取比赛4数据
    const match4Teams = document.getElementById('match4Teams').value;
    const match4Team1Logo = document.getElementById('match4Team1Logo').value;
    const match4Team2Logo = document.getElementById('match4Team2Logo').value;
    const match4Date = document.getElementById('match4Date').value;
    const match4Time = document.getElementById('match4Time').value;
    const match4Groups = document.getElementById('match4Groups').value;
    const match4Players = document.getElementById('match4Players').value;
    const match4PrizeLabel = document.getElementById('match4PrizeLabel').value;
    const match4Prize = document.getElementById('match4Prize').value;
    
    console.log('比赛4数据:', {
        teams: match4Teams,
        team1Logo: match4Team1Logo,
        team2Logo: match4Team2Logo,
        date: match4Date,
        time: match4Time,
        groups: match4Groups,
        players: match4Players,
        prizeLabel: match4PrizeLabel,
        prize: match4Prize
    });
    
    // 组装比赛数据
    const matchesData = {
        matches: [
            {
                teams: match1Teams,
                team1Logo: match1Team1Logo,
                team2Logo: match1Team2Logo,
                date: match1Date,
                time: match1Time,
                groups: match1Groups,
                players: match1Players,
                prizeLabel: match1PrizeLabel,
                prize: match1Prize,
                prizePool: match1Prize // 兼容旧格式
            },
            {
                teams: match2Teams,
                team1Logo: match2Team1Logo,
                team2Logo: match2Team2Logo,
                date: match2Date,
                time: match2Time,
                groups: match2Groups,
                players: match2Players,
                prizeLabel: match2PrizeLabel,
                prize: match2Prize,
                prizePool: match2Prize // 兼容旧格式
            },
            {
                teams: match3Teams,
                team1Logo: match3Team1Logo,
                team2Logo: match3Team2Logo,
                date: match3Date,
                time: match3Time,
                groups: match3Groups,
                players: match3Players,
                prizeLabel: match3PrizeLabel,
                prize: match3Prize,
                prizePool: match3Prize // 兼容旧格式
            },
            {
                teams: match4Teams,
                team1Logo: match4Team1Logo,
                team2Logo: match4Team2Logo,
                date: match4Date,
                time: match4Time,
                groups: match4Groups,
                players: match4Players,
                prizeLabel: match4PrizeLabel,
                prize: match4Prize,
                prizePool: match4Prize // 兼容旧格式
            }
        ]
    };
    
    console.log('同步的比赛数据:', matchesData);
    
    // 保存比赛数据
    localStorage.setItem('matchesData', JSON.stringify(matchesData));
    
    // 显示成功消息
    alert('比赛数据已保存！');
}

/**
 * 在点击同步按钮时调用
 */
function onSyncButtonClick() {
    console.log('手动同步比赛数据...');
    
    // 收集表单中的比赛数据
    const matchesData = collectMatchDataFromForms();
    
    // 保存到localStorage
    localStorage.setItem('matchesData', JSON.stringify(matchesData));
    
    // 尝试更新前台
    syncMatchesToFrontend();
    
    // 强制单独同步比赛4
    setTimeout(function() {
        syncMatch4();
    }, 300);
    
    return false; // 阻止表单默认提交
}

// 添加后台管理同步按钮的专用处理函数
function onAdminSyncButtonClick() {
    console.log('设置后台管理同步按钮...');
    
    // 查找保存或同步按钮
    const syncButton = document.querySelector('#syncButton') || 
                     document.querySelector('button[data-sync]') || 
                     document.querySelector('button:contains("同步")') ||
                     document.querySelector('button:contains("Sync")');
    
    if (syncButton) {
        console.log('找到同步按钮:', syncButton);
        syncButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('后台管理同步按钮点击');
            onSyncButtonClick();
        });
    } else {
        console.log('未找到同步按钮，尝试延迟查找');
        setTimeout(function() {
            const laterSyncButton = document.querySelector('#syncButton') || 
                                  document.querySelector('button[data-sync]') || 
                                  document.querySelector('button:contains("同步")') ||
                                  document.querySelector('button:contains("Sync")') ||
                                  document.querySelector('button[type="submit"]');
            
            if (laterSyncButton) {
                console.log('延迟后找到同步按钮:', laterSyncButton);
                laterSyncButton.addEventListener('click', function(e) {
                    // 不阻止表单提交
                    // e.preventDefault();
                    
                    console.log('后台管理同步按钮点击');
                    
                    // 在表单提交后处理同步 - 使用setTimeout确保数据已保存
                    setTimeout(function() {
                        onSyncButtonClick();
                    }, 500);
                });
            } else {
                // 如果还是找不到按钮，尝试监听表单提交事件
                const form = document.querySelector('form#upcomingMatchesForm');
                if (form) {
                    console.log('找到比赛表单，监听提交事件');
                    form.addEventListener('submit', function(e) {
                        // 不阻止表单提交
                        // e.preventDefault();
                        
                        console.log('比赛表单提交，准备同步数据');
                        
                        // 表单提交后处理同步
                        setTimeout(function() {
                            // 确保首先收集和保存表单数据到matchesData格式
                            const matchData = collectMatchDataFromForms();
                            localStorage.setItem('matchesData', JSON.stringify(matchData));
                            console.log('已将表单数据保存为matchesData格式');
                            
                            // 然后触发同步
                            onSyncButtonClick();
                        }, 500);
                    });
                } else {
                    console.log('即使延迟后仍未找到同步按钮');
                }
            }
        }, 1000);
    }
}

/**
 * 设置比赛数据 - 填充表单字段
 */
function setupMatchData() {
    try {
        console.log('设置比赛数据');
        
        // 从localStorage中获取数据
        let upcomingMatchesForm = null;
        try {
            const formJson = localStorage.getItem('upcomingMatchesForm');
            if (formJson) {
                upcomingMatchesForm = JSON.parse(formJson);
                console.log('成功从localStorage获取upcomingMatchesForm数据', upcomingMatchesForm);
            } else {
                console.log('localStorage中不存在upcomingMatchesForm数据');
            }
        } catch (e) {
            console.error('解析upcomingMatchesForm数据时出错:', e);
        }
        
        // 检查matchesData是否存在
        let matchesData = null;
        try {
            const matchesJson = localStorage.getItem('matchesData');
            if (matchesJson) {
                matchesData = JSON.parse(matchesJson);
                console.log('成功从localStorage获取matchesData数据', matchesData);
            } else {
                console.log('localStorage中不存在matchesData数据');
            }
        } catch (e) {
            console.error('解析matchesData数据时出错:', e);
        }
        
        // 如果upcomingMatchesForm存在但matchesData不存在或为空，则转换数据
        if (upcomingMatchesForm && (!matchesData || !matchesData.matches || matchesData.matches.length === 0)) {
            console.log('准备将upcomingMatchesForm转换为matchesData格式');
            matchesData = convertFormToMatchesData(upcomingMatchesForm);
            
            // 保存转换后的数据到localStorage
            localStorage.setItem('matchesData', JSON.stringify(matchesData));
            console.log('已将转换后的matchesData保存到localStorage', matchesData);
        }
        
        // 如果现在有matchesData数据，尝试同步到前端
        if (matchesData && matchesData.matches && matchesData.matches.length > 0) {
            console.log('立即同步matchesData到前端');
            // 直接传递matchesData对象进行同步
            syncMatchesToFrontend(matchesData);
        } else {
            console.log('没有可用的matchesData，尝试常规同步方法');
            syncMatchesToFrontend();
        }
    } catch (e) {
        console.error('设置比赛数据时出错:', e);
    }
}

/**
 * 收集表单中的比赛数据
 * @returns {Object} - 比赛数据
 */
function collectMatchDataFromForms() {
    // 获取比赛1数据
    const match1Teams = document.getElementById('match1Teams').value;
    const match1Team1Logo = document.getElementById('match1Team1Logo').value;
    const match1Team2Logo = document.getElementById('match1Team2Logo').value;
    const match1Date = document.getElementById('match1Date').value;
    const match1Time = document.getElementById('match1Time').value;
    const match1Groups = document.getElementById('match1Groups').value;
    const match1Players = document.getElementById('match1Players').value;
    const match1PrizeLabel = document.getElementById('match1PrizeLabel').value;
    const match1Prize = document.getElementById('match1Prize').value;
    
    // 获取比赛2数据
    const match2Teams = document.getElementById('match2Teams').value;
    const match2Team1Logo = document.getElementById('match2Team1Logo').value;
    const match2Team2Logo = document.getElementById('match2Team2Logo').value;
    const match2Date = document.getElementById('match2Date').value;
    const match2Time = document.getElementById('match2Time').value;
    const match2Groups = document.getElementById('match2Groups').value;
    const match2Players = document.getElementById('match2Players').value;
    const match2PrizeLabel = document.getElementById('match2PrizeLabel').value;
    const match2Prize = document.getElementById('match2Prize').value;
    
    // 获取比赛3数据
    const match3Teams = document.getElementById('match3Teams').value;
    const match3Team1Logo = document.getElementById('match3Team1Logo').value;
    const match3Team2Logo = document.getElementById('match3Team2Logo').value;
    const match3Date = document.getElementById('match3Date').value;
    const match3Time = document.getElementById('match3Time').value;
    const match3Groups = document.getElementById('match3Groups').value;
    const match3Players = document.getElementById('match3Players').value;
    const match3PrizeLabel = document.getElementById('match3PrizeLabel').value;
    const match3Prize = document.getElementById('match3Prize').value;
    
    // 获取比赛4数据
    const match4Teams = document.getElementById('match4Teams').value;
    const match4Team1Logo = document.getElementById('match4Team1Logo').value;
    const match4Team2Logo = document.getElementById('match4Team2Logo').value;
    const match4Date = document.getElementById('match4Date').value;
    const match4Time = document.getElementById('match4Time').value;
    const match4Groups = document.getElementById('match4Groups').value;
    const match4Players = document.getElementById('match4Players').value;
    const match4PrizeLabel = document.getElementById('match4PrizeLabel').value;
    const match4Prize = document.getElementById('match4Prize').value;
    
    // 组装比赛数据
    const matchesData = {
        matches: [
            {
                teams: match1Teams,
                team1Logo: match1Team1Logo,
                team2Logo: match1Team2Logo,
                date: match1Date,
                time: match1Time,
                groups: match1Groups,
                players: match1Players,
                prizeLabel: match1PrizeLabel,
                prize: match1Prize,
                prizePool: match1Prize // 兼容旧格式
            },
            {
                teams: match2Teams,
                team1Logo: match2Team1Logo,
                team2Logo: match2Team2Logo,
                date: match2Date,
                time: match2Time,
                groups: match2Groups,
                players: match2Players,
                prizeLabel: match2PrizeLabel,
                prize: match2Prize,
                prizePool: match2Prize // 兼容旧格式
            },
            {
                teams: match3Teams,
                team1Logo: match3Team1Logo,
                team2Logo: match3Team2Logo,
                date: match3Date,
                time: match3Time,
                groups: match3Groups,
                players: match3Players,
                prizeLabel: match3PrizeLabel,
                prize: match3Prize,
                prizePool: match3Prize // 兼容旧格式
            },
            {
                teams: match4Teams,
                team1Logo: match4Team1Logo,
                team2Logo: match4Team2Logo,
                date: match4Date,
                time: match4Time,
                groups: match4Groups,
                players: match4Players,
                prizeLabel: match4PrizeLabel,
                prize: match4Prize,
                prizePool: match4Prize // 兼容旧格式
            }
        ]
    };
    
    return matchesData;
}

/**
 * 比赛数据同步到前台
 */
function syncMatchesToFrontend() {
    console.log('尝试同步比赛数据到前台...');
    
    // 从localStorage获取比赛数据
    const matchesDataJson = localStorage.getItem('matchesData');
    if (!matchesDataJson) {
        console.log('没有找到保存的比赛数据');
        return false;
    }
    
    const matchesData = JSON.parse(matchesDataJson);
    console.log('加载比赛数据:', matchesData);
    
    if (!matchesData || !matchesData.matches || !Array.isArray(matchesData.matches)) {
        console.error('比赛数据格式错误');
        return false;
    }
    
    // 尝试多种选择器查找比赛卡片
    updateMatchCards(findMatchContainers(), matchesData.matches);
}

/**
 * 单独处理比赛4的数据同步
 */
function syncMatch4() {
    console.log('开始单独同步比赛4数据');
    
    try {
        // 获取比赛数据
        const matchesDataJson = localStorage.getItem('matchesData');
        if (!matchesDataJson) {
            console.log('localStorage中没有找到比赛数据');
            return false;
        }
        
        // 解析比赛数据
        let matchesData = JSON.parse(matchesDataJson);
        console.log('找到比赛数据:', matchesData);
        
        // 如果是旧格式，先转换
        if (!matchesData.matches && (matchesData.match4Teams || matchesData.match4Date)) {
            matchesData = convertOldFormatToNew(matchesData);
        }
        
        // 确保有比赛数组且有第4个比赛
        if (!matchesData.matches || matchesData.matches.length < 4) {
            console.log('比赛数据中没有第4个比赛');
            
            // 如果有第4场比赛的原始数据但没有被处理到matches数组中
            if (matchesData.match4Teams) {
                console.log('尝试手动添加第4个比赛');
                
                if (!matchesData.matches) {
                    matchesData.matches = [];
                }
                
                // 手动添加第4场比赛
                matchesData.matches.push({
                    teams: matchesData.match4Teams,
                    date: matchesData.match4Date,
                    time: matchesData.match4Time,
                    groups: matchesData.match4Groups,
                    players: matchesData.match4Players,
                    prizeLabel: matchesData.match4PrizeLabel || 'Prize Pool',
                    prize: matchesData.match4Prize || matchesData.match4PrizePool || '$5000',
                    prizePool: matchesData.match4Prize || matchesData.match4PrizePool || '$5000', // 兼容旧格式
                    team1Logo: formatImagePath(matchesData.match4Team1Logo || 'assets/img/team1.png'),
                    team2Logo: formatImagePath(matchesData.match4Team2Logo || 'assets/img/team2.png')
                });
            } else {
                return false;
            }
        }
        
        const match4 = matchesData.matches[3];
        console.log('比赛4数据:', match4);
        
        // 尝试直接更新第4个比赛卡片
        const match4Card = document.querySelector('.upcoming_matches_content:nth-child(4)') || 
                         document.querySelector('.upcoming_matches_content[data-match-index="3"]') ||
                         document.querySelector('.upcoming_matches_section .row > div:nth-child(4) .upcoming_matches_content');
        
        if (match4Card) {
            console.log('找到比赛4卡片，进行更新');
            // 使用更新后的updateContainerContent函数更新卡片
            updateContainerContent(match4Card, match4);
            return true;
        } else {
            console.log('找不到比赛4卡片，尝试创建');
            
            // 找到比赛区域
            const matchSection = document.querySelector('.upcoming_matches_section') || 
                               document.querySelector('section.upcoming_matches');
            
            if (matchSection) {
                // 查找卡片容器行
                let cardRow = matchSection.querySelector('.row:not(:first-child)');
                if (!cardRow) {
                    console.log('找不到卡片容器行，创建新行');
                    cardRow = document.createElement('div');
                    cardRow.className = 'row';
                    matchSection.appendChild(cardRow);
                }
                
                // 确保图片路径正确 - 使用确认存在的图片文件
                const team1LogoPath = 'assets/img/team1.png';
                const team2LogoPath = 'assets/img/team2.png';
                
                // 创建第4个比赛卡片
                const match4CardHtml = `
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 d-table align-item-center">
                    <div class="upcoming_matches_content mb-2 padding_bottom" data-match-index="3">
                        <div class="row">
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div class="first_portion">
                                    <figure class="mb-0"><img src="${team1LogoPath}" alt="Team 1"></figure>
                                    <div class="vs_wrapper"><span>VS</span></div>
                                    <figure class="mb-0"><img src="${team2LogoPath}" alt="Team 2"></figure>
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div class="center_portion">
                                    <p class="mb-0">${match4.teams || 'Tournament Match'}</p>
                                    <div class="center_span_wrapper">
                                        <i class="fa-solid fa-calendar-days mr-1" aria-hidden="true"></i>
                                        <span class="mr-3">${match4.date || 'TBD'}</span>
                                        <i class="fa-regular fa-clock mr-1"></i>
                                        <span>${match4.time || 'TBD'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-5 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div class="last_portion">
                                    <div class="last_span_wrapper">
                                        <span class="groups">${match4.groups || '2 Groups'}</span>
                                        <span class="players">${match4.players || '32 Players'}</span>
                                    </div>
                                    <div class="last_span_wrapper2">
                                        <span class="groups">${match4.prizeLabel || 'Prize Pool'}</span>
                                        <span class="players">${match4.prize || '$5000'}</span>
                                    </div>
                                    <a href="#"><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                
                // 添加到DOM
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = match4CardHtml;
                cardRow.appendChild(tempDiv.firstElementChild);
                
                console.log('已创建比赛4卡片');
                return true;
            } else {
                console.log('找不到比赛区域，无法创建比赛4卡片');
            }
        }
        
        return false;
    } catch (error) {
        console.error('同步比赛4数据时出错:', error);
        return false;
    }
}

/**
 * 统一格式化路径
 */
function formatImagePath(path) {
    if (!path) return 'assets/img/team1.png';
    
    // 确保路径中使用正确的格式
    let formattedPath = path;
    
    // 如果路径是assets/picture/开头的，转换为assets/img/
    if (formattedPath.includes('assets/picture/')) {
        formattedPath = formattedPath.replace('assets/picture/', 'assets/img/');
    }
    
    // 如果是team1.png或team2.png，指向确认存在的文件
    if (formattedPath.includes('team1.png') || formattedPath.includes('team2.png')) {
        return formattedPath.includes('team1') ? 'assets/img/team1.png' : 'assets/img/team2.png';
    }
    
    // 如果路径不是以assets开头，添加前缀
    if (!formattedPath.includes('assets/')) {
        if (formattedPath.startsWith('/')) {
            formattedPath = 'assets' + formattedPath;
        } else {
            formattedPath = 'assets/' + formattedPath;
        }
    }
    
    console.log('格式化后的图片路径:', formattedPath);
    return formattedPath;
}

/**
 * 数据初始化 - 立即执行匿名函数处理页面加载和数据同步
 */
(function() {
    console.log('比赛同步工具已加载');
    
    // 添加DOMContentLoaded监听
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM已加载，开始初始化比赛数据...');
        initMatchData();
    });
    
    // 添加window.load监听，确保即使DOMContentLoaded已经触发也会执行
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始同步比赛数据');
        initMatchData();
        
        // 3秒后再次尝试，以防第一次失败
        setTimeout(function() {
            console.log('第二次尝试同步比赛数据...');
            syncMatchesToFrontend();
        }, 3000);
    });
    
    /**
     * 初始化比赛数据，确保从upcomingMatchesForm转换到matchesData
     */
    function initMatchData() {
        console.log('初始化比赛数据...');
        
        // 从localStorage中获取数据
        let upcomingMatchesForm = null;
        try {
            const formJson = localStorage.getItem('upcomingMatchesForm');
            if (formJson) {
                upcomingMatchesForm = JSON.parse(formJson);
                console.log('成功从localStorage获取upcomingMatchesForm数据', upcomingMatchesForm);
            }
        } catch (e) {
            console.error('解析upcomingMatchesForm数据时出错:', e);
        }
        
        // 从localStorage获取已存在的matchesData
        let matchesData = null;
        try {
            const dataJson = localStorage.getItem('matchesData');
            if (dataJson) {
                matchesData = JSON.parse(dataJson);
                console.log('成功从localStorage获取matchesData数据', matchesData);
            }
        } catch (e) {
            console.error('解析matchesData数据时出错:', e);
        }
        
        // 立即同步数据到前端
        if (matchesData) {
            console.log('立即同步matchesData到前端');
            syncMatchesToFrontend(matchesData);
        }
        
        // 设置定时器，每10秒检查一次localStorage的变化
        setInterval(function() {
            try {
                const newDataJson = localStorage.getItem('matchesData');
                if (newDataJson) {
                    const newData = JSON.parse(newDataJson);
                    
                    // 检查是否与当前数据不同
                    if (JSON.stringify(newData) !== JSON.stringify(matchesData)) {
                        console.log('检测到matchesData更新，同步到前端');
                        matchesData = newData;
                        syncMatchesToFrontend(matchesData);
                    }
                }
            } catch (e) {
                console.error('定时检查matchesData更新时出错:', e);
            }
        }, 10000);
        
    }
})();

/**
 * 将表单数据转换为matchesData格式
 */
function convertFormToMatchesData(formData) {
    console.log('开始转换表单数据为matchesData格式:', formData);
    
    const matchesData = {
        matches: []
    };
    
    // 处理match1数据
    if (formData.match1Teams) {
        matchesData.matches.push({
            teams: formData.match1Teams,
            date: formData.match1Date || '',
            time: formData.match1Time || '',
            groups: formData.match1Groups || '',
            players: formData.match1Players || '',
            prizeLabel: formData.match1PrizeLabel || 'Prize Pool',
            prize: formData.match1Prize || formData.match1PrizePool || '$5000',
            prizePool: formData.match1Prize || formData.match1PrizePool || '$5000', // 兼容旧格式
            team1Logo: formatImagePath(formData.match1Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(formData.match1Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 处理match2数据
    if (formData.match2Teams) {
        matchesData.matches.push({
            teams: formData.match2Teams,
            date: formData.match2Date || '',
            time: formData.match2Time || '',
            groups: formData.match2Groups || '',
            players: formData.match2Players || '',
            prizeLabel: formData.match2PrizeLabel || 'Prize Pool',
            prize: formData.match2Prize || formData.match2PrizePool || '$5000',
            prizePool: formData.match2Prize || formData.match2PrizePool || '$5000', // 兼容旧格式
            team1Logo: formatImagePath(formData.match2Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(formData.match2Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 处理match3数据
    if (formData.match3Teams) {
        matchesData.matches.push({
            teams: formData.match3Teams,
            date: formData.match3Date || '',
            time: formData.match3Time || '',
            groups: formData.match3Groups || '',
            players: formData.match3Players || '',
            prizeLabel: formData.match3PrizeLabel || 'Prize Pool',
            prize: formData.match3Prize || formData.match3PrizePool || '$5000',
            prizePool: formData.match3Prize || formData.match3PrizePool || '$5000', // 兼容旧格式
            team1Logo: formatImagePath(formData.match3Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(formData.match3Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 处理match4数据
    if (formData.match4Teams) {
        matchesData.matches.push({
            teams: formData.match4Teams,
            date: formData.match4Date || '',
            time: formData.match4Time || '',
            groups: formData.match4Groups || '',
            players: formData.match4Players || '',
            prizeLabel: formData.match4PrizeLabel || 'Prize Pool',
            prize: formData.match4Prize || formData.match4PrizePool || '$5000',
            prizePool: formData.match4Prize || formData.match4PrizePool || '$5000', // 兼容旧格式
            team1Logo: formatImagePath(formData.match4Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(formData.match4Team2Logo || 'assets/img/team2.png')
        });
    }
    
    console.log('转换后的matchesData:', matchesData);
    return matchesData;
}

/**
 * 初始化后台同步功能
 */
function initializeAdminSync() {
    // 检测是否在管理后台页面
    const isAdminPage = window.location.href.includes('dashboard') || 
                       document.querySelector('form#upcomingMatchesForm');
    
    if (isAdminPage) {
        console.log('检测到管理后台页面，设置表单提交监听');
        
        // 直接为所有表单添加提交事件监听
        document.addEventListener('submit', function(event) {
            console.log('表单提交事件触发:', event.target);
            
            // 检查是否是upcomingMatches表单
            if (event.target.id === 'upcomingMatchesForm' || 
                event.target.classList.contains('upcomingMatches-form') ||
                event.target.querySelector('[name^="match"]')) {
                
                console.log('检测到比赛表单提交，准备处理数据同步');
                
                // 延迟执行以确保表单数据已保存
                setTimeout(function() {
                    // 获取最新的表单数据
                    const formDataJson = localStorage.getItem('upcomingMatchesForm');
                    if (formDataJson) {
                        try {
                            const formData = JSON.parse(formDataJson);
                            console.log('获取到最新的表单数据:', formData);
                            
                            // 将表单数据转换为matchesData格式
                            const matchesData = convertFormToMatchesData(formData);
                            localStorage.setItem('matchesData', JSON.stringify(matchesData));
                            console.log('成功将表单数据转换为matchesData格式:', matchesData);
                            
                            // 触发同步
                            syncMatchesToFrontend();
                        } catch (e) {
                            console.error('处理表单数据时出错:', e);
                        }
                    }
                }, 500);
            }
        }, true); // 使用捕获模式，确保在事件冒泡前捕获
        
        // 查找所有可能的保存/同步按钮
        const allButtons = document.querySelectorAll('button, input[type="submit"]');
        console.log('页面上找到的按钮数量:', allButtons.length);
        
        allButtons.forEach(function(button, index) {
            console.log(`按钮 ${index+1}:`, button.outerHTML || button.id || button.className || '未命名按钮');
            
            // 为所有按钮添加点击事件监听（以防万一）
            button.addEventListener('click', function(e) {
                // 不阻止默认行为，让表单正常提交
                console.log('按钮点击:', this.id || this.className || '未命名按钮');
                
                // 对于提交类按钮，在点击后尝试同步
                if (this.type === 'submit' || 
                    this.form || 
                    this.closest('form') ||
                    this.id.includes('save') || 
                    this.id.includes('submit') ||
                    this.id.includes('sync')) {
                    
                    console.log('检测到保存/提交按钮点击，准备同步数据');
                    
                    // 延迟执行数据转换和同步
                    setTimeout(function() {
                        // 从localStorage获取最新的表单数据
                        const formDataJson = localStorage.getItem('upcomingMatchesForm');
                        if (formDataJson) {
                            try {
                                const formData = JSON.parse(formDataJson);
                                const matchesData = convertFormToMatchesData(formData);
                                localStorage.setItem('matchesData', JSON.stringify(matchesData));
                                console.log('按钮点击后成功转换数据格式');
                                
                                // 尝试同步到前台
                                syncMatchesToFrontend();
                            } catch (e) {
                                console.error('处理按钮点击后的表单数据时出错:', e);
                            }
                        }
                    }, 1000);
                }
            });
        });
    }
}

/**
 * 设置后台管理同步按钮
 */
function setAdminSyncButton() {
    console.log('设置后台管理同步按钮...');
    
    // 使用原生JavaScript方法查找包含特定文本的按钮
    const syncButtonElements = Array.from(document.querySelectorAll('button')).filter(button => 
        button.textContent.includes('同步') || 
        button.textContent.includes('Sync') ||
        button.id.includes('sync') ||
        button.className.includes('sync')
    );
    
    const syncButton = syncButtonElements[0] || 
                      document.querySelector('#syncButton') || 
                      document.querySelector('button[data-sync]');
    
    if (syncButton) {
        console.log('找到同步按钮:', syncButton);
        syncButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('后台管理同步按钮点击');
            onSyncButtonClick();
        });
    } else {
        console.log('未找到同步按钮，尝试延迟查找');
        setTimeout(function() {
            // 再次尝试使用原生JavaScript过滤器
            const laterButtonElements = Array.from(document.querySelectorAll('button')).filter(button => 
                button.textContent.includes('同步') || 
                button.textContent.includes('Sync') ||
                button.id.includes('sync') ||
                button.className.includes('sync')
            );
            
            const laterSyncButton = laterButtonElements[0] || 
                                   document.querySelector('#syncButton') || 
                                   document.querySelector('button[data-sync]') || 
                                   document.querySelector('button[type="submit"]');
            
            if (laterSyncButton) {
                console.log('延迟后找到同步按钮:', laterSyncButton);
                laterSyncButton.addEventListener('click', function(e) {
                    // 不阻止表单提交
                    // e.preventDefault();
                    
                    console.log('后台管理同步按钮点击');
                    
                    // 在表单提交后处理同步 - 使用setTimeout确保数据已保存
                    setTimeout(function() {
                        onSyncButtonClick();
                    }, 500);
                });
            }
        }, 1000);
    }
}

/**
 * 同步按钮点击处理
 */
function onSyncButtonClick() {
    console.log('处理同步按钮点击...');
    
    // 获取表单数据
    const formData = {};
    const form = document.querySelector('#upcomingMatchesForm');
    
    if (form) {
        // 使用FormData获取表单值
        const formElements = new FormData(form);
        for(let [name, value] of formElements.entries()) {
            formData[name] = value;
        }
        
        console.log('从表单获取到数据:', formData);
        
        // 保存到localStorage
        localStorage.setItem('upcomingMatchesForm', JSON.stringify(formData));
        
        // 转换为matchesData格式并保存
        const matchesData = convertFormToMatchesData(formData);
        localStorage.setItem('matchesData', JSON.stringify(matchesData));
        
        // 触发同步
        syncMatchesToFrontend(matchesData);
        
        console.log('数据已同步到前台');
        alert('数据已同步到前台');
    } else {
        console.error('找不到表单元素');
        alert('同步失败：找不到表单元素');
    }
}

/**
 * 初始化脚本执行
 */
console.log('比赛同步工具已加载');

// 移除重复的初始化代码
// DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载，开始初始化比赛数据...');
    initMatchData();
});

/**
 * 初始化比赛数据
 */
function initMatchData() {
    console.log('初始化比赛数据...');
    
    try {
        // 从localStorage中获取数据
        let upcomingMatchesForm = null;
        try {
            const formJson = localStorage.getItem('upcomingMatchesForm');
            if (formJson) {
                upcomingMatchesForm = JSON.parse(formJson);
                console.log('成功从localStorage获取upcomingMatchesForm数据', upcomingMatchesForm);
            }
        } catch (e) {
            console.error('解析upcomingMatchesForm数据时出错:', e);
        }
        
        // 从localStorage获取已存在的matchesData
        let matchesData = null;
        try {
            const dataJson = localStorage.getItem('matchesData');
            if (dataJson) {
                matchesData = JSON.parse(dataJson);
                console.log('成功从localStorage获取matchesData数据', matchesData);
            }
        } catch (e) {
            console.error('解析matchesData数据时出错:', e);
        }
        
        // 立即同步数据到前端
        if (matchesData) {
            console.log('立即同步matchesData到前端');
            syncMatchesToFrontend(matchesData);
        }
        
        // 设置定时器，每10秒检查一次localStorage的变化
        setInterval(function() {
            try {
                const newDataJson = localStorage.getItem('matchesData');
                if (newDataJson) {
                    const newData = JSON.parse(newDataJson);
                    
                    // 检查是否与当前数据不同
                    if (JSON.stringify(newData) !== JSON.stringify(matchesData)) {
                        console.log('检测到matchesData更新，同步到前端');
                        matchesData = newData;
                        syncMatchesToFrontend(matchesData);
                    }
                }
            } catch (e) {
                console.error('定时检查matchesData更新时出错:', e);
            }
        }, 10000);
        
    } catch (e) {
        console.error('初始化比赛数据时出错:', e);
    }
}
