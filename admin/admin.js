// 检测是否为本地环境
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// 如果是本地环境使用本地API，否则使用生产环境API
const API_BASE_URL = isLocalhost ? '/api' : 'https://business-website-production.up.railway.app/api';

// JWT令牌
let authToken = null;

// 添加调试信息
console.log('管理后台 - 当前环境:', isLocalhost ? '本地开发' : '生产环境');
console.log('管理后台 - API基础URL:', API_BASE_URL);

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminEmail = sessionStorage.getItem('adminEmail');
    const token = sessionStorage.getItem('adminToken');
    
    console.log('检查登录状态:', { isLoggedIn, adminEmail, token });
    
    // 只有当明确没有登录状态时才重定向回登录页面
    if (isLoggedIn !== 'true' || !adminEmail || !token) {
        console.log('未登录，重定向到登录页面');
        window.location.href = 'login.html';
        return false;
    }
    
    // 如果邮箱不是管理员邮箱，也重定向回登录页面
    if (adminEmail !== 'an920513@gmail.com') {
        console.log('非管理员邮箱，重定向到登录页面');
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('adminToken');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('登录验证成功');
    return true;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!checkAdminLogin()) return;
    
    // 初始化侧边栏菜单点击事件
    initSidebar();
    
    // 从API加载内容数据
    loadPageContent();
    
    // 初始化表单提交事件
    initFormSubmissions();
    
    // 初始化登出按钮
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminEmail');
        window.location.href = 'login.html';
    });
});

// 初始化侧边栏菜单
function initSidebar() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 设置当前项为活动状态
            this.classList.add('active');
            
            // 切换内容区域
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // 加载其他页面的编辑区域
    loadSections();
}

// 显示选定的内容区域
function showSection(section) {
    // 隐藏所有区域
    const allSections = document.querySelectorAll('.section-editor');
    allSections.forEach(s => s.classList.remove('active'));
    
    // 显示选定区域
    const selectedSection = document.getElementById(section + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

// 动态加载其他页面的编辑区域
function loadSections() {
    // 加载关于页面编辑区域
    const aboutSection = createSection('about', '关于页面管理');
    
    const aboutTitleCard = createCard('关于页面标题和描述', `
        <form id="aboutTitleForm">
            <div class="form-group">
                <label>页面标题</label>
                <input type="text" class="form-control" id="aboutTitle" value="About Us">
            </div>
            <div class="form-group">
                <label>标语</label>
                <input type="text" class="form-control" id="aboutSlogan" value="Play Fun And Enjoy The Games">
            </div>
            <div class="form-group">
                <label>描述文字</label>
                <textarea class="form-control" id="aboutDescription" rows="3">Quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit.</textarea>
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    const statsCard = createCard('统计数据', `
        <form id="statsForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>团队成员数量</label>
                        <input type="number" class="form-control" id="teamMembers" value="80">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>特色游戏数量</label>
                        <input type="number" class="form-control" id="featuredGames" value="30">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>常规客户数量</label>
                        <input type="number" class="form-control" id="regularClients" value="40">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>获奖数量</label>
                        <input type="number" class="form-control" id="winAwards" value="50">
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    aboutSection.appendChild(aboutTitleCard);
    aboutSection.appendChild(statsCard);
    
    // 加载游戏页面编辑区域
    const gamesSection = createSection('games', '游戏页面管理');
    
    const gamesHeaderCard = createCard('游戏页面标题', `
        <form id="gamesHeaderForm">
            <div class="form-group">
                <label>页面标题</label>
                <input type="text" class="form-control" id="gamesPageTitle" value="Our Games">
            </div>
            <div class="form-group">
                <label>热门游戏标题</label>
                <input type="text" class="form-control" id="popularGamesTitle" value="Most Popular Games">
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    const upcomingGamesCard = createCard('即将上线游戏', `
        <form id="upcomingGamesForm">
            <div class="form-group">
                <label>标题</label>
                <input type="text" class="form-control" id="upcomingGamesTitle" value="Upcoming Games">
            </div>
            <div class="form-group">
                <label>游戏1名称</label>
                <input type="text" class="form-control" id="upcomingGame1" value="Titan Fall 2">
            </div>
            <div class="form-group">
                <label>游戏2名称</label>
                <input type="text" class="form-control" id="upcomingGame2" value="Batman Return">
            </div>
            <div class="form-group">
                <label>游戏3名称</label>
                <input type="text" class="form-control" id="upcomingGame3" value="Injustice 2">
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    gamesSection.appendChild(gamesHeaderCard);
    gamesSection.appendChild(upcomingGamesCard);
    
    // 加载联系页面编辑区域
    const contactSection = createSection('contact', '联系页面管理');
    
    const contactInfoCard = createCard('联系信息', `
        <form id="contactInfoForm">
            <div class="form-group">
                <label>页面标题</label>
                <input type="text" class="form-control" id="contactTitle" value="Contact Us">
            </div>
            <div class="form-group">
                <label>地址</label>
                <input type="text" class="form-control" id="contactAddress" value="King Street,Melbourne,Australia">
            </div>
            <div class="form-group">
                <label>电话</label>
                <input type="text" class="form-control" id="contactPhone" value="0-589-96369-95823">
            </div>
            <div class="form-group">
                <label>邮箱</label>
                <input type="email" class="form-control" id="contactEmail" value="Croxesports@gmail.com">
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    contactSection.appendChild(contactInfoCard);
    
    // 加载比赛详情页面编辑区域
    const matchesSection = createSection('matches', '比赛详情管理');
    
    const matchDetailsCard = createCard('比赛详情', `
        <form id="matchDetailsForm">
            <div class="form-group">
                <label>比赛名称</label>
                <input type="text" class="form-control" id="matchDetailName" value="Battlefield-4 Tournament">
            </div>
            <div class="form-group">
                <label>比赛描述</label>
                <textarea class="form-control" id="matchDescription" rows="3">Quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit.</textarea>
            </div>
            <div class="form-group">
                <label>团队选手标题</label>
                <input type="text" class="form-control" id="teamPlayersTitle" value="Team Players">
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    matchesSection.appendChild(matchDetailsCard);
    
    // 加载通用设置编辑区域
    const generalSection = createSection('general', '通用设置');
    
    const footerCard = createCard('页脚信息', `
        <form id="footerForm">
            <div class="form-group">
                <label>版权信息</label>
                <input type="text" class="form-control" id="copyright" value="Copyright 2021,Crox Esports">
            </div>
            <div class="form-group">
                <label>客户评价标题</label>
                <input type="text" class="form-control" id="clientReviewsTitle" value="Clients Reviews">
            </div>
            <div class="form-group">
                <label>评价内容</label>
                <textarea class="form-control" id="clientReviewsContent" rows="3">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</textarea>
            </div>
            <div class="form-group">
                <label>客户名称</label>
                <input type="text" class="form-control" id="clientName" value="Kevin Andrew">
            </div>
            <div class="form-group">
                <label>客户描述</label>
                <input type="text" class="form-control" id="clientDescription" value="Satisfied Client">
            </div>
            <button type="submit" class="btn btn-primary">保存修改</button>
        </form>
    `);
    
    generalSection.appendChild(footerCard);
}

// 创建一个新的编辑区域节点
function createSection(id, title) {
    const section = document.createElement('div');
    section.classList.add('section-editor');
    section.id = id + '-section';
    section.innerHTML = `<h2>${title}</h2>`;
    document.querySelector('main').appendChild(section);
    return section;
}

// 创建卡片组件
function createCard(title, content) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-4');
    card.innerHTML = `
        <div class="card-header">
            ${title}
        </div>
        <div class="card-body">
            ${content}
        </div>
    `;
    return card;
}

// 初始化表单提交事件
function initFormSubmissions() {
    // 主页标题表单
    initFormSubmit('homeHeaderForm', 'homeHeader');
    
    // 热门游戏表单
    initFormSubmit('trendingGamesForm', 'trendingGames');
    
    // 即将举行的比赛表单
    initFormSubmit('upcomingMatchesForm', 'upcomingMatches');
    
    // 关于页面标题表单
    initFormSubmit('aboutTitleForm', 'aboutTitle');
    
    // 统计数据表单
    initFormSubmit('statsForm', 'stats');
    
    // 游戏页面标题表单
    initFormSubmit('gamesHeaderForm', 'gamesHeader');
    
    // 即将上线游戏表单
    initFormSubmit('upcomingGamesForm', 'upcomingGames');
    
    // 联系信息表单
    initFormSubmit('contactInfoForm', 'contactInfo');
    
    // 比赛详情表单
    initFormSubmit('matchDetailsForm', 'matchDetails');
    
    // 页脚表单
    initFormSubmit('footerForm', 'footer');
}

// 初始化表单提交
function initFormSubmit(formId, contentType) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // 显示正在保存状态
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = '保存中...';
                    
                    // 收集表单数据
                    const formData = {};
                    const inputs = form.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => {
                        formData[input.id] = input.value;
                    });
                    
                    console.log(`正在保存${formId}内容:`, formData);
                    
                    // 发送数据到API
                    const response = await fetch(`${API_BASE_URL}/content/${contentType}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    // 检查响应
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || '保存失败');
                    }
                    
                    const result = await response.json();
                    console.log(`保存${formId}成功:`, result);
                    
                    // 显示成功消息
                    showSuccessMessage();
                    
                    // 恢复按钮状态
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            } catch (error) {
                console.error(`保存${formId}内容错误:`, error);
                showErrorMessage(error.message || '保存失败，请重试');
                
                // 恢复按钮状态
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '保存修改';
                }
            }
        });
    }
}

// 保存数据到本地存储
function saveToLocalStorage(key, data) {
    localStorage.setItem('admin_' + key, JSON.stringify(data));
}

// 从本地存储加载数据
function loadFromLocalStorage(formId) {
    const key = 'admin_' + formId.replace('Form', '');
    const savedData = localStorage.getItem(key);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById(formId);
        
        for (const id in data) {
            const input = document.getElementById(id);
            if (input) {
                input.value = data[id];
            }
        }
    }
}

// 显示成功消息
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.style.display = 'block';
    
    setTimeout(function() {
        message.style.display = 'none';
    }, 3000);
}

// 应用修改到前端页面
// 这个函数用于开发和测试，实际生产环境中应该通过后端API来修改网站内容
function applyChangesToFrontend() {
    // 这里面会使用 AJAX 请求或其他机制将编辑内容应用到实际网站页面
    // 由于这是一个纯前端示例，我们暂时不实现这个功能
}

// 检查管理员登录状态
function checkAdminLogin() {
    authToken = sessionStorage.getItem('adminToken');
    
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    // 验证令牌有效性
    fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('令牌无效');
        }
        return response.json();
    })
    .then(data => {
        if (!data.success || !data.user.isAdmin) {
            // 如果用户不是管理员，则注销
            logout();
        }
    })
    .catch(error => {
        console.error('验证令牌失败:', error);
        logout();
    });
}

// 用户登出
function logout() {
    sessionStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// 从API加载页面内容
async function loadPageContent() {
    try {
        console.log('正在从API加载内容数据...');
        // 添加时间戳参数破坏缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE_URL}/content?_=${timestamp}`, {
            headers: {
                'Authorization': `Bearer ${authToken || sessionStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`获取内容失败: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API返回数据:', result);
        
        if (result.success) {
            const content = result.data;
            
            // 填充表单数据
            if (content.homeHeader) {
                fillFormData('homeHeaderForm', content.homeHeader);
            }
            if (content.trendingGames) {
                fillFormData('trendingGamesForm', content.trendingGames);
            }
            if (content.upcomingMatches) {
                fillFormData('upcomingMatchesForm', content.upcomingMatches);
            }
            if (content.aboutTitle) {
                fillFormData('aboutTitleForm', content.aboutTitle);
            }
            if (content.stats) {
                fillFormData('statsForm', content.stats);
            }
            if (content.gamesHeader) {
                fillFormData('gamesHeaderForm', content.gamesHeader);
            }
            if (content.upcomingGames) {
                fillFormData('upcomingGamesForm', content.upcomingGames);
            }
            if (content.contactInfo) {
                fillFormData('contactInfoForm', content.contactInfo);
            }
            if (content.matchDetails) {
                fillFormData('matchDetailsForm', content.matchDetails);
            }
            if (content.footer) {
                fillFormData('footerForm', content.footer);
            }
            
            console.log('表单数据已填充完成');
        } else {
            console.error('API返回失败:', result.message);
        }
    } catch (error) {
        console.error('加载内容错误:', error);
        showErrorMessage('加载内容失败，请刷新页面重试: ' + error.message);
    }
}

// 用API数据填充表单
function fillFormData(formId, data) {
    if (!data) return;
    
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (data[input.id]) {
            input.value = data[input.id];
        }
    });
}

// 显示错误消息
function showErrorMessage(text) {
    // 创建错误消息元素（如果不存在）
    let errorMessage = document.getElementById('errorMessage');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'errorMessage';
        errorMessage.className = 'alert alert-danger error-message';
        document.querySelector('main').prepend(errorMessage);
    }
    
    errorMessage.textContent = text;
    errorMessage.style.display = 'block';
    
    setTimeout(function() {
        errorMessage.style.display = 'none';
    }, 3000);
}
