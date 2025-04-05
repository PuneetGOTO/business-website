/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 延迟执行以确保DOM完全加载
    setTimeout(function() {
        syncMatchesToFrontend();
    }, 4000); // 增加延迟时间到4000ms，确保一定在DOM加载后执行
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
    const titleElements = document.querySelectorAll('h2');
    let titleUpdated = false;
    
    titleElements.forEach(element => {
        // 查找包含"比赛"、"Upcoming"或"Match"等关键词的标题
        if (element.textContent.includes('比赛') || 
            element.textContent.includes('Upcoming') || 
            element.textContent.toLowerCase().includes('match')) {
            
            element.textContent = matchesData.upcomingMatchesTitle;
            console.log('更新了比赛标题:', matchesData.upcomingMatchesTitle);
            titleUpdated = true;
        }
    });
    
    if (!titleUpdated) {
        console.log('未找到比赛标题元素');
    }
    
    // 尝试查找比赛卡片元素 - 使用多种选择器策略
    let matchCards = document.querySelectorAll('.upcoming_matches_content');
    console.log('使用.upcoming_matches_content选择器找到元素数量:', matchCards.length);
    
    // 如果没有找到，尝试更多的选择器
    if (matchCards.length === 0) {
        matchCards = document.querySelectorAll('div[class*="match"]');
        console.log('使用div[class*="match"]选择器找到元素数量:', matchCards.length);
    }
    
    // 继续尝试其他可能的选择器
    if (matchCards.length === 0) {
        matchCards = document.querySelectorAll('.col-lg-12 > div');
        console.log('使用.col-lg-12 > div选择器找到元素数量:', matchCards.length);
    }
    
    // 扫描页面中所有section，寻找可能的比赛部分
    if (matchCards.length === 0) {
        console.log('开始扫描页面sections寻找可能的比赛部分...');
        const sections = document.querySelectorAll('section');
        
        sections.forEach((section, index) => {
            console.log(`检查section[${index}]:`, section.className);
            
            // 查找VS元素作为比赛指标
            const vsElements = section.querySelectorAll('*:contains("VS"), *:contains("vs")');
            if (vsElements.length > 0) {
                console.log(`在section[${index}]中找到${vsElements.length}个VS元素`);
                
                // 获取包含VS的容器
                vsElements.forEach((vsEl, i) => {
                    let container = findMatchContainerFromElement(vsEl);
                    if (container) {
                        console.log(`从VS元素[${i}]找到可能的比赛容器:`, container);
                        updateContainerContent(container, matchesData);
                    }
                });
            }
            
            // 查找包含date/time格式的元素
            const dateTimeElements = section.querySelectorAll('*:contains("-"), *:contains(":")');
            if (dateTimeElements.length > 0) {
                console.log(`在section[${index}]中找到${dateTimeElements.length}个可能的日期/时间元素`);
                
                dateTimeElements.forEach((dtEl, i) => {
                    // 检查是否符合日期时间格式
                    if (/\d+\s*[:.-]\s*\d+/.test(dtEl.textContent)) {
                        let container = findMatchContainerFromElement(dtEl);
                        if (container) {
                            console.log(`从日期/时间元素[${i}]找到可能的比赛容器:`, container);
                            updateContainerContent(container, matchesData);
                        }
                    }
                });
            }
        });
    }
    
    if (matchCards.length === 0) {
        console.error('找不到比赛卡片元素');
        
        // 深入分析DOM，找到可能的容器
        const possibleContainers = findPossibleMatchContainers();
        console.log('找到可能的比赛容器:', possibleContainers.length);
        
        possibleContainers.forEach((container, index) => {
            console.log(`更新可能的比赛容器[${index}]`);
            updateContainerContent(container, matchesData);
        });
        
        return;
    }
    
    console.log('找到比赛卡片元素数量:', matchCards.length);
    
    // 更新找到的比赛卡片
    matchCards.forEach((card, index) => {
        if (index < matchesData.matches.length) {
            updateMatchCard(card, matchesData.matches[index]);
        }
    });
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
 * 查找页面中所有可能的比赛容器
 * @returns {Array} - 可能的比赛容器数组
 */
function findPossibleMatchContainers() {
    const containers = [];
    
    // 查找同时包含VS和图片的容器
    const vsElements = document.querySelectorAll('*:contains("VS"), *:contains("vs")');
    vsElements.forEach(el => {
        const container = findMatchContainerFromElement(el);
        if (container && !containers.includes(container)) {
            containers.push(container);
        }
    });
    
    // 查找同时包含日期时间格式和图片的容器
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        if (row.querySelectorAll('img').length >= 2 && 
            /\d+\s*[:.-]\s*\d+/.test(row.textContent)) {
            containers.push(row);
        }
    });
    
    return containers;
}

/**
 * 直接修改可能的比赛容器内容
 * @param {HTMLElement} container - 容器元素
 * @param {Object} data - 比赛数据
 */
function updateContainerContent(container, data) {
    try {
        console.log('尝试直接更新容器内容');
        
        // 尝试查找并更新比赛名称
        const pElements = container.querySelectorAll('p');
        if (pElements.length > 0 && data.match1Teams) {
            pElements[0].textContent = data.match1Teams;
            console.log('更新了比赛名称:', data.match1Teams);
        }
        
        // 尝试查找并更新日期和时间
        const spans = container.querySelectorAll('span');
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            
            // 更新日期
            if (span.textContent.includes('年') || span.textContent.includes('月') || 
                span.textContent.includes('/') || span.textContent.includes('-')) {
                if (data.match1Date) {
                    span.textContent = data.match1Date;
                    console.log('更新了日期:', data.match1Date);
                }
            }
            
            // 更新时间
            if (span.textContent.includes(':') || span.textContent.includes('PM') || 
                span.textContent.includes('AM')) {
                if (data.match1Time) {
                    span.textContent = data.match1Time;
                    console.log('更新了时间:', data.match1Time);
                }
            }
            
            // 更新分组
            if (span.textContent.includes('Group') || span.textContent.includes('组')) {
                if (data.match1Groups) {
                    span.textContent = data.match1Groups;
                    console.log('更新了分组:', data.match1Groups);
                }
            }
            
            // 更新玩家
            if (span.textContent.includes('Player') || span.textContent.includes('玩家')) {
                if (data.match1Players) {
                    span.textContent = data.match1Players;
                    console.log('更新了玩家数:', data.match1Players);
                }
            }
            
            // 更新奖池
            if (span.textContent.includes('Prize') || span.textContent.includes('奖')) {
                if (data.match1Prize) {
                    span.textContent = data.match1Prize;
                    console.log('更新了奖金:', data.match1Prize);
                }
            }
        }
        
        // 更新队伍标志
        const images = container.querySelectorAll('img');
        if (images.length >= 2) {
            if (data.match1Team1Logo) {
                images[0].src = data.match1Team1Logo;
                console.log('更新了队伍1标志:', data.match1Team1Logo);
            }
            
            if (data.match1Team2Logo) {
                images[1].src = data.match1Team2Logo;
                console.log('更新了队伍2标志:', data.match1Team2Logo);
            }
        }
    } catch (error) {
        console.error('直接更新容器内容时出错:', error);
    }
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
        
        // 记录卡片的HTML结构，以便调试
        console.log('卡片HTML结构:', card.outerHTML.substring(0, 300));
        
        // 更新比赛名称（尝试多种选择器）
        let matchName = card.querySelector('.center_portion p');
        if (!matchName) {
            matchName = card.querySelector('p');
        }
        
        if (matchName && data.teams) {
            matchName.textContent = data.teams;
            console.log('更新比赛名称:', data.teams);
        } else {
            console.log('未找到比赛名称元素:', !!matchName, '或无teams数据');
            // 如果找不到特定元素，尝试更新所有p元素
            const allParagraphs = card.querySelectorAll('p');
            if (allParagraphs.length > 0 && data.teams) {
                allParagraphs[0].textContent = data.teams;
                console.log('使用第一个p元素更新比赛名称:', data.teams);
            }
        }
        
        // 尝试多种选择器更新日期和时间
        let dateSpan = card.querySelector('.center_span_wrapper span:first-of-type');
        let timeSpan = card.querySelector('.center_span_wrapper span:last-of-type');
        
        // 如果找不到特定的选择器，尝试查找所有span元素
        if (!dateSpan || !timeSpan) {
            const allSpans = card.querySelectorAll('span');
            console.log('所有span元素数量:', allSpans.length);
            
            // 遍历所有span，查找可能的日期和时间
            allSpans.forEach((span, index) => {
                const text = span.textContent.trim();
                console.log(`span[${index}]: ${text}`);
                
                // 日期通常包含年月日或斜杠/连字符
                if (text.includes('年') || text.includes('月') || 
                    text.includes('/') || text.includes('-') || 
                    /\d{1,4}[^\d]\d{1,2}[^\d]\d{1,4}/.test(text)) {
                    dateSpan = span;
                }
                
                // 时间通常包含冒号
                if (text.includes(':') || text.includes('PM') || text.includes('AM')) {
                    timeSpan = span;
                }
            });
        }
        
        if (dateSpan && data.date) {
            dateSpan.textContent = data.date;
            console.log('更新比赛日期:', data.date);
        } else {
            console.log('未找到日期元素或无date数据');
        }
        
        if (timeSpan && data.time) {
            timeSpan.textContent = data.time;
            console.log('更新比赛时间:', data.time);
        } else {
            console.log('未找到时间元素或无time数据');
        }
        
        // 尝试查找分组、玩家和奖金信息
        let groupsSpan = card.querySelector('.last_span_wrapper .groups');
        let playersSpan = card.querySelector('.last_span_wrapper .players');
        let prizeLabelSpan = card.querySelector('.last_span_wrapper2 .groups');
        let prizeValueSpan = card.querySelector('.last_span_wrapper2 .players');
        
        // 如果找不到特定选择器，尝试根据内容特征查找
        if (!groupsSpan || !playersSpan || !prizeLabelSpan || !prizeValueSpan) {
            const allSpans = card.querySelectorAll('span');
            
            allSpans.forEach(span => {
                const text = span.textContent.trim().toLowerCase();
                
                if (text.includes('group') || text.includes('组')) {
                    groupsSpan = span;
                } else if (text.includes('player') || text.includes('玩家')) {
                    playersSpan = span;
                } else if (text.includes('prize') || text.includes('pool') || text.includes('奖池')) {
                    prizeLabelSpan = span;
                } else if (text.includes('$') || text.includes('¥')) {
                    prizeValueSpan = span;
                }
            });
        }
        
        if (groupsSpan && data.groups) {
            groupsSpan.textContent = data.groups;
            console.log('更新比赛分组:', data.groups);
        } else {
            console.log('未找到分组元素或无groups数据');
        }
        
        if (playersSpan && data.players) {
            playersSpan.textContent = data.players;
            console.log('更新玩家数量:', data.players);
        } else {
            console.log('未找到玩家数量元素或无players数据');
        }
        
        if (prizeLabelSpan && data.prizeLabel) {
            prizeLabelSpan.textContent = data.prizeLabel;
            console.log('更新奖金标签:', data.prizeLabel);
        } else {
            console.log('未找到奖金标签元素或无prizeLabel数据');
        }
        
        if (prizeValueSpan && data.prize) {
            prizeValueSpan.textContent = data.prize;
            console.log('更新奖金:', data.prize);
        } else {
            console.log('未找到奖金元素或无prize数据');
        }
        
        // 更新团队logo
        if (data.team1Logo) {
            let team1LogoImg = card.querySelector('.first_portion figure:first-of-type img');
            
            // 如果找不到特定选择器，尝试获取第一个图像
            if (!team1LogoImg) {
                const allImages = card.querySelectorAll('img');
                if (allImages.length > 0) {
                    team1LogoImg = allImages[0];
                }
            }
            
            if (team1LogoImg) {
                team1LogoImg.src = data.team1Logo;
                console.log('更新队伍1标志:', data.team1Logo);
            }
        }
        
        if (data.team2Logo) {
            let team2LogoImg = card.querySelector('.first_portion figure:last-of-type img');
            
            // 如果找不到特定选择器，尝试获取第二个图像
            if (!team2LogoImg) {
                const allImages = card.querySelectorAll('img');
                if (allImages.length > 1) {
                    team2LogoImg = allImages[1];
                }
            }
            
            if (team2LogoImg) {
                team2LogoImg.src = data.team2Logo;
                console.log('更新队伍2标志:', data.team2Logo);
            }
        }
    } catch (error) {
        console.error('更新比赛卡片时出错:', error);
    }
}

// 扩展jQuery的选择器，支持:contains选择器
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                               Element.prototype.webkitMatchesSelector;
}

if (!document.querySelectorAll.contains) {
    // 添加一个临时方法来模拟:contains选择器
    document.querySelectorAll_old = document.querySelectorAll;
    document.querySelectorAll = function(selector) {
        if (selector.includes(':contains(')) {
            // 提取:contains()中的文本
            const match = selector.match(/:contains\("(.+?)"\)/);
            if (match) {
                const text = match[1];
                const baseSelector = selector.replace(/:contains\("(.+?)"\)/, '');
                
                // 获取基础选择器的元素
                const baseElements = document.querySelectorAll_old(baseSelector || '*');
                
                // 过滤包含指定文本的元素
                return Array.from(baseElements).filter(el => 
                    el.textContent.includes(text)
                );
            }
        }
        
        // 使用原始查询方法
        return document.querySelectorAll_old(selector);
    };
}
