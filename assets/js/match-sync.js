/**
 * 比赛信息同步工具
 * 用于将后台管理系统中修改的比赛信息同步到前端页面
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('比赛同步工具已加载');
    
    // 延迟执行以确保DOM完全加载
    setTimeout(function() {
        syncMatchesToFrontend();
    }, 2000); // 增加延迟时间到2000ms
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
        console.log('未找到比赛标题元素，尝试更广泛的查找策略');
        console.log('页面中的h2元素:', document.querySelectorAll('h2').length);
        document.querySelectorAll('h2').forEach((h2, index) => {
            console.log(`h2[${index}]: ${h2.textContent}`);
        });
    }
    
    // 尝试多种选择器查找比赛卡片
    let matchCards = document.querySelectorAll('.upcoming_matches_content');
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
    
    // 使用更广泛的选择器
    if (matchCards.length === 0) {
        matchCards = document.querySelectorAll('div[class*="match"]');
        console.log('使用包含match的类名选择器，找到元素数量:', matchCards.length);
    }
    
    // 查找可能包含VS文本的元素
    if (matchCards.length === 0) {
        const vsElements = Array.from(document.querySelectorAll('span')).filter(span => 
            span.textContent.trim() === 'VS' || span.textContent.trim() === 'vs'
        );
        
        if (vsElements.length > 0) {
            console.log('找到含有VS文本的元素:', vsElements.length);
            
            // 从VS元素向上查找可能的卡片容器
            matchCards = vsElements.map(vsElem => {
                let parent = vsElem.parentElement;
                // 向上查找最多5级父元素
                for (let i = 0; i < 5 && parent; i++) {
                    if (parent.querySelector('img') && 
                        (parent.textContent.includes('Prize') || 
                         parent.textContent.includes('Player') ||
                         parent.textContent.includes('Group'))) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return null;
            }).filter(Boolean);
            
            console.log('通过VS元素找到可能的比赛卡片:', matchCards.length);
        }
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
        
        // 尝试直接创建或修改元素
        console.log('未找到比赛卡片，尝试直接更新第一个找到的具有匹配结构的元素');
        
        // 寻找可能包含比赛信息的任何元素
        const possibleContainers = document.querySelectorAll('.col-lg-12');
        for (const container of possibleContainers) {
            if (container.textContent.includes('VS') || 
                container.innerHTML.includes('vs') || 
                container.innerHTML.includes('比赛')) {
                
                console.log('找到可能的比赛容器:', container);
                updateContainerContent(container, matchesData);
                return;
            }
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
