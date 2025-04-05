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
            document.title = content.homeHeaderForm.title + ' | 商务网站';
            
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
            const mainTitle = document.querySelector('.banner-section h1');
            const subTitle = document.querySelector('.banner-section h6');
            const description = document.querySelector('.banner-section p');
            
            if (mainTitle && content.homeHeaderForm.title) {
                mainTitle.textContent = content.homeHeaderForm.title;
            }
            
            if (subTitle && content.homeHeaderForm.subtitle) {
                subTitle.textContent = content.homeHeaderForm.subtitle;
            }
            
            if (description && content.homeHeaderForm.description) {
                description.textContent = content.homeHeaderForm.description;
            }
        }
        
        // 特色服务
        if (content.featuredServicesForm) {
            const servicesSections = document.querySelectorAll('.products_section .col-lg-4');
            
            if (servicesSections && servicesSections.length >= 3) {
                // 服务1
                if (content.featuredServicesForm.service1Title) {
                    const title = servicesSections[0].querySelector('h5');
                    const desc = servicesSections[0].querySelector('p');
                    
                    if (title) title.textContent = content.featuredServicesForm.service1Title;
                    if (desc) desc.textContent = content.featuredServicesForm.service1Description;
                }
                
                // 服务2
                if (content.featuredServicesForm.service2Title) {
                    const title = servicesSections[1].querySelector('h5');
                    const desc = servicesSections[1].querySelector('p');
                    
                    if (title) title.textContent = content.featuredServicesForm.service2Title;
                    if (desc) desc.textContent = content.featuredServicesForm.service2Description;
                }
                
                // 服务3
                if (content.featuredServicesForm.service3Title) {
                    const title = servicesSections[2].querySelector('h5');
                    const desc = servicesSections[2].querySelector('p');
                    
                    if (title) title.textContent = content.featuredServicesForm.service3Title;
                    if (desc) desc.textContent = content.featuredServicesForm.service3Description;
                }
            }
        }
        
        // 即将到来的比赛
        if (content.upcomingMatchesForm) {
            const matchSections = document.querySelectorAll('.upcoming_matches_content');
            
            if (matchSections && matchSections.length >= 2) {
                // 比赛1
                if (content.upcomingMatchesForm.match1Teams) {
                    const teams = matchSections[0].querySelector('.teams_name');
                    const date = matchSections[0].querySelector('.match_date');
                    const time = matchSections[0].querySelector('.match_time');
                    
                    if (teams) teams.textContent = content.upcomingMatchesForm.match1Teams;
                    if (date) date.textContent = content.upcomingMatchesForm.match1Date;
                    if (time) time.textContent = content.upcomingMatchesForm.match1Time;
                }
                
                // 比赛2
                if (content.upcomingMatchesForm.match2Teams) {
                    const teams = matchSections[1].querySelector('.teams_name');
                    const date = matchSections[1].querySelector('.match_date');
                    const time = matchSections[1].querySelector('.match_time');
                    
                    if (teams) teams.textContent = content.upcomingMatchesForm.match2Teams;
                    if (date) date.textContent = content.upcomingMatchesForm.match2Date;
                    if (time) time.textContent = content.upcomingMatchesForm.match2Time;
                }
            }
        }
        
        // 应用其他首页内容...
    } catch (error) {
        console.error('应用首页内容时出错:', error);
    }
}

// 应用关于页面内容
function applyAboutContent(content) {
    if (!content || !content.aboutForm) {
        console.warn('没有可用的关于页面内容');
        return;
    }
    
    try {
        const aboutSection = document.querySelector('.about-section') || document.querySelector('.gaming_tournament-section');
        
        if (aboutSection) {
            const title = aboutSection.querySelector('h2');
            const description = aboutSection.querySelector('p');
            const image = aboutSection.querySelector('img');
            
            if (title && content.aboutForm.title) {
                title.textContent = content.aboutForm.title;
            }
            
            if (description && content.aboutForm.description) {
                description.textContent = content.aboutForm.description;
            }
            
            if (image && content.aboutForm.imageUrl) {
                image.src = content.aboutForm.imageUrl;
            }
        }
    } catch (error) {
        console.error('应用关于页面内容时出错:', error);
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

// 应用联系页面内容
function applyContactContent(content) {
    if (!content || !content.contactForm) {
        console.warn('没有可用的联系页面内容');
        return;
    }
    
    try {
        const contactSection = document.querySelector('.get_in_touch_section');
        
        if (contactSection) {
            const title = contactSection.querySelector('h2');
            const addressElem = contactSection.querySelector('.address');
            const phoneElem = contactSection.querySelector('.phone');
            const emailElem = contactSection.querySelector('.email');
            
            if (title && content.contactForm.title) {
                title.textContent = content.contactForm.title;
            }
            
            if (addressElem && content.contactForm.address) {
                addressElem.textContent = content.contactForm.address;
            }
            
            if (phoneElem && content.contactForm.phone) {
                phoneElem.textContent = content.contactForm.phone;
            }
            
            if (emailElem && content.contactForm.email) {
                emailElem.textContent = content.contactForm.email;
            }
        }
    } catch (error) {
        console.error('应用联系页面内容时出错:', error);
    }
}

// 应用团队成员内容
function applyTeamContent(content) {
    if (!content || !content.teamForm) {
        console.warn('没有可用的团队页面内容');
        return;
    }
    
    try {
        const teamSection = document.querySelector('.blog_posts_section');
        
        if (teamSection) {
            const title = teamSection.querySelector('h2');
            
            if (title && content.teamForm.title) {
                title.textContent = content.teamForm.title;
            }
            
            // 应用团队成员内容
            // 这里需要根据实际DOM结构进行调整
        }
    } catch (error) {
        console.error('应用团队成员内容时出错:', error);
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
