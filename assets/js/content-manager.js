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
    try {
        const websiteContent = localStorage.getItem('websiteContent');
        if (!websiteContent) {
            console.warn('localStorage中没有找到内容');
            return null;
        }
        
        const content = JSON.parse(websiteContent);
        console.log('从localStorage获取的内容:', content);
        return content;
    } catch (error) {
        console.error('从localStorage读取内容时出错:', error);
        return null;
    }
}

// 检查内容更新
function checkForContentUpdates() {
    const localContent = getContentFromLocalStorage();
    if (localContent && window.lastAppliedContent) {
        // 转换为字符串以进行比较
        const oldContentStr = JSON.stringify(window.lastAppliedContent);
        const newContentStr = JSON.stringify(localContent);
        
        if (oldContentStr !== newContentStr) {
            console.log('检测到内容更新，更新前台内容');
            applyContentToFrontend(localContent);
        }
    }
}

// 从API获取内容
async function fetchAllContent() {
    try {
        console.log('正在从API获取内容');
        const response = await fetch(`${API_BASE_URL}/content`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            console.error('API响应错误:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取内容时出错:', error);
        // 当出现CORS或网络错误时，回退到使用默认内容
        console.log('尝试从备用资源获取内容...');
        return fetchFallbackContent();
    }
}

// 添加备用内容获取函数，当API不可用时使用
async function fetchFallbackContent() {
    try {
        // 尝试从本地JSON文件获取默认内容
        const response = await fetch('/assets/data/default-content.json');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('获取备用内容时出错:', error);
        return null;
    }
}

// 应用内容到前台
function applyContentToFrontend(content) {
    // 保存最后应用的内容，用于比较更新
    window.lastAppliedContent = JSON.parse(JSON.stringify(content));
    console.log('正在应用内容到前台:', content);
    
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
    
    // 显示调试信息
    console.log('内容应用完成');
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
            // 标题保持纯文本，移除任何HTML标签
            document.title = content.homeHeaderForm.title.replace(/<[^>]*>/g, '');
            
            // Logo处的公司名称，如果存在
            const logoText = document.querySelector('.navbar-brand span');
            if (logoText) {
                // 使用innerHTML而不是textContent以支持HTML
                logoText.innerHTML = content.homeHeaderForm.title;
            }
        }
        
        // 联系信息
        if (content.contactForm) {
            // 页脚联系信息
            const footerAddress = document.querySelector('.footer-section .address');
            const footerPhone = document.querySelector('.footer-section .phone');
            const footerEmail = document.querySelector('.footer-section .email');
            
            if (footerAddress && content.contactForm.address) {
                // 使用innerHTML而不是textContent以支持HTML
                footerAddress.innerHTML = content.contactForm.address;
            }
            
            if (footerPhone && content.contactForm.phone) {
                // 使用innerHTML而不是textContent以支持HTML
                footerPhone.innerHTML = content.contactForm.phone;
            }
            
            if (footerEmail && content.contactForm.email) {
                // 使用innerHTML而不是textContent以支持HTML
                footerEmail.innerHTML = content.contactForm.email;
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
        console.log('开始应用首页内容...');
        
        // 首页标题和描述
        if (content.homeHeaderForm) {
            // 修复选择器以正确找到页面上的主标题元素
            // 使用多个选择器尝试找到标题元素
            const mainTitleSelectors = [
                '.banner-section-content h1',              // 原始选择器
                '.banner-section h1',                      // 简化选择器
                '.intro-container h1',                     // 可能的选择器
                'section h1:first-of-type',                // 尝试找到第一个h1
                'h1'                                       // 最宽泛的选择器
            ];
            
            let mainTitle = null;
            for (const selector of mainTitleSelectors) {
                mainTitle = document.querySelector(selector);
                if (mainTitle) {
                    console.log('找到标题元素，使用选择器:', selector);
                    break;
                }
            }
            
            // 找不到标题元素，尝试寻找任何可能是标题的元素
            if (!mainTitle) {
                console.log('无法通过预定义选择器找到标题，尝试查找其他可能的标题元素');
                // 查找所有h1-h3标签
                const headings = document.querySelectorAll('h1, h2, h3');
                if (headings.length > 0) {
                    mainTitle = headings[0]; // 使用第一个找到的标题
                    console.log('使用替代标题元素:', mainTitle.tagName);
                }
            }
            
            // 同样，为描述找到正确的元素
            const descriptionSelectors = [
                '.banner-section-content p',   // 原始选择器
                '.banner-section p',           // 简化选择器
                '.intro-container p',          // 可能的选择器
                'section p:first-of-type',     // 尝试找到第一个段落
                'p'                            // 最宽泛的选择器
            ];
            
            let description = null;
            for (const selector of descriptionSelectors) {
                description = document.querySelector(selector);
                if (description) {
                    console.log('找到描述元素，使用选择器:', selector);
                    break;
                }
            }
                
            // 应用标题内容，优先使用title，不存在则尝试使用homeTitle
            const titleContent = content.homeHeaderForm.title || content.homeHeaderForm.homeTitle;
            if (mainTitle && titleContent) {
                console.log('应用首页标题:', titleContent);
                // 使用innerHTML而不是textContent以支持HTML
                mainTitle.innerHTML = titleContent;
            } else {
                console.warn('未找到首页标题元素或没有标题内容');
            }
            
            // 应用描述内容，优先使用description，不存在则尝试使用homeDescription
            const descriptionContent = content.homeHeaderForm.description || content.homeHeaderForm.homeDescription;
            if (description && descriptionContent) {
                console.log('应用首页描述:', descriptionContent);
                // 使用innerHTML而不是textContent以支持HTML
                description.innerHTML = descriptionContent;
            } else {
                console.warn('未找到首页描述元素或没有描述内容');
            }
        }
        
        // 游戏内容 (趋势游戏区域)
        if (content.featuredServicesForm) {
            console.log('尝试应用游戏内容...');
            
            // 调试 - 列出页面中的所有 trending_span_wrapper 元素
            const allSpanWrappers = document.querySelectorAll('.trending_span_wrapper');
            console.log('页面中找到 .trending_span_wrapper 元素数量:', allSpanWrappers.length);
            allSpanWrappers.forEach((el, index) => {
                console.log(`第 ${index+1} 个 span 内容:`, el.innerHTML);
            });
            
            // 查找趋势游戏内容区域 - 使用更精确的选择器
            const trendingSpans = document.querySelectorAll('.trending_span_wrapper span');
            
            if (trendingSpans && trendingSpans.length >= 3) {
                console.log('找到趋势游戏元素:', trendingSpans.length);
                
                // 游戏1
                if (content.featuredServicesForm.service1Title) {
                    console.log('更新游戏1标题:', content.featuredServicesForm.service1Title);
                    // 使用innerHTML而不是textContent以支持HTML
                    trendingSpans[0].innerHTML = content.featuredServicesForm.service1Title;
                }
                
                // 游戏2
                if (content.featuredServicesForm.service2Title) {
                    console.log('更新游戏2标题:', content.featuredServicesForm.service2Title);
                    // 使用innerHTML而不是textContent以支持HTML
                    trendingSpans[1].innerHTML = content.featuredServicesForm.service2Title;
                }
                
                // 游戏3
                if (content.featuredServicesForm.service3Title) {
                    console.log('更新游戏3标题:', content.featuredServicesForm.service3Title);
                    // 使用innerHTML而不是textContent以支持HTML
                    trendingSpans[2].innerHTML = content.featuredServicesForm.service3Title;
                }
            } else {
                console.warn('未找到足够的趋势游戏标题元素, 找到:', trendingSpans ? trendingSpans.length : 0);
            }
        }
        
        // 即将到来的比赛
        if (content.upcomingMatchesForm) {
            // 查找即将到来的比赛区域 - 根据实际HTML结构调整选择器
            const matchTeamsElements = document.querySelectorAll('.teams_name');
            const matchDateElements = document.querySelectorAll('.match_date');
            const matchTimeElements = document.querySelectorAll('.match_time');
            
            console.log('找到比赛队伍元素数量:', matchTeamsElements.length);
            console.log('找到比赛日期元素数量:', matchDateElements.length);
            console.log('找到比赛时间元素数量:', matchTimeElements.length);
            
            if (matchTeamsElements.length >= 2 && matchDateElements.length >= 2 && matchTimeElements.length >= 2) {
                // 比赛1
                if (content.upcomingMatchesForm.match1Teams) {
                    console.log('更新比赛1信息:', content.upcomingMatchesForm.match1Teams);
                    // 使用innerHTML而不是textContent以支持HTML
                    matchTeamsElements[0].innerHTML = content.upcomingMatchesForm.match1Teams;
                    matchDateElements[0].innerHTML = content.upcomingMatchesForm.match1Date;
                    matchTimeElements[0].innerHTML = content.upcomingMatchesForm.match1Time;
                }
                
                // 比赛2
                if (content.upcomingMatchesForm.match2Teams) {
                    console.log('更新比赛2信息:', content.upcomingMatchesForm.match2Teams);
                    // 使用innerHTML而不是textContent以支持HTML
                    matchTeamsElements[1].innerHTML = content.upcomingMatchesForm.match2Teams;
                    matchDateElements[1].innerHTML = content.upcomingMatchesForm.match2Date;
                    matchTimeElements[1].innerHTML = content.upcomingMatchesForm.match2Time;
                }
            } else {
                console.warn('未找到足够的比赛信息元素');
            }
        }
        
        // 检查页面标题是否有变化，如果有则更新文档标题
        if (content.homeHeaderForm && content.homeHeaderForm.title) {
            // 标题保持纯文本，移除任何HTML标签
            document.title = content.homeHeaderForm.title.replace(/<[^>]*>/g, '');
        }
        
        console.log('首页内容应用完成');
    } catch (error) {
        console.error('应用首页内容时出错:', error);
        console.error('错误详情:', error.stack);
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
            // 使用innerHTML而不是textContent以支持HTML
            aboutTitle.innerHTML = content.aboutForm.title;
        }
        
        if (aboutDescription && content.aboutForm.description) {
            // 使用innerHTML而不是textContent以支持HTML
            aboutDescription.innerHTML = content.aboutForm.description;
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
            // 使用innerHTML而不是textContent以支持HTML
            contactTitle.innerHTML = content.contactForm.title;
        }
        
        // 联系信息
        const addressElement = document.querySelector('.contact-info .address');
        const phoneElement = document.querySelector('.contact-info .phone');
        const emailElement = document.querySelector('.contact-info .email');
        
        if (addressElement && content.contactForm.address) {
            // 使用innerHTML而不是textContent以支持HTML
            addressElement.innerHTML = content.contactForm.address;
        }
        
        if (phoneElement && content.contactForm.phone) {
            // 使用innerHTML而不是textContent以支持HTML
            phoneElement.innerHTML = content.contactForm.phone;
        }
        
        if (emailElement && content.contactForm.email) {
            // 使用innerHTML而不是textContent以支持HTML
            emailElement.innerHTML = content.contactForm.email;
        }
        
        // 页脚联系信息
        const footerAddress = document.querySelector('.footer-section .address');
        const footerPhone = document.querySelector('.footer-section .phone');
        const footerEmail = document.querySelector('.footer-section .email');
        
        if (footerAddress && content.contactForm.address) {
            // 使用innerHTML而不是textContent以支持HTML
            footerAddress.innerHTML = content.contactForm.address;
        }
        
        if (footerPhone && content.contactForm.phone) {
            // 使用innerHTML而不是textContent以支持HTML
            footerPhone.innerHTML = content.contactForm.phone;
        }
        
        if (footerEmail && content.contactForm.email) {
            // 使用innerHTML而不是textContent以支持HTML
            footerEmail.innerHTML = content.contactForm.email;
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
                // 使用innerHTML而不是textContent以支持HTML
                title.innerHTML = content.servicesForm.title;
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
