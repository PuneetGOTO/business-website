/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 延迟执行以确保DOM完全加载
    setTimeout(function() {
        syncMatchesToFrontend();
    }, 2000); // 使用2秒延迟给页面更多加载时间
    
    // 为防止第一次执行时DOM尚未完全准备好，再次延迟执行
    setTimeout(function() {
        console.log("第二次尝试同步比赛数据...");
        syncMatchesToFrontend();
    }, 5000); // 5秒后再次尝试
});

/**
 * 将比赛数据从localStorage同步到前端页面
 */
function syncMatchesToFrontend() {
    console.log('开始同步比赛数据到前端');
    
    // 从localStorage获取比赛数据
    let matchesData = JSON.parse(localStorage.getItem('upcomingMatchesForm'));
    
    if (!matchesData) {
        console.error('没有找到比赛数据或数据格式不正确');
        
        // 尝试遍历localStorage中的所有键，寻找可能的比赛数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const value = localStorage.getItem(key);
                console.log(`localStorage键[${i}]: ${key}, 值: ${value ? value.substring(0, 50) + "..." : "空"}`);
                
                // 检查是否是JSON格式且包含比赛相关字段
                if (value && value.includes('match') && value.includes('team')) {
                    try {
                        const data = JSON.parse(value);
                        if (data && (data.matches || data.match1Teams || data.upcomingMatchesTitle)) {
                            console.log('找到可能的比赛数据:', key);
                            matchesData = data;
                            break;
                        }
                    } catch (e) {
                        console.log('尝试解析JSON失败:', e.message);
                    }
                }
            } catch (e) {
                console.error(`读取localStorage键[${i}]时出错:`, e);
            }
        }
        
        if (!matchesData) {
            return;
        }
    }
    
    console.log('找到比赛数据:', matchesData);
    
    // 将旧格式转换为新格式
    if (!matchesData.matches && (matchesData.match1Teams || matchesData.match2Teams || matchesData.match3Teams || matchesData.match4Teams)) {
        console.log('检测到旧格式比赛数据，转换为新格式');
        
        matchesData.matches = [];
        
        // 转换比赛1
        if (matchesData.match1Teams) {
            matchesData.matches.push({
                teams: matchesData.match1Teams,
                date: matchesData.match1Date,
                time: matchesData.match1Time,
                groups: matchesData.match1Groups,
                players: matchesData.match1Players,
                prizeLabel: matchesData.match1PrizeLabel || 'Prize Pool',
                prize: matchesData.match1Prize || matchesData.match1PrizePool || '$5000',
                team1Logo: matchesData.match1Team1Logo || 'assets/picture/team1.png',
                team2Logo: matchesData.match1Team2Logo || 'assets/picture/team2.png'
            });
        }
        
        // 转换比赛2
        if (matchesData.match2Teams) {
            matchesData.matches.push({
                teams: matchesData.match2Teams,
                date: matchesData.match2Date,
                time: matchesData.match2Time,
                groups: matchesData.match2Groups,
                players: matchesData.match2Players,
                prizeLabel: matchesData.match2PrizeLabel || 'Prize Pool',
                prize: matchesData.match2Prize || matchesData.match2PrizePool || '$5000',
                team1Logo: matchesData.match2Team1Logo || 'assets/picture/team1.png',
                team2Logo: matchesData.match2Team2Logo || 'assets/picture/team2.png'
            });
        }
        
        // 转换比赛3
        if (matchesData.match3Teams) {
            matchesData.matches.push({
                teams: matchesData.match3Teams,
                date: matchesData.match3Date,
                time: matchesData.match3Time,
                groups: matchesData.match3Groups,
                players: matchesData.match3Players,
                prizeLabel: matchesData.match3PrizeLabel || 'Prize Pool',
                prize: matchesData.match3Prize || matchesData.match3PrizePool || '$5000',
                team1Logo: matchesData.match3Team1Logo || 'assets/picture/team1.png',
                team2Logo: matchesData.match3Team2Logo || 'assets/picture/team2.png'
            });
        }
        
        // 转换比赛4
        if (matchesData.match4Teams) {
            matchesData.matches.push({
                teams: matchesData.match4Teams,
                date: matchesData.match4Date,
                time: matchesData.match4Time,
                groups: matchesData.match4Groups,
                players: matchesData.match4Players,
                prizeLabel: matchesData.match4PrizeLabel || 'Prize Pool',
                prize: matchesData.match4Prize || matchesData.match4PrizePool || '$5000',
                team1Logo: matchesData.match4Team1Logo || 'assets/picture/team1.png',
                team2Logo: matchesData.match4Team2Logo || 'assets/picture/team2.png'
            });
        }
        
        console.log('转换后的数据:', matchesData);
    }
    
    // 如果没有matches数组，创建一个空数组
    if (!matchesData.matches) {
        matchesData.matches = [];
    }
    
    // 更新标题
    const titleElements = document.querySelectorAll('h2');
    let titleUpdated = false;
    
    titleElements.forEach(element => {
        // 查找包含"比赛"、"Upcoming"或"Match"等关键词的标题
        if (element.textContent.includes('比赛') || 
            element.textContent.includes('Upcoming') || 
            element.textContent.toLowerCase().includes('match')) {
            
            if (matchesData.upcomingMatchesTitle) {
                element.textContent = matchesData.upcomingMatchesTitle;
                console.log('更新了比赛标题:', matchesData.upcomingMatchesTitle);
                titleUpdated = true;
            }
        }
    });
    
    if (!titleUpdated) {
        console.log('未找到比赛标题元素');
    }
    
    // 直接查找比赛部分 - 首先查找整个section
    console.log('开始查找比赛section和卡片');
    const matchSection = findMatchSection();
    if (matchSection) {
        console.log('找到比赛section:', matchSection);
        
        // 尝试直接更新比赛部分
        if (updateMatchSection(matchSection, matchesData)) {
            console.log('成功更新了比赛section');
            return;
        }
    }
    
    // 尝试多种选择器查找比赛卡片
    findAndUpdateMatchCards(matchesData);
}

/**
 * 尝试多种方法查找并更新比赛卡片
 */
function findAndUpdateMatchCards(matchesData) {
    // 定义可能的选择器列表，按优先级排序
    const selectors = [
        '.upcoming_matches_content',
        'div.upcoming_matches_content',
        '.upcoming_matches_section .row > div > div',
        'section:contains("比赛") .row > div > div',
        'section:contains("比赛") div',
        'div[class*="match"]',
        '.col-lg-12 > div'
    ];
    
    let matchCards = [];
    
    // 依次尝试每个选择器
    for (let i = 0; i < selectors.length; i++) {
        try {
            // 由于:contains选择器在原生JS中不支持，需要特殊处理
            if (selectors[i].includes(':contains')) {
                const parts = selectors[i].split(':contains(');
                const baseSelector = parts[0];
                const searchText = parts[1].replace('"', '').replace('")', '');
                
                const elements = document.querySelectorAll(baseSelector);
                matchCards = Array.from(elements).filter(el => 
                    el.textContent.includes(searchText)
                );
                
                if (matchCards.length > 0) {
                    console.log(`使用自定义选择器 "${selectors[i]}" 找到元素:`, matchCards.length);
                    break;
                }
            } else {
                // 标准选择器
                matchCards = document.querySelectorAll(selectors[i]);
                if (matchCards.length > 0) {
                    console.log(`使用选择器 "${selectors[i]}" 找到元素:`, matchCards.length);
                    break;
                }
            }
        } catch (e) {
            console.error(`使用选择器 "${selectors[i]}" 查找元素时出错:`, e);
            continue;
        }
    }
    
    // 如果找到了比赛卡片，更新它们
    console.log(`共找到 ${matchCards.length} 个比赛卡片`);
    
    if (matchCards.length > 0) {
        // 使用父元素来替换所有卡片内容
        // 找到共同父容器
        const container = findCommonParent(matchCards);
        if (container) {
            console.log('找到比赛卡片的共同父容器:', container);
            // 确保只获取前4个比赛数据
            if (matchesData.matches && matchesData.matches.length > 4) {
                console.log('比赛数据超过4个，裁剪为4个');
                matchesData.matches = matchesData.matches.slice(0, 4);
            }
            createMatchCards(container, matchesData);
            return;
        }
        
        // 如果找不到共同父容器，则单独更新每个卡片
        matchCards.forEach((card, index) => {
            if (matchesData.matches && index < matchesData.matches.length && index < 4) {
                updateMatchCard(card, index, matchesData.matches[index]);
            } else if (index >= matchesData.matches.length && index < 4) {
                // 如果实际数据少于4个，但卡片有4个，隐藏多余的卡片
                card.style.display = 'none';
            }
        });
    } else {
        // 如果找不到比赛卡片，尝试找到比赛区域并创建新卡片
        const matchSection = document.querySelector('.upcoming_matches_section') || 
                            document.querySelector('section:has(h2:contains("比赛"))') ||
                            document.querySelector('section:has(h2:contains("Match"))');
        
        if (matchSection) {
            console.log('找到比赛区域，尝试创建新卡片');
            createMatchCards(matchSection, matchesData);
        } else {
            console.error('无法找到比赛区域，无法更新或创建比赛卡片');
        }
    }
}

/**
 * 查找元素的共同父容器
 * @param {NodeList|Array} elements - 元素列表
 * @returns {HTMLElement|null} - 共同父容器
 */
function findCommonParent(elements) {
    if (!elements || elements.length === 0) return null;
    if (elements.length === 1) return elements[0].parentElement;
    
    let commonParent = elements[0].parentElement;
    for (let i = 1; i < elements.length; i++) {
        while (!commonParent.contains(elements[i])) {
            commonParent = commonParent.parentElement;
            if (!commonParent) return null;
        }
    }
    
    return commonParent;
}

/**
 * 查找比赛section
 * @returns {HTMLElement|null} - 找到的比赛section或null
 */
function findMatchSection() {
    // 尝试找到upcoming_matches_section
    const upcomingSection = document.querySelector('.upcoming_matches_section');
    if (upcomingSection) {
        return upcomingSection;
    }
    
    // 尝试通过标题找到比赛section
    const h2Elements = document.querySelectorAll('h2');
    for (const h2 of h2Elements) {
        if (h2.textContent.includes('比赛') || 
            h2.textContent.includes('Upcoming') || 
            h2.textContent.toLowerCase().includes('match')) {
            
            // 找到可能的section
            let current = h2.parentElement;
            while (current && current.tagName !== 'SECTION' && current.tagName !== 'BODY') {
                current = current.parentElement;
            }
            
            if (current && current.tagName === 'SECTION') {
                return current;
            }
        }
    }
    
    // 尝试查找包含VS的section
    const sections = document.querySelectorAll('section');
    for (const section of sections) {
        if (section.textContent.includes('VS') || section.textContent.includes('vs')) {
            return section;
        }
    }
    
    return null;
}

/**
 * 更新整个比赛部分
 * @param {HTMLElement} section - 比赛section
 * @param {Object} data - 比赛数据
 */
function updateMatchSection(section, data) {
    console.log('更新整个比赛section');
    
    if (!data.matches || data.matches.length === 0) {
        console.log('没有比赛数据，无法更新section');
        return false;
    }
    
    // 找出所有的比赛卡片元素
    const matchCards = section.querySelectorAll('.upcoming_matches_content');
    console.log(`找到${matchCards.length}个比赛卡片元素`);
    
    // 如果卡片数量不足，可能需要创建新的卡片
    if (matchCards.length < data.matches.length && matchCards.length < 4) {
        console.log('卡片数量不足，需要创建新卡片');
        // 使用createMatchCards重新创建所有卡片
        createMatchCards(section, data);
        return true;
    }
    
    if (matchCards.length === 0) {
        // 如果找不到卡片，尝试创建
        createMatchCards(section, data);
        return true;
    }
    
    // 更新卡片
    matchCards.forEach((card, index) => {
        if (index < data.matches.length && index < 4) {
            updateMatchCard(card, index, data.matches[index]);
        } else if (index >= data.matches.length && index < 4) {
            // 如果数据中的比赛数量小于卡片数量，但总数不超过4，隐藏多余的卡片
            card.style.display = 'none';
        }
    });
    return true;
}

/**
 * 创建比赛卡片
 * @param {HTMLElement} container - 容器
 * @param {Object} data - 比赛数据
 */
function createMatchCards(container, data) {
    console.log('创建比赛卡片');
    
    // 查找放置卡片的行
    let targetRow = container.querySelector('.row[data-aos="fade-up"]:not(:first-child)');
    if (!targetRow) {
        // 如果找不到适合的行，创建一个
        targetRow = document.createElement('div');
        targetRow.className = 'row';
        targetRow.setAttribute('data-aos', 'fade-up');
        
        // 查找标题行
        const titleRow = container.querySelector('.row[data-aos="fade-up"]');
        if (titleRow) {
            titleRow.after(targetRow);
        } else {
            container.appendChild(targetRow);
        }
    }
    
    // 清空现有内容
    targetRow.innerHTML = '';
    
    console.log('将创建', data.matches.length, '个比赛卡片');
    
    // 确保我们最多只处理4个比赛
    const matchesToProcess = data.matches.slice(0, 4);
    
    // 记录详细信息，帮助调试
    console.log('比赛数据详情:');
    matchesToProcess.forEach((match, i) => {
        console.log(`比赛${i+1}: 队伍=${match.teams}, 日期=${match.date}, 时间=${match.time}, 奖金=${match.prize}`);
    });
    
    // 创建比赛卡片
    matchesToProcess.forEach((match, index) => {
        console.log(`创建第${index+1}个比赛卡片:`, match);
        
        // 确保所有图片路径都有默认值，防止404
        const team1Logo = match.team1Logo || 'assets/picture/team1.png';
        const team2Logo = match.team2Logo || 'assets/picture/team2.png';
        
        // 为最后一个卡片设置不同的样式类
        const lastCardClass = (index === matchesToProcess.length - 1) ? 'mb-2' : 'mb-4';
        
        const cardHtml = `
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 d-table align-item-center">
                <div class="upcoming_matches_content ${lastCardClass} padding_bottom" data-match-index="${index}">
                    <div class="row">
                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <div class="first_portion">
                                <figure class="mb-0"><img src="${team1Logo}" alt="Team 1"></figure>
                                <div class="vs_wrapper"><span>VS</span></div>
                                <figure class="mb-0"><img src="${team2Logo}" alt="Team 2"></figure>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <div class="center_portion">
                                <p class="mb-0">${match.teams || 'Tournament Match'}</p>
                                <div class="center_span_wrapper">
                                    <i class="fa-solid fa-calendar-days mr-1" aria-hidden="true"></i>
                                    <span class="mr-3">${match.date || 'TBD'}</span>
                                    <i class="fa-regular fa-clock mr-1"></i>
                                    <span>${match.time || 'TBD'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-5 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <div class="last_portion">
                                <div class="last_span_wrapper">
                                    <span class="groups">${match.groups || '2 Groups'}</span>
                                    <span class="players">${match.players || '32 Players'}</span>
                                </div>
                                <div class="last_span_wrapper2">
                                    <span class="groups">${match.prizeLabel || 'Prize Pool'}</span>
                                    <span class="players">${match.prize || '$5000'}</span>
                                </div>
                                <a href="#"><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到行
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        while (tempDiv.firstChild) {
            targetRow.appendChild(tempDiv.firstChild);
        }
    });
    
    console.log('创建了比赛卡片数量:', matchesToProcess.length);
}

/**
 * 从元素向上查找可能的比赛容器
 * @param {HTMLElement} element - 起始元素
 * @returns {HTMLElement|null} - 找到的容器或null
 */
function findMatchContainerFromElement(element) {
    // 最多向上查找5层父元素
    let current = element;
    let maxLevels = 5;
    
    while (current && maxLevels > 0) {
        // 检查是否是可能的比赛容器
        if (current.classList && 
            (current.classList.contains('upcoming_matches_content') || 
             (current.className && current.className.includes('match')) ||
             current.querySelectorAll('img').length >= 2)) {
            return current;
        }
        
        // 检查是否有足够多的子元素和结构特征
        if (current.children && current.children.length >= 3) {
            const hasImages = current.querySelectorAll('img').length >= 2;
            const hasVs = current.textContent.includes('VS') || current.textContent.includes('vs');
            const hasDateOrTime = /\d+\s*[:.-]\s*\d+/.test(current.textContent);
            
            if ((hasImages && hasVs) || (hasVs && hasDateOrTime)) {
                return current;
            }
        }
        
        current = current.parentElement;
        maxLevels--;
    }
    
    return null;
}

/**
 * 直接修改可能的比赛容器内容
 * @param {HTMLElement} container - 容器元素
 * @param {Object} data - 比赛数据
 */
function updateContainerContent(container, data) {
    try {
        console.log('直接更新容器内容');
        
        if (!container) {
            console.error('容器为空');
            return;
        }
        
        if (!data || !data.matches || data.matches.length === 0) {
            console.error('数据为空或没有匹配');
            return;
        }
        
        // 获取第一个比赛数据
        const match = data.matches[0];
        
        // 查找图片元素
        const images = container.querySelectorAll('img');
        if (images.length >= 2) {
            if (match.team1Logo) {
                images[0].src = match.team1Logo;
                console.log('更新了队伍1标志');
            }
            
            if (match.team2Logo) {
                images[1].src = match.team2Logo;
                console.log('更新了队伍2标志');
            }
        } else {
            console.log('找不到足够的图片元素');
        }
        
        // 查找并更新比赛名称/队伍
        if (match.teams) {
            const titleElements = container.querySelectorAll('p, h3, h4, h5, h6');
            for (const el of titleElements) {
                if (!el.querySelector('*')) { // 只选择不包含其他元素的文本节点
                    el.textContent = match.teams;
                    console.log('更新了比赛标题:', match.teams);
                    break;
                }
            }
        }
        
        // 查找并更新日期和时间
        if (match.date || match.time) {
            const spans = container.querySelectorAll('span');
            for (const span of spans) {
                if (span.textContent.includes('/') || span.textContent.includes('-') || 
                    /\d{1,4}/.test(span.textContent)) {
                    if (match.date) {
                        span.textContent = match.date;
                        console.log('更新了日期:', match.date);
                    }
                } else if (span.textContent.includes(':') || /\d{1,2}(am|pm|AM|PM)/.test(span.textContent)) {
                    if (match.time) {
                        span.textContent = match.time;
                        console.log('更新了时间:', match.time);
                    }
                } else if (span.textContent.includes('Group') || span.textContent.includes('组')) {
                    if (match.groups) {
                        span.textContent = match.groups;
                        console.log('更新了组数:', match.groups);
                    }
                } else if (span.textContent.includes('Player') || span.textContent.includes('玩家')) {
                    if (match.players) {
                        span.textContent = match.players;
                        console.log('更新了玩家数:', match.players);
                    }
                } else if (span.textContent.includes('Prize') || span.textContent.includes('奖')) {
                    if (match.prize) {
                        span.textContent = match.prize;
                        console.log('更新了奖金:', match.prize);
                    }
                }
            }
        }
        
        console.log('容器内容更新完成');
    } catch (error) {
        console.error('更新容器内容时出错:', error);
    }
}

/**
 * 更新单个比赛卡片
 * @param {HTMLElement} card - 比赛卡片元素
 * @param {number} index - 索引
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, index, data) {
    console.log(`更新第${index+1}个比赛卡片:`, data);
    
    if (!card) {
        console.error('卡片元素为空');
        return;
    }
    
    if (!data) {
        console.error('比赛数据为空');
        return;
    }
    
    // 确保所有图片路径都有默认值，防止404
    const team1Logo = data.team1Logo || 'assets/picture/team1.png';
    const team2Logo = data.team2Logo || 'assets/picture/team2.png';
    
    // 查找图片元素
    const images = card.querySelectorAll('img');
    if (images.length >= 2) {
        images[0].src = team1Logo;
        images[1].src = team2Logo;
        console.log(`卡片${index+1}更新了队伍Logo: 队伍1=${team1Logo}, 队伍2=${team2Logo}`);
    } else {
        console.log(`卡片${index+1}找不到足够的图片元素`);
    }
    
    // 更新比赛名称
    const nameElement = card.querySelector('.center_portion p');
    if (nameElement && data.teams) {
        nameElement.textContent = data.teams;
        console.log(`卡片${index+1}更新了比赛名称: ${data.teams}`);
    }
    
    // 更新日期和时间
    const dateElement = card.querySelector('.center_span_wrapper span:first-of-type');
    const timeElement = card.querySelector('.center_span_wrapper span:last-of-type');
    
    if (dateElement && data.date) {
        dateElement.textContent = data.date;
        console.log(`卡片${index+1}更新了日期: ${data.date}`);
    }
    
    if (timeElement && data.time) {
        timeElement.textContent = data.time;
        console.log(`卡片${index+1}更新了时间: ${data.time}`);
    }
    
    // 更新组和玩家数量
    const groupsElement = card.querySelector('.last_span_wrapper .groups');
    const playersElement = card.querySelector('.last_span_wrapper .players');
    
    if (groupsElement && data.groups) {
        groupsElement.textContent = data.groups;
        console.log(`卡片${index+1}更新了组数: ${data.groups}`);
    }
    
    if (playersElement && data.players) {
        playersElement.textContent = data.players;
        console.log(`卡片${index+1}更新了玩家数: ${data.players}`);
    }
    
    // 更新奖金标签和奖金
    const prizeLabelElement = card.querySelector('.last_span_wrapper2 .groups');
    const prizeElement = card.querySelector('.last_span_wrapper2 .players');
    
    if (prizeLabelElement && data.prizeLabel) {
        prizeLabelElement.textContent = data.prizeLabel;
        console.log(`卡片${index+1}更新了奖金标签: ${data.prizeLabel}`);
    }
    
    if (prizeElement && data.prize) {
        prizeElement.textContent = data.prize;
        console.log(`卡片${index+1}更新了奖金: ${data.prize}`);
    }
    
    // 设置为可见
    card.style.display = '';
    console.log(`比赛卡片${index+1}更新完成`);
}

// 扩展jQuery的选择器，支持:contains选择器
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                               Element.prototype.webkitMatchesSelector;
}

// 添加一个临时方法来模拟:contains选择器
if (!document.querySelectorAll.contains) {
    document.querySelectorAll_contains = function(selector, text) {
        if (!selector) selector = '*';
        
        var elements = document.querySelectorAll(selector);
        var result = [];
        
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].textContent.indexOf(text) > -1) {
                result.push(elements[i]);
            }
        }
        
        return result;
    };
    
    // 扩展NodeList的forEach方法（确保兼容性）
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
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
 * 设置比赛数据 - 填充表单字段
 */
function setupMatchData() {
    try {
        console.log('设置比赛数据');
        
        // 从localStorage获取数据
        const matchesDataString = localStorage.getItem('matchesData');
        if (!matchesDataString) {
            console.log('没有找到保存的比赛数据');
            return;
        }
        
        const matchesData = JSON.parse(matchesDataString);
        console.log('已加载比赛数据:', matchesData);
        
        if (!matchesData || !matchesData.matches || !Array.isArray(matchesData.matches)) {
            console.error('比赛数据格式错误');
            return;
        }
        
        // 设置比赛1数据
        if (matchesData.matches.length > 0) {
            const match1 = matchesData.matches[0];
            document.getElementById('match1Teams').value = match1.teams || '';
            document.getElementById('match1Team1Logo').value = match1.team1Logo || '';
            document.getElementById('match1Team2Logo').value = match1.team2Logo || '';
            document.getElementById('match1Date').value = match1.date || '';
            document.getElementById('match1Time').value = match1.time || '';
            document.getElementById('match1Groups').value = match1.groups || '';
            document.getElementById('match1Players').value = match1.players || '';
            document.getElementById('match1PrizeLabel').value = match1.prizeLabel || '';
            document.getElementById('match1Prize').value = match1.prize || match1.prizePool || '';
        }
        
        // 设置比赛2数据
        if (matchesData.matches.length > 1) {
            const match2 = matchesData.matches[1];
            document.getElementById('match2Teams').value = match2.teams || '';
            document.getElementById('match2Team1Logo').value = match2.team1Logo || '';
            document.getElementById('match2Team2Logo').value = match2.team2Logo || '';
            document.getElementById('match2Date').value = match2.date || '';
            document.getElementById('match2Time').value = match2.time || '';
            document.getElementById('match2Groups').value = match2.groups || '';
            document.getElementById('match2Players').value = match2.players || '';
            document.getElementById('match2PrizeLabel').value = match2.prizeLabel || '';
            document.getElementById('match2Prize').value = match2.prize || match2.prizePool || '';
        }
        
        // 设置比赛3数据
        if (matchesData.matches.length > 2) {
            const match3 = matchesData.matches[2];
            document.getElementById('match3Teams').value = match3.teams || '';
            document.getElementById('match3Team1Logo').value = match3.team1Logo || '';
            document.getElementById('match3Team2Logo').value = match3.team2Logo || '';
            document.getElementById('match3Date').value = match3.date || '';
            document.getElementById('match3Time').value = match3.time || '';
            document.getElementById('match3Groups').value = match3.groups || '';
            document.getElementById('match3Players').value = match3.players || '';
            document.getElementById('match3PrizeLabel').value = match3.prizeLabel || '';
            document.getElementById('match3Prize').value = match3.prize || match3.prizePool || '';
        }
        
        // 设置比赛4数据
        if (matchesData.matches.length > 3) {
            const match4 = matchesData.matches[3];
            console.log('设置比赛4数据:', match4);
            
            try {
                document.getElementById('match4Teams').value = match4.teams || '';
                document.getElementById('match4Team1Logo').value = match4.team1Logo || '';
                document.getElementById('match4Team2Logo').value = match4.team2Logo || '';
                document.getElementById('match4Date').value = match4.date || '';
                document.getElementById('match4Time').value = match4.time || '';
                document.getElementById('match4Groups').value = match4.groups || '';
                document.getElementById('match4Players').value = match4.players || '';
                document.getElementById('match4PrizeLabel').value = match4.prizeLabel || '';
                document.getElementById('match4Prize').value = match4.prize || match4.prizePool || '';
            } catch (e) {
                console.error('设置比赛4数据时出错:', e);
            }
        }
        
        console.log('比赛数据设置完成');
    } catch (e) {
        console.error('设置比赛数据时出错:', e);
    }
}
