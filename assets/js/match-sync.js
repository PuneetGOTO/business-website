/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 在后台页面设置同步按钮事件
    if (window.location.href.includes('admin') || window.location.href.includes('dashboard')) {
        onAdminSyncButtonClick();
        return; // 在管理界面不自动同步前台内容
    }
    
    // 等待页面完全加载，包括所有资源
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始同步比赛数据');
        
        // 尝试同步比赛
        syncMatchesToFrontend();
        
        // 再次尝试，防止首次尝试时DOM元素尚未准备好
        setTimeout(function() {
            console.log('第二次尝试同步比赛数据...');
            syncMatchesToFrontend();
            
            // 特别处理比赛4
            setTimeout(function() {
                syncMatch4();
            }, 500);
        }, 1000);
    });
});

/**
 * 将比赛数据从localStorage同步到前端页面
 */
function syncMatchesToFrontend() {
    console.log('尝试同步比赛数据到前台...');
    
    // 先尝试从matchesData获取数据
    let matchesDataJson = localStorage.getItem('matchesData');
    let matchesData = null;
    
    // 如果没有找到matchesData，尝试从upcomingMatchesForm中获取
    if (!matchesDataJson) {
        console.log('没有找到matchesData，尝试从upcomingMatchesForm获取');
        const formDataJson = localStorage.getItem('upcomingMatchesForm');
        
        if (formDataJson) {
            try {
                const formData = JSON.parse(formDataJson);
                console.log('找到upcomingMatchesForm数据:', formData);
                
                // 将表单数据转换为matches格式
                matchesData = {
                    matches: []
                };
                
                // 检查是否有match1数据
                if (formData.match1Teams) {
                    matchesData.matches.push({
                        teams: formData.match1Teams,
                        date: formData.match1Date,
                        time: formData.match1Time,
                        groups: formData.match1Groups,
                        players: formData.match1Players,
                        prizeLabel: formData.match1PrizeLabel || 'Prize Pool',
                        prize: formData.match1Prize || formData.match1PrizePool || '$5000',
                        team1Logo: formatImagePath(formData.match1Team1Logo || 'assets/img/team1.png'),
                        team2Logo: formatImagePath(formData.match1Team2Logo || 'assets/img/team2.png')
                    });
                }
                
                // 检查是否有match2数据
                if (formData.match2Teams) {
                    matchesData.matches.push({
                        teams: formData.match2Teams,
                        date: formData.match2Date,
                        time: formData.match2Time,
                        groups: formData.match2Groups,
                        players: formData.match2Players,
                        prizeLabel: formData.match2PrizeLabel || 'Prize Pool',
                        prize: formData.match2Prize || formData.match2PrizePool || '$5000',
                        team1Logo: formatImagePath(formData.match2Team1Logo || 'assets/img/team1.png'),
                        team2Logo: formatImagePath(formData.match2Team2Logo || 'assets/img/team2.png')
                    });
                }
                
                // 检查是否有match3数据
                if (formData.match3Teams) {
                    matchesData.matches.push({
                        teams: formData.match3Teams,
                        date: formData.match3Date,
                        time: formData.match3Time,
                        groups: formData.match3Groups,
                        players: formData.match3Players,
                        prizeLabel: formData.match3PrizeLabel || 'Prize Pool',
                        prize: formData.match3Prize || formData.match3PrizePool || '$5000',
                        team1Logo: formatImagePath(formData.match3Team1Logo || 'assets/img/team1.png'),
                        team2Logo: formatImagePath(formData.match3Team2Logo || 'assets/img/team2.png')
                    });
                }
                
                // 检查是否有match4数据
                if (formData.match4Teams) {
                    matchesData.matches.push({
                        teams: formData.match4Teams,
                        date: formData.match4Date,
                        time: formData.match4Time,
                        groups: formData.match4Groups,
                        players: formData.match4Players,
                        prizeLabel: formData.match4PrizeLabel || 'Prize Pool',
                        prize: formData.match4Prize || formData.match4PrizePool || '$5000',
                        team1Logo: formatImagePath(formData.match4Team1Logo || 'assets/img/team1.png'),
                        team2Logo: formatImagePath(formData.match4Team2Logo || 'assets/img/team2.png')
                    });
                }
                
                console.log('已从表单数据生成比赛数据:', matchesData);
                
                // 保存到matchesData以便后续使用
                localStorage.setItem('matchesData', JSON.stringify(matchesData));
            } catch (e) {
                console.error('处理upcomingMatchesForm数据时出错:', e);
            }
        } else {
            console.log('没有找到upcomingMatchesForm数据');
            return false;
        }
    } else {
        try {
            matchesData = JSON.parse(matchesDataJson);
            console.log('加载matchesData:', matchesData);
        } catch (e) {
            console.error('解析matchesData时出错:', e);
            return false;
        }
    }
    
    if (!matchesData || !matchesData.matches || !Array.isArray(matchesData.matches)) {
        console.error('比赛数据格式错误');
        return false;
    }
    
    // 尝试多种选择器查找比赛卡片
    findAndUpdateMatchCards(matchesData);
    return true;
}

/**
 * 转换旧格式的比赛数据为新格式
 * @param {Object} matchesData - 旧格式的比赛数据
 * @returns {Object} - 转换后的比赛数据
 */
function convertOldFormatToNew(matchesData) {
    console.log('检测到旧格式比赛数据，转换为新格式');
    
    const newFormat = {
        matches: []
    };
    
    // 查找并添加比赛1数据
    if (matchesData.match1Teams) {
        newFormat.matches.push({
            teams: matchesData.match1Teams,
            date: matchesData.match1Date,
            time: matchesData.match1Time,
            groups: matchesData.match1Groups,
            players: matchesData.match1Players,
            prizeLabel: matchesData.match1PrizeLabel || 'Prize Pool',
            prize: matchesData.match1Prize || matchesData.match1PrizePool || '$5000',
            team1Logo: formatImagePath(matchesData.match1Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(matchesData.match1Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 查找并添加比赛2数据
    if (matchesData.match2Teams) {
        newFormat.matches.push({
            teams: matchesData.match2Teams,
            date: matchesData.match2Date,
            time: matchesData.match2Time,
            groups: matchesData.match2Groups,
            players: matchesData.match2Players,
            prizeLabel: matchesData.match2PrizeLabel || 'Prize Pool',
            prize: matchesData.match2Prize || matchesData.match2PrizePool || '$5000',
            team1Logo: formatImagePath(matchesData.match2Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(matchesData.match2Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 查找并添加比赛3数据
    if (matchesData.match3Teams) {
        newFormat.matches.push({
            teams: matchesData.match3Teams,
            date: matchesData.match3Date,
            time: matchesData.match3Time,
            groups: matchesData.match3Groups,
            players: matchesData.match3Players,
            prizeLabel: matchesData.match3PrizeLabel || 'Prize Pool',
            prize: matchesData.match3Prize || matchesData.match3PrizePool || '$5000',
            team1Logo: formatImagePath(matchesData.match3Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(matchesData.match3Team2Logo || 'assets/img/team2.png')
        });
    }
    
    // 查找并添加比赛4数据
    if (matchesData.match4Teams) {
        newFormat.matches.push({
            teams: matchesData.match4Teams,
            date: matchesData.match4Date,
            time: matchesData.match4Time,
            groups: matchesData.match4Groups,
            players: matchesData.match4Players,
            prizeLabel: matchesData.match4PrizeLabel || 'Prize Pool',
            prize: matchesData.match4Prize || matchesData.match4PrizePool || '$5000',
            team1Logo: formatImagePath(matchesData.match4Team1Logo || 'assets/img/team1.png'),
            team2Logo: formatImagePath(matchesData.match4Team2Logo || 'assets/img/team2.png')
        });
    }
    
    console.log('转换后的数据:', newFormat);
    return newFormat;
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
        'section:has(h2:contains("比赛")) .row > div > div',
        'section:has(h2:contains("Match")) .row > div > div',
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
            createMatchCards(matchesData.matches);
            return;
        }
        
        // 如果找不到共同父容器，则单独更新每个卡片
        matchCards.forEach((card, index) => {
            if (matchesData.matches && index < matchesData.matches.length && index < 4) {
                console.log(`更新第${index+1}个比赛卡片`);
                updateContainerContent(card, matchesData.matches[index]);
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
            createMatchCards(matchesData.matches);
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
        createMatchCards(data.matches);
        return true;
    }
    
    if (matchCards.length === 0) {
        // 如果找不到卡片，尝试创建
        createMatchCards(data.matches);
        return true;
    }
    
    // 更新卡片
    matchCards.forEach((card, index) => {
        if (index < data.matches.length && index < 4) {
            updateContainerContent(card, data.matches[index]);
        } else if (index >= data.matches.length && index < 4) {
            // 如果数据中的比赛数量小于卡片数量，但总数不超过4，隐藏多余的卡片
            card.style.display = 'none';
        }
    });
    return true;
}

/**
 * 创建或更新比赛卡片
 * @param {Array} matches - 比赛数据数组
 */
function createMatchCards(matches) {
    console.log('创建或更新比赛卡片...');
    
    if (!matches || !Array.isArray(matches)) {
        console.error('比赛数据无效');
        return;
    }
    
    // 找到比赛区域
    const matchSection = document.querySelector('.upcoming_matches_section') || 
                      document.querySelector('section.upcoming_matches');
    
    if (!matchSection) {
        console.error('找不到比赛区域');
        return;
    }
    
    // 查找卡片容器
    let cardContainer = matchSection.querySelector('.row:not(:first-child)');
    if (!cardContainer) {
        console.log('找不到卡片容器，创建新容器');
        cardContainer = document.createElement('div');
        cardContainer.className = 'row';
        matchSection.appendChild(cardContainer);
    }
    
    // 清空现有卡片
    cardContainer.innerHTML = '';
    
    // 限制处理的比赛数量为4个
    const matchesToProcess = matches.slice(0, 4);
    console.log(`处理${matchesToProcess.length}个比赛`);
    
    // 创建卡片
    matchesToProcess.forEach((match, index) => {
        console.log(`创建第${index+1}个比赛卡片:`, match);
        
        // 确保路径正确
        const team1Logo = formatImagePath(match.team1Logo || 'assets/img/team1.png');
        const team2Logo = formatImagePath(match.team2Logo || 'assets/img/team2.png');
        
        // 创建卡片HTML
        const cardHtml = `
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 d-table align-item-center">
            <div class="upcoming_matches_content mb-4 padding_bottom" data-match-index="${index}">
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
        
        // 添加到DOM
        cardContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
    
    console.log('比赛卡片创建完成');
    
    // 额外处理：完全重建比赛卡片后，在下一个微任务中再确认一次数据同步
    setTimeout(() => {
        matchesToProcess.forEach((match, index) => {
            const card = document.querySelector(`.upcoming_matches_content[data-match-index="${index}"]`);
            if (card) {
                console.log(`二次确认第${index+1}个比赛卡片数据`);
                updateContainerContent(card, match);
            }
        });
    }, 100);
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
        
        // 查找并更新日期和时间 - 使用安全的方法不依赖:contains选择器
        const centerWrapper = container.querySelector('.center_span_wrapper');
        if (centerWrapper) {
            const spans = centerWrapper.querySelectorAll('span');
            if (spans.length >= 2) {
                // 通常第一个是日期，第二个是时间
                if (match.date && spans[0]) {
                    spans[0].textContent = match.date;
                    console.log('更新了日期:', match.date);
                }
                
                if (match.time && spans[1]) {
                    spans[1].textContent = match.time;
                    console.log('更新了时间:', match.time);
                }
            }
        }
        
        // 更新组和玩家数量
        const groupsSpan = findSpanWithText(container, 'Group') || 
                          findSpanWithText(container, '组') || 
                          container.querySelector('.last_span_wrapper .groups');
                          
        const playersSpan = findSpanWithText(container, 'Player') || 
                           findSpanWithText(container, '人') || 
                           container.querySelector('.last_span_wrapper .players');
        
        if (groupsSpan && match.groups) {
            groupsSpan.textContent = match.groups;
            console.log('更新了组数:', match.groups);
        }
        
        if (playersSpan && match.players) {
            playersSpan.textContent = match.players;
            console.log('更新了玩家数:', match.players);
        }
        
        // 更新奖金标签和奖金
        const prizeLabelSpan = findSpanWithText(container, 'Prize') || 
                             findSpanWithText(container, '奖') || 
                             container.querySelector('.last_span_wrapper2 .groups');
                             
        const prizeSpan = findSpanWithText(container, '$') || 
                        findSpanWithText(container, '¥') || 
                        container.querySelector('.last_span_wrapper2 .players');
        
        if (prizeLabelSpan && match.prizeLabel) {
            prizeLabelSpan.textContent = match.prizeLabel;
            console.log('更新了奖池标签:', match.prizeLabel);
        }
        
        if (prizeSpan) {
            const prize = match.prize || match.prizePool || '$5000';
            prizeSpan.textContent = prize;
            console.log('更新了奖池金额:', prize);
        }
        
        console.log('容器内容更新完成');
    } catch (error) {
        console.error('更新容器内容时出错:', error);
    }
}

/**
 * 修复span选择器，不使用jQuery的:contains选择器
 * @param {HTMLElement} container - 父容器元素
 * @param {string} searchText - 要搜索的文本内容
 * @returns {HTMLElement|null} - 找到的元素或null
 */
function findSpanWithText(container, searchText) {
    if (!container) return null;
    
    const spans = container.querySelectorAll('span');
    for (let span of spans) {
        if (span.textContent && span.textContent.includes(searchText)) {
            return span;
        }
    }
    return null;
}

/**
 * 更新单个比赛卡片
 * @param {HTMLElement} card - 比赛卡片元素
 * @param {number} index - 比赛索引
 * @param {Object} data - 比赛数据
 */
function updateMatchCard(card, index, data) {
    try {
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
        const team1Logo = formatImagePath(data.team1Logo || 'assets/img/team1.png');
        const team2Logo = formatImagePath(data.team2Logo || 'assets/img/team2.png');
        
        // 查找图片元素
        const images = card.querySelectorAll('img');
        if (images.length >= 2) {
            images[0].src = team1Logo;
            images[1].src = team2Logo;
            console.log(`卡片${index+1}更新了队伍Logo: 队伍1=${team1Logo}, 队伍2=${team2Logo}`);
        } else {
            console.log(`卡片${index+1}找不到足够的图片元素`);
        }
        
        // 查找比赛名称元素 - 尝试多种选择器
        const nameElement = card.querySelector('.center_portion p') || 
                           card.querySelector('p') || 
                           card.querySelector('.center_portion div') ||
                           card.querySelector('div p');
                           
        if (nameElement && data.teams) {
            nameElement.textContent = data.teams;
            console.log(`卡片${index+1}更新了比赛名称: ${data.teams}`);
        } else {
            // 尝试识别任何可能的头部元素作为标题
            const possibleTitleElements = card.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div.center_portion *');
            let titleUpdated = false;
            
            for (const el of possibleTitleElements) {
                // 检查是否是简单的文本元素（不包含其他元素）
                if (el.children.length === 0 && el.textContent.trim().length > 0) {
                    el.textContent = data.teams || 'VS比赛';
                    console.log(`卡片${index+1}找到并更新了备选标题元素: ${data.teams}`);
                    titleUpdated = true;
                    break;
                }
            }
            
            if (!titleUpdated) {
                console.log(`卡片${index+1}找不到比赛名称元素或数据为空`);
            }
        }
        
        // 使用安全的方法更新其他信息
        const spans = card.querySelectorAll('span');
        if (spans.length > 0) {
            // 日期和时间更新 - 使用更安全的方法查找元素
            try {
                // 查找日期和时间的span
                let dateSpan = null;
                let timeSpan = null;
                
                // 使用找到的元素更新内容
                spans.forEach(span => {
                    const text = span.textContent.trim();
                    
                    // 识别日期span
                    if ((text.includes('/') || text.includes('-') || text.includes('年')) && data.date) {
                        span.textContent = data.date;
                        console.log(`卡片${index+1}更新了日期: ${data.date}`);
                        dateSpan = span;
                    }
                    // 识别时间span
                    else if ((text.includes(':') || text.includes('PM') || text.includes('AM')) && data.time) {
                        span.textContent = data.time;
                        console.log(`卡片${index+1}更新了时间: ${data.time}`);
                        timeSpan = span;
                    }
                    // 组别
                    else if ((text.includes('Group') || text.includes('组')) && data.groups) {
                        span.textContent = data.groups;
                        console.log(`卡片${index+1}更新了组别: ${data.groups}`);
                    }
                    // 玩家数
                    else if ((text.includes('Player') || text.includes('人')) && data.players) {
                        span.textContent = data.players;
                        console.log(`卡片${index+1}更新了玩家数: ${data.players}`);
                    }
                    // 奖池标签
                    else if ((text.includes('Prize') || text.includes('奖')) && data.prizeLabel) {
                        span.textContent = data.prizeLabel;
                        console.log(`卡片${index+1}更新了奖池标签: ${data.prizeLabel}`);
                    }
                    // 奖池金额
                    else if ((text.includes('$') || text.includes('¥'))) {
                        const prize = data.prize || data.prizePool || '';
                        if (prize) {
                            span.textContent = prize;
                            console.log(`卡片${index+1}更新了奖池金额: ${prize}`);
                        }
                    }
                });
                
                // 如果没有找到日期和时间，尝试直接通过位置查找
                if (!dateSpan && data.date) {
                    const dateSpanByPosition = card.querySelector('.center_span_wrapper span:first-of-type');
                    if (dateSpanByPosition) {
                        dateSpanByPosition.textContent = data.date;
                        console.log(`卡片${index+1}通过位置更新了日期: ${data.date}`);
                    }
                }
                
                if (!timeSpan && data.time) {
                    const timeSpanByPosition = card.querySelector('.center_span_wrapper span:last-of-type');
                    if (timeSpanByPosition) {
                        timeSpanByPosition.textContent = data.time;
                        console.log(`卡片${index+1}通过位置更新了时间: ${data.time}`);
                    }
                }
            } catch (e) {
                console.error(`处理日期时间时出错: ${e.message}`);
            }
        } else {
            console.log(`卡片${index+1}找不到包含信息的span元素`);
        }
        
        // 设置为可见
        card.style.display = '';
        console.log(`比赛卡片${index+1}更新完成`);
    } catch (error) {
        console.error(`更新第${index+1}个比赛卡片时出错:`, error);
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
    findAndUpdateMatchCards(matchesData);
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
    if (!formattedPath.startsWith('assets/')) {
        formattedPath = 'assets/img/' + formattedPath.split('/').pop();
    }
    
    console.log('格式化后的图片路径:', formattedPath);
    return formattedPath;
}

/**
 * 数据初始化 - 自动将upcomingMatchesForm转换为matchesData格式
 */
(function() {
    // 等待页面完全加载
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始同步比赛数据');
        
        // 首次加载时尝试同步数据
        setTimeout(function() {
            // 检查是否已有matchesData
            const hasMatchesData = localStorage.getItem('matchesData');
            if (!hasMatchesData) {
                console.log('未找到matchesData，尝试从upcomingMatchesForm转换');
                // 尝试从表单数据转换
                const formDataJson = localStorage.getItem('upcomingMatchesForm');
                if (formDataJson) {
                    try {
                        const formData = JSON.parse(formDataJson);
                        console.log('找到upcomingMatchesForm数据，准备转换');
                        const matchesData = convertFormToMatchesData(formData);
                        localStorage.setItem('matchesData', JSON.stringify(matchesData));
                        console.log('成功将upcomingMatchesForm转换为matchesData格式');
                    } catch (e) {
                        console.error('转换upcomingMatchesForm数据时出错:', e);
                    }
                }
            }
            
            // 尝试同步数据到前台
            syncMatchesToFrontend();
        }, 1000);
        
        // 再次尝试，以防第一次失败
        setTimeout(function() {
            console.log('第二次尝试同步比赛数据...');
            syncMatchesToFrontend();
        }, 3000);
        
        // 尝试初始化后台同步功能
        initializeAdminSync();
    });
})();

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
