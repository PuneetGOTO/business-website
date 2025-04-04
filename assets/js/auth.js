// 简单的用户认证系统
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有登录表单
    const loginForm = document.querySelector('form.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('exampleInputEmail1').value;
            const password = document.getElementById('exampleInputPassword1').value;
            const rememberMe = document.querySelector('input[name="userRememberMe"]')?.checked || false;
            
            // 从localStorage获取用户
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // 登录成功
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                }
                
                alert('登录成功！');
                window.location.href = 'index.html';
            } else {
                alert('邮箱或密码错误！');
            }
        });
    }
    
    // 检查是否有注册表单
    const signupForm = document.querySelector('form.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('exampleInputName1').value;
            const email = document.getElementById('exampleInputEmail1').value;
            const password = document.getElementById('exampleInputPassword1').value;
            const source = document.getElementById('inputNoncorehub').value;
            
            // 从localStorage获取现有用户
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 检查邮箱是否已存在
            if (users.some(u => u.email === email)) {
                alert('该邮箱已被注册！');
                return;
            }
            
            // 添加新用户
            const newUser = { name, email, password, source, registerDate: new Date().toISOString() };
            users.push(newUser);
            
            // 保存到localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // 自动登录
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            
            alert('注册成功！');
            window.location.href = 'index.html';
        });
    }
    
    // 更新导航栏显示状态
    function updateNavStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
        const loginLinks = document.querySelectorAll('.login_btn');
        const signupLinks = document.querySelectorAll('.signup_btn');
        const joinNowLinks = document.querySelectorAll('.joinus_btn, .join_now_btn');
        
        if (currentUser) {
            // 用户已登录
            loginLinks.forEach(link => {
                const parent = link.parentElement;
                if (parent) {
                    parent.innerHTML = `<a class="nav-link" href="#">${currentUser.name}</a>`;
                }
            });
            
            signupLinks.forEach(link => {
                const parent = link.parentElement;
                if (parent) {
                    parent.innerHTML = `<a class="nav-link logout_btn" href="#">退出登录</a>`;
                }
            });
            
            joinNowLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // 处理登出
            document.querySelectorAll('.logout_btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    alert('已退出登录');
                    window.location.reload();
                });
            });
        }
    }
    
    // 页面加载时更新导航状态
    updateNavStatus();
});
