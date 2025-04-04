// API基础URL
const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    const token = sessionStorage.getItem('adminToken');
    if (token) {
        // 如果已经有token，尝试验证
        validateToken(token)
            .then(valid => {
                if (valid) {
                    // 如果token有效，跳转到管理页面
                    window.location.href = 'dashboard.html';
                }
            });
    }
    
    // 初始化登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // 简单验证
            if (!email || !password) {
                showErrorMessage('请输入邮箱和密码');
                return;
            }
            
            // 提交登录请求
            login(email, password)
                .then(success => {
                    if (success) {
                        window.location.href = 'dashboard.html';
                    }
                });
        });
    }
});

// 登录函数
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            // 显示错误信息
            const errorMessage = data.message || '登录失败，请检查您的邮箱和密码';
            showErrorMessage(errorMessage);
            return false;
        }
        
        // 保存令牌
        sessionStorage.setItem('adminToken', data.token);
        return true;
    } catch (error) {
        console.error('登录错误:', error);
        showErrorMessage('登录请求发生错误，请稍后重试');
        return false;
    }
}

// 验证令牌有效性
async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        return data.success && data.user.isAdmin;
    } catch (error) {
        console.error('验证令牌错误:', error);
        return false;
    }
}

// 显示错误消息
function showErrorMessage(text) {
    // 创建错误消息元素（如果不存在）
    let errorMessage = document.getElementById('loginError');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'loginError';
        errorMessage.className = 'alert alert-danger';
        const form = document.getElementById('loginForm');
        form.prepend(errorMessage);
    }
    
    errorMessage.textContent = text;
    errorMessage.style.display = 'block';
}
