/**
 * 网站内容管理器
 * 此脚本从API获取内容并应用到网站前端
 */

// API基础URL
const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有内容
    fetchAllContent()
        .then(content => {
            if (content) {
                // 应用所有页面的通用内容
                applyGeneralSettings(content);
                
                // 根据当前页面应用特定内容
                const currentPage = getCurrentPage();
                
                switch(currentPage) {
                    case 'index':
                        applyHomeContent(content);
                        break;
                    case 'about':
                        applyAboutContent(content);
                        break;
                    case 'games':
                        applyGamesContent(content);
                        break;
                    case 'contact':
                        applyContactContent(content);
                        break;
                    case 'match_detail':
                        applyMatchDetailContent(content);
                        break;
                }
            }
        })
        .catch(error => {
            console.error('获取内容失败:', error);
        });
});

// 获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (!page || page === '' || page === 'index.html') {
        return 'index';
    }
    
    return page.replace('.html', '');
}

// 从API获取所有内容
async function fetchAllContent() {
    try {
        const response = await fetch(`${API_BASE_URL}/content`);
        if (!response.ok) {
            throw new Error('获取内容失败');
        }
        
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('获取内容错误:', error);
        return null;
    }
}

// 应用通用设置
function applyGeneralSettings(content) {
    const footerData = content.footer;
    
    if (footerData) {
        // 更新版权信息
        const copyrightElements = document.querySelectorAll('.copyright p');
        copyrightElements.forEach(el => {
            if (el && footerData.copyright) {
                el.textContent = footerData.copyright;
            }
        });
        
        // 更新客户评价
        const reviewTitles = document.querySelectorAll('.testimonial h4');
        reviewTitles.forEach(el => {
            if (el && footerData.clientReviewsTitle) {
                el.textContent = footerData.clientReviewsTitle;
            }
        });
        
        const reviewContents = document.querySelectorAll('.testimonial p:not(.client-info)');
        reviewContents.forEach(el => {
            if (el && footerData.clientReviewsContent) {
                el.textContent = footerData.clientReviewsContent;
            }
        });
        
        const clientNames = document.querySelectorAll('.client-info strong');
        clientNames.forEach(el => {
            if (el && footerData.clientName) {
                el.textContent = footerData.clientName;
            }
        });
        
        const clientDescs = document.querySelectorAll('.client-info span');
        clientDescs.forEach(el => {
            if (el && footerData.clientDescription) {
                el.textContent = footerData.clientDescription;
            }
        });
    }
}

// 应用首页内容
function applyHomeContent(content) {
    // 应用大标题和描述
    const headerData = content.homeHeader;
    if (headerData) {
        const titleElement = document.querySelector('.banner-text h1');
        if (titleElement && headerData.homeTitle) {
            titleElement.textContent = headerData.homeTitle;
        }
        
        const descElement = document.querySelector('.banner-text p');
        if (descElement && headerData.homeDescription) {
            descElement.textContent = headerData.homeDescription;
        }
    }
    
    // 应用热门游戏设置
    const gamesData = content.trendingGames;
    if (gamesData) {
        const titleElement = document.querySelector('.trending-games-area h2');
        if (titleElement && gamesData.trendingGamesTitle) {
            titleElement.textContent = gamesData.trendingGamesTitle;
        }
        
        // 找到所有游戏名称元素并更新
        const gameElements = document.querySelectorAll('.trending-games-items .trending-games-item span');
        
        if (gameElements.length > 0 && gamesData.game1) {
            gameElements[0].textContent = gamesData.game1;
        }
        
        if (gameElements.length > 1 && gamesData.game2) {
            gameElements[1].textContent = gamesData.game2;
        }
        
        if (gameElements.length > 2 && gamesData.game3) {
            gameElements[2].textContent = gamesData.game3;
        }
    }
    
    // 应用即将到来的比赛
    const matchesData = content.upcomingMatches;
    if (matchesData) {
        const titleElement = document.querySelector('.matches-area h2');
        if (titleElement && matchesData.upcomingMatchesTitle) {
            titleElement.textContent = matchesData.upcomingMatchesTitle;
        }
        
        // 找到第一个比赛项并更新
        const matchNameElement = document.querySelector('.matches-item p');
        if (matchNameElement && matchesData.matchName) {
            matchNameElement.textContent = matchesData.matchName;
        }
        
        const matchDateElement = document.querySelector('.match-time-area .match-date');
        if (matchDateElement && matchesData.matchDate) {
            matchDateElement.textContent = matchesData.matchDate;
        }
        
        const matchTimeElement = document.querySelector('.match-time-area .match-time');
        if (matchTimeElement && matchesData.matchTime) {
            matchTimeElement.textContent = matchesData.matchTime;
        }
        
        const matchGroupsElement = document.querySelector('.match-stats-item:nth-child(1) h6');
        if (matchGroupsElement && matchesData.matchGroups) {
            matchGroupsElement.textContent = matchesData.matchGroups;
        }
        
        const matchPlayersElement = document.querySelector('.match-stats-item:nth-child(2) h6');
        if (matchPlayersElement && matchesData.matchPlayers) {
            matchPlayersElement.textContent = matchesData.matchPlayers;
        }
        
        const matchPrizeElement = document.querySelector('.match-stats-item:nth-child(3) .price');
        if (matchPrizeElement && matchesData.matchPrize) {
            matchPrizeElement.textContent = matchesData.matchPrize;
        }
    }
}

// 应用关于页面内容
function applyAboutContent(content) {
    // 应用标题和描述
    const aboutData = content.aboutTitle;
    if (aboutData) {
        // 更新页面标题
        const titleElement = document.querySelector('.banner-text h1');
        if (titleElement && aboutData.aboutTitle) {
            titleElement.textContent = aboutData.aboutTitle;
        }
        
        // 更新关于标语
        const sloganElement = document.querySelector('.about-area h3');
        if (sloganElement && aboutData.aboutSlogan) {
            sloganElement.textContent = aboutData.aboutSlogan;
        }
        
        // 更新描述
        const descElement = document.querySelector('.about-area p');
        if (descElement && aboutData.aboutDescription) {
            descElement.textContent = aboutData.aboutDescription;
        }
    }
    
    // 应用统计数据
    const statsData = content.stats;
    if (statsData) {
        // 更新团队成员数量
        const teamCountElement = document.querySelector('.funfact-item:nth-child(1) .counter');
        if (teamCountElement && statsData.teamMembers) {
            teamCountElement.textContent = statsData.teamMembers;
        }
        
        // 更新特色游戏数量
        const gamesCountElement = document.querySelector('.funfact-item:nth-child(2) .counter');
        if (gamesCountElement && statsData.featuredGames) {
            gamesCountElement.textContent = statsData.featuredGames;
        }
        
        // 更新常规客户数量
        const clientsCountElement = document.querySelector('.funfact-item:nth-child(3) .counter');
        if (clientsCountElement && statsData.regularClients) {
            clientsCountElement.textContent = statsData.regularClients;
        }
        
        // 更新获奖数量
        const awardsCountElement = document.querySelector('.funfact-item:nth-child(4) .counter');
        if (awardsCountElement && statsData.winAwards) {
            awardsCountElement.textContent = statsData.winAwards;
        }
    }
}

// 应用游戏页面内容
function applyGamesContent(content) {
    // 应用页面标题
    const gamesData = content.gamesHeader;
    if (gamesData) {
        // 更新页面标题
        const titleElement = document.querySelector('.banner-text h1');
        if (titleElement && gamesData.gamesPageTitle) {
            titleElement.textContent = gamesData.gamesPageTitle;
        }
        
        // 更新热门游戏标题
        const popularTitleElement = document.querySelector('.games-area h2');
        if (popularTitleElement && gamesData.popularGamesTitle) {
            popularTitleElement.textContent = gamesData.popularGamesTitle;
        }
    }
    
    // 应用即将上线游戏
    const upcomingData = content.upcomingGames;
    if (upcomingData) {
        // 更新标题
        const titleElement = document.querySelector('.upcoming-games-area h2');
        if (titleElement && upcomingData.upcomingGamesTitle) {
            titleElement.textContent = upcomingData.upcomingGamesTitle;
        }
        
        // 更新游戏名称
        const gameElements = document.querySelectorAll('.upcoming-games-content .upcoming-games-item span');
        
        if (gameElements.length > 0 && upcomingData.upcomingGame1) {
            gameElements[0].textContent = upcomingData.upcomingGame1;
        }
        
        if (gameElements.length > 1 && upcomingData.upcomingGame2) {
            gameElements[1].textContent = upcomingData.upcomingGame2;
        }
        
        if (gameElements.length > 2 && upcomingData.upcomingGame3) {
            gameElements[2].textContent = upcomingData.upcomingGame3;
        }
    }
}

// 应用联系页面内容
function applyContactContent(content) {
    // 应用联系信息
    const contactData = content.contactInfo;
    if (contactData) {
        // 更新页面标题
        const titleElement = document.querySelector('.banner-text h1');
        if (titleElement && contactData.contactTitle) {
            titleElement.textContent = contactData.contactTitle;
        }
        
        // 更新地址
        const addressElement = document.querySelector('.contact-location h5');
        if (addressElement && contactData.contactAddress) {
            addressElement.textContent = contactData.contactAddress;
        }
        
        // 更新电话
        const phoneElement = document.querySelector('.contact-phone a');
        if (phoneElement && contactData.contactPhone) {
            phoneElement.textContent = contactData.contactPhone;
            phoneElement.href = 'tel:' + contactData.contactPhone.replace(/-/g, '');
        }
        
        // 更新邮箱
        const emailElement = document.querySelector('.contact-email a');
        if (emailElement && contactData.contactEmail) {
            emailElement.textContent = contactData.contactEmail;
            emailElement.href = 'mailto:' + contactData.contactEmail;
        }
    }
}

// 应用比赛详情页面内容
function applyMatchDetailContent(content) {
    // 应用比赛详情
    const matchData = content.matchDetails;
    if (matchData) {
        // 更新比赛名称
        const nameElements = document.querySelectorAll('.breadcumb-content span, .match-details-content h2');
        nameElements.forEach(element => {
            if (element && matchData.matchDetailName) {
                element.textContent = matchData.matchDetailName;
            }
        });
        
        // 更新比赛描述
        const descElement = document.querySelector('.match-details-content p');
        if (descElement && matchData.matchDescription) {
            descElement.textContent = matchData.matchDescription;
        }
        
        // 更新团队选手标题
        const teamTitleElement = document.querySelector('.team-players-area h2');
        if (teamTitleElement && matchData.teamPlayersTitle) {
            teamTitleElement.textContent = matchData.teamPlayersTitle;
        }
    }
}
