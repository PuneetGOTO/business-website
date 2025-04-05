/**
 * 网站内容管理器
 * 此脚本从API获取内容并应用到网站前端
 */

// API基础URL - 确保与后端一致，假设使用Railway部署
// 检测是否为本地环境
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// 如果是本地环境使用本地API，否则使用生产环境API
const API_BASE_URL = isLocalhost ? '/api' : 'https://business-website-production.up.railway.app/api';

// 添加调试信息
console.log('当前环境:', isLocalhost ? '本地开发' : '生产环境');
console.log('API基础URL:', API_BASE_URL);

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始获取内容');
    
    // 首先尝试从localStorage读取内容
    const localContent = getContentFromLocalStorage();
    
    if (localContent) {
        console.log('从localStorage获取到内容，应用到前台');
        applyContentToFrontend(localContent);
    } else {
        // 如果localStorage中没有内容，则从API获取
        fetchAllContent()
            .then(content => {
                if (content) {
                    console.log('成功从API获取内容:', content);
                    applyContentToFrontend(content);
                } else {
                    console.warn('未能获取到有效内容');
                }
            })
            .catch(error => {
                console.error('获取内容时出错:', error);
            });
    }
    
    // 监听管理面板更新事件
    window.addEventListener('adminContentUpdated', function(event) {
        console.log('检测到管理面板更新，更新前台内容', event.detail);
        if (event.detail) {
            applyContentToFrontend(event.detail);
        }
    });
    
    // 每5秒检查一次localStorage中的内容是否有更新
    setInterval(checkForContentUpdates, 5000);
});

// 获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().split('.')[0];
    
    if (!pageName || pageName === '') {
        return 'index';
    }
    
    return pageName;
}

// 从localStorage获取内容
function getContentFromLocalStorage() {
    const storedContent = localStorage.getItem('websiteContent');
    if (storedContent) {
        try {
            return JSON.parse(storedContent);
        } catch (e) {
            console.error('解析localStorage内容失败:', e);
            return null;
        }
    }
    return null;
}

// 检查内容更新
function checkForContentUpdates() {
    const storedContent = getContentFromLocalStorage();
    if (storedContent && JSON.stringify(storedContent) !== JSON.stringify(window.lastAppliedContent)) {
        console.log('检测到内容更新，重新应用到前台');
        applyContentToFrontend(storedContent);
    }
}

// 从API获取所有内容
async function fetchAllContent() {
    try {
        const response = await fetch(`${API_BASE_URL}/content`);
        
        if (!response.ok) {
            console.error('API响应错误:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取内容时出错:', error);
        return null;
    }
}

// 应用内容到前台
function applyContentToFrontend(content) {
    // 保存最后应用的内容，用于比较更新
    window.lastAppliedContent = JSON.parse(JSON.stringify(content));
    
    // 应用所有页面的通用内容
    applyGeneralSettings(content);
    
    // 根据当前页面应用特定内容
    const currentPage = getCurrentPage();
    console.log('当前页面:', currentPage);
    
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

// 应用通用设置
function applyGeneralSettings(content) {
    // 先检查内容是否来自管理面板的格式
    if (!content || !Object.keys(content).length) {
        console.warn('没有可用的通用设置内容');
        return;
    }
    
    try {
        // 网站标题
        if (content.homeHeaderForm && content.homeHeaderForm.title) {
            document.title = content.homeHeaderForm.title;
            
            // Logo处的公司名称，如果存在
            const logoText = document.querySelector('.navbar-brand span');
            if (logoText) {
                logoText.textContent = content.homeHeaderForm.title;
            }
        }
        
        // 联系信息
        if (content.contactForm) {
            // 页脚联系信息
            const footerAddress = document.querySelector('.footer-section .address');
            const footerPhone = document.querySelector('.footer-section .phone');
            const footerEmail = document.querySelector('.footer-section .email');
            
            if (footerAddress && content.contactForm.address) {
                footerAddress.textContent = content.contactForm.address;
            }
            
            if (footerPhone && content.contactForm.phone) {
                footerPhone.textContent = content.contactForm.phone;
            }
            
            if (footerEmail && content.contactForm.email) {
                footerEmail.textContent = content.contactForm.email;
            }
        }
    } catch (error) {
        console.error('应用通用设置时出错:', error);
    }
}

// 应用首页内容
function applyHomeContent(content) {
    if (!content) {
        console.warn('没有可用的首页内容');
        return;
    }
    
    try {
        // 首页标题和描述
        if (content.homeHeaderForm) {
            const mainTitle = document.querySelector('.banner-section-content h1');
            const description = document.querySelector('.banner-section-content p');
            
            if (mainTitle && content.homeHeaderForm.title) {
                mainTitle.textContent = content.homeHeaderForm.title;
            }
            
            if (description && content.homeHeaderForm.description) {
                description.textContent = content.homeHeaderForm.description;
            }
        }
        
        // 特色游戏 (趋势游戏区域)
        if (content.featuredServicesForm) {
            // 查找趋势游戏内容区域
            const trendingItems = document.querySelectorAll('.trending_content');
            
            if (trendingItems && trendingItems.length >= 3) {
                // 游戏1
                if (content.featuredServicesForm.service1Title) {
                    const spanWrapper = trendingItems[0].querySelector('.trending_span_wrapper span');
                    if (spanWrapper) {
                        spanWrapper.textContent = content.featuredServicesForm.service1Title;
                    }
                }
                
                // 游戏2
                if (content.featuredServicesForm.service2Title) {
                    const spanWrapper = trendingItems[1].querySelector('.trending_span_wrapper span');
                    if (spanWrapper) {
                        spanWrapper.textContent = content.featuredServicesForm.service2Title;
                    }
                }
                
                // 游戏3
                if (content.featuredServicesForm.service3Title) {
                    const spanWrapper = trendingItems[2].querySelector('.trending_span_wrapper span');
                    if (spanWrapper) {
                        spanWrapper.textContent = content.featuredServicesForm.service3Title;
                    }
                }
            } else {
                console.warn('未找到足够的趋势游戏内容区域');
            }
        }
        
        // 即将到来的比赛
        if (content.upcomingMatchesForm) {
            // 查找即将到来的比赛区域 - 根据实际HTML结构调整选择器
            const upcomingMatches = document.querySelectorAll('.upcoming_matches_section .upcoming_matches_item');
            
            if (upcomingMatches && upcomingMatches.length >= 2) {
                // 比赛1
                if (content.upcomingMatchesForm.match1Teams) {
                    const teams = upcomingMatches[0].querySelector('.teams_name');
                    const date = upcomingMatches[0].querySelector('.match_date');
                    const time = upcomingMatches[0].querySelector('.match_time');
                    
                    if (teams) teams.textContent = content.upcomingMatchesForm.match1Teams;
                    if (date) date.textContent = content.upcomingMatchesForm.match1Date;
                    if (time) time.textContent = content.upcomingMatchesForm.match1Time;
                }
                
                // 比赛2
                if (content.upcomingMatchesForm.match2Teams) {
                    const teams = upcomingMatches[1].querySelector('.teams_name');
                    const date = upcomingMatches[1].querySelector('.match_date');
                    const time = upcomingMatches[1].querySelector('.match_time');
                    
                    if (teams) teams.textContent = content.upcomingMatchesForm.match2Teams;
                    if (date) date.textContent = content.upcomingMatchesForm.match2Date;
                    if (time) time.textContent = content.upcomingMatchesForm.match2Time;
                }
            } else {
                console.warn('未找到足够的即将到来的比赛区域');
            }
        }
        
        // 检查页面标题是否有变化，如果有则更新文档标题
        if (content.homeHeaderForm && content.homeHeaderForm.title) {
            document.title = content.homeHeaderForm.title;
        }
    } catch (error) {
        console.error('应用首页内容时出错:', error);
    }
}

// 应用关于我们内容
function applyAboutContent(content) {
    if (!content || !content.aboutForm) {
        console.warn('没有可用的关于我们内容');
        return;
    }
    
    try {
        // 关于我们标题和描述
        const aboutTitle = document.querySelector('.about-content h2');
        const aboutDescription = document.querySelector('.about-content p');
        
        if (aboutTitle && content.aboutForm.title) {
            aboutTitle.textContent = content.aboutForm.title;
        }
        
        if (aboutDescription && content.aboutForm.description) {
            aboutDescription.textContent = content.aboutForm.description;
        }
    } catch (error) {
        console.error('应用关于我们内容时出错:', error);
    }
}

// 应用联系我们内容
function applyContactContent(content) {
    if (!content || !content.contactForm) {
        console.warn('没有可用的联系我们内容');
        return;
    }
    
    try {
        // 联系我们标题
        const contactTitle = document.querySelector('.contact-section h2');
        if (contactTitle && content.contactForm.title) {
            contactTitle.textContent = content.contactForm.title;
        }
        
        // 联系信息
        const addressElement = document.querySelector('.contact-info .address');
        const phoneElement = document.querySelector('.contact-info .phone');
        const emailElement = document.querySelector('.contact-info .email');
        
        if (addressElement && content.contactForm.address) {
            addressElement.textContent = content.contactForm.address;
        }
        
        if (phoneElement && content.contactForm.phone) {
            phoneElement.textContent = content.contactForm.phone;
        }
        
        if (emailElement && content.contactForm.email) {
            emailElement.textContent = content.contactForm.email;
        }
        
        // 页脚联系信息
        const footerAddress = document.querySelector('.footer-section .address');
        const footerPhone = document.querySelector('.footer-section .phone');
        const footerEmail = document.querySelector('.footer-section .email');
        
        if (footerAddress && content.contactForm.address) {
            footerAddress.textContent = content.contactForm.address;
        }
        
        if (footerPhone && content.contactForm.phone) {
            footerPhone.textContent = content.contactForm.phone;
        }
        
        if (footerEmail && content.contactForm.email) {
            footerEmail.textContent = content.contactForm.email;
        }
    } catch (error) {
        console.error('应用联系我们内容时出错:', error);
    }
}

// 应用服务内容 
function applyServicesContent(content) {
    if (!content || !content.servicesForm) {
        console.warn('没有可用的服务页面内容');
        return;
    }
    
    try {
        const servicesSection = document.querySelector('.trending_games_section');
        
        if (servicesSection) {
            const title = servicesSection.querySelector('h2');
            
            if (title && content.servicesForm.title) {
                title.textContent = content.servicesForm.title;
            }
            
            // 应用服务项目内容
            // 这里需要根据实际DOM结构进行调整
        }
    } catch (error) {
        console.error('应用服务内容时出错:', error);
    }
}

// 兼容旧函数
function applyGamesContent(content) {
    applyServicesContent(content);
}

// 兼容旧函数
function applyMatchDetailContent(content) {
    // 保留兼容性但不做任何处理
    console.log('应用比赛详情页面内容');
}
