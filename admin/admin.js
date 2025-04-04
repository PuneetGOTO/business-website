// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminEmail = sessionStorage.getItem('adminEmail');
    
    if (!isLoggedIn || adminEmail !== 'an920513@gmail.com') {
        window.location.href = 'login.html';
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkAdminLogin();
    
    // 初始化侧边栏菜单点击事件
    initSidebar();
    
    // 初始化表单提交事件
    initFormSubmissions();
    
    // 初始化登出按钮
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('adminLoggedIn');
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
    // 首页表单提交
    initFormSubmit('homeHeaderForm', function(formData) {
        // 在这里处理数据保存逻辑
        // 实际情况下，这里应该发送 AJAX 请求到后端 API
        console.log('保存首页标题和描述:', formData);
        saveToLocalStorage('homeHeader', formData);
    });
    
    initFormSubmit('trendingGamesForm', function(formData) {
        console.log('保存热门游戏设置:', formData);
        saveToLocalStorage('trendingGames', formData);
    });
    
    initFormSubmit('upcomingMatchesForm', function(formData) {
        console.log('保存即将到来的比赛:', formData);
        saveToLocalStorage('upcomingMatches', formData);
    });
    
    // 等待其他表单加载完成后初始化它们的提交事件
    setTimeout(function() {
        // 关于页面表单
        initFormSubmit('aboutTitleForm', function(formData) {
            console.log('保存关于页面标题和描述:', formData);
            saveToLocalStorage('aboutTitle', formData);
        });
        
        initFormSubmit('statsForm', function(formData) {
            console.log('保存统计数据:', formData);
            saveToLocalStorage('stats', formData);
        });
        
        // 游戏页面表单
        initFormSubmit('gamesHeaderForm', function(formData) {
            console.log('保存游戏页面标题:', formData);
            saveToLocalStorage('gamesHeader', formData);
        });
        
        initFormSubmit('upcomingGamesForm', function(formData) {
            console.log('保存即将上线游戏:', formData);
            saveToLocalStorage('upcomingGames', formData);
        });
        
        // 联系页面表单
        initFormSubmit('contactInfoForm', function(formData) {
            console.log('保存联系信息:', formData);
            saveToLocalStorage('contactInfo', formData);
        });
        
        // 比赛详情表单
        initFormSubmit('matchDetailsForm', function(formData) {
            console.log('保存比赛详情:', formData);
            saveToLocalStorage('matchDetails', formData);
        });
        
        // 通用设置表单
        initFormSubmit('footerForm', function(formData) {
            console.log('保存页脚信息:', formData);
            saveToLocalStorage('footer', formData);
        });
    }, 500);
}

// 初始化表单提交
function initFormSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 收集表单数据
            const formData = {};
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                formData[input.id] = input.value;
            });
            
            // 调用回调函数处理数据
            callback(formData);
            
            // 显示成功消息
            showSuccessMessage();
        });
        
        // 从本地存储加载数据
        loadFromLocalStorage(formId);
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
