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
    if (!matchesData.matches && (matchesData.match1Teams || matchesData.match2Teams || matchesData.match3Teams)) {
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
            console.error(`选择器 "${selectors[i]}" 错误:`, e);
        }
    }
    
    // 如果找到了匹配元素
    if (matchCards && matchCards.length > 0) {
        console.log(`找到 ${matchCards.length} 个比赛卡片元素`);
        
        // 更新找到的比赛卡片
        Array.from(matchCards).forEach((card, index) => {
            if (index < matchesData.matches.length) {
                updateMatchCard(card, matchesData.matches[index]);
            }
        });
        return true;
    }
    
    console.log('无法找到比赛卡片，尝试直接在section中查找比赛相关元素');
    
    // 最后尝试：在每个section中查找包含VS的元素
    const sections = document.querySelectorAll('section');
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const hasVS = section.textContent.includes('VS') || section.textContent.includes('vs');
        const hasMatch = section.textContent.toLowerCase().includes('match') || 
                         section.textContent.includes('比赛') || 
                         section.textContent.includes('tournament');
        
        if (hasVS || hasMatch) {
            console.log(`找到可能包含比赛信息的section[${i}]`);
            
            // 尝试查找和更新这个section中的内容
            if (updateMatchSection(section, matchesData)) {
                return true;
            }
            
            // 如果找不到合适的元素，创建新元素
            if (matchesData.matches && matchesData.matches.length > 0) {
                createMatchCards(section, matchesData);
                return true;
            }
        }
    }
    
    console.error('无法找到或创建比赛元素');
    return false;
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
    console.log('更新比赛section');
    
    // 查找比赛卡片
    let matchCards = section.querySelectorAll('.upcoming_matches_content');
    if (matchCards.length === 0) {
        matchCards = section.querySelectorAll('.col-lg-12 > div');
    }
    
    console.log('在section中找到比赛卡片数量:', matchCards.length);
    
    if (matchCards.length === 0) {
        // 如果找不到卡片，尝试创建
        createMatchCards(section, data);
        return true;
    }
    
    // 更新卡片
    matchCards.forEach((card, index) => {
        if (index < data.matches.length) {
            updateMatchCard(card, data.matches[index]);
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
    
    // 创建比赛卡片
    data.matches.forEach((match, index) => {
        console.log(`创建第${index+1}个比赛卡片:`, match);
        
        // 确保所有图片路径都有默认值，防止404
        const team1Logo = match.team1Logo || 'assets/picture/team1.png';
        const team2Logo = match.team2Logo || 'assets/picture/team2.png';
        
        const cardHtml = `
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 d-table align-item-center">
                <div class="upcoming_matches_content padding_bottom">
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
    
    console.log('创建了比赛卡片数量:', data.matches.length);
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
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, data) {
    try {
        console.log('更新比赛卡片:', data);
        
        // 确保所有图片路径都有默认值，防止404
        const team1LogoSrc = data.team1Logo || 'assets/picture/team1.png';
        const team2LogoSrc = data.team2Logo || 'assets/picture/team2.png';
        
        // 查找并更新队伍标志
        const teamLogos = card.querySelectorAll('img');
        const team1LogoElement = teamLogos[0]; // 第一个图片元素
        const team2LogoElement = teamLogos[1]; // 第二个图片元素
        
        if (team1LogoElement) {
            team1LogoElement.src = team1LogoSrc;
            console.log('更新了队伍1标志:', team1LogoSrc);
        } else {
            console.warn('找不到队伍1标志元素');
        }
        
        if (team2LogoElement) {
            team2LogoElement.src = team2LogoSrc;
            console.log('更新了队伍2标志:', team2LogoSrc);
        } else {
            console.warn('找不到队伍2标志元素');
        }
        
        // 更新比赛标题/队伍
        const titleElement = card.querySelector('.center_portion p') || 
                             card.querySelector('p') || 
                             card.querySelector('h3') || 
                             card.querySelector('h4');
        
        if (titleElement && data.teams) {
            titleElement.textContent = data.teams;
            console.log('更新了比赛标题:', data.teams);
        } else {
            console.warn('找不到比赛标题元素或无数据');
        }
        
        // 更新日期
        const dateElement = card.querySelector('.center_span_wrapper span:first-of-type') || 
                            card.querySelector('span:contains("/")') || 
                            card.querySelector('span:contains("-")');
        
        if (dateElement && data.date) {
            dateElement.textContent = data.date;
            console.log('更新了日期:', data.date);
        } else {
            console.warn('找不到日期元素或无数据');
        }
        
        // 更新时间
        const timeElement = card.querySelector('.center_span_wrapper span:last-of-type') || 
                            card.querySelector('span:contains(":")');
        
        if (timeElement && data.time) {
            timeElement.textContent = data.time;
            console.log('更新了时间:', data.time);
        } else {
            console.warn('找不到时间元素或无数据');
        }
        
        // 更新组数
        const groupsElement = card.querySelector('.last_span_wrapper .groups') || 
                              card.querySelector('span:contains("Group")');
        
        if (groupsElement && data.groups) {
            groupsElement.textContent = data.groups;
            console.log('更新了组数:', data.groups);
        } else {
            console.warn('找不到组数元素或无数据');
        }
        
        // 更新玩家数
        const playersElement = card.querySelector('.last_span_wrapper .players') || 
                               card.querySelector('span:contains("Player")');
        
        if (playersElement && data.players) {
            playersElement.textContent = data.players;
            console.log('更新了玩家数:', data.players);
        } else {
            console.warn('找不到玩家数元素或无数据');
        }
        
        // 更新奖池标签
        const prizeLabelElement = card.querySelector('.last_span_wrapper2 .groups') || 
                                  card.querySelector('span:contains("Prize")');
        
        if (prizeLabelElement && data.prizeLabel) {
            prizeLabelElement.textContent = data.prizeLabel;
            console.log('更新了奖池标签:', data.prizeLabel);
        } else {
            console.warn('找不到奖池标签元素或无数据');
        }
        
        // 更新奖金
        const prizeElement = card.querySelector('.last_span_wrapper2 .players') || 
                             card.querySelector('span:contains("$")');
        
        if (prizeElement && data.prize) {
            prizeElement.textContent = data.prize;
            console.log('更新了奖金:', data.prize);
        } else {
            console.warn('找不到奖金元素或无数据');
        }
        
        console.log('比赛卡片更新完成');
    } catch (error) {
        console.error('更新比赛卡片时出错:', error);
    }
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
