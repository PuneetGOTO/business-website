// 检测是否为本地环境
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// 如果是本地环境使用本地API，否则使用生产环境API
const API_BASE_URL = isLocalhost ? '/api' : 'https://business-website-production.up.railway.app/api';

// 添加调试信息
console.log('登录页面 - 当前环境:', isLocalhost ? '本地开发' : '生产环境');
console.log('登录页面 - API基础URL:', API_BASE_URL);

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
            
            // 显示登录中状态
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '登录中...';
            }
            
            // 提交登录请求
            login(email, password)
                .then(success => {
                    if (success) {
                        window.location.href = 'dashboard.html';
                    } else {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = '登录';
                        }
                    }
                })
                .catch(error => {
                    console.error('登录错误:', error);
                    showErrorMessage('登录失败，请稍后重试');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '登录';
                    }
                });
        });
    }
});

// 登录函数
async function login(email, password) {
    try {
        console.log('尝试登录...');
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('登录响应状态:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('登录失败:', errorData);
            showErrorMessage(errorData.message || '登录失败，请检查邮箱和密码');
            return false;
        }
        
        const data = await response.json();
        console.log('登录成功:', data);
        
        // 保存token到会话存储
        sessionStorage.setItem('adminToken', data.token);
        return true;
    } catch (error) {
        console.error('登录请求出错:', error);
        showErrorMessage('服务器连接失败，请稍后重试');
        return false;
    }
}

// 验证令牌有效性
async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.warn('Token无效，需要重新登录');
            sessionStorage.removeItem('adminToken');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('验证Token时出错:', error);
        sessionStorage.removeItem('adminToken');
        return false;
    }
}

// 显示错误消息
function showErrorMessage(text) {
    // 查找或创建警告元素
    let alertElement = document.querySelector('.alert');
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger';
        const form = document.getElementById('loginForm');
        if (form) {
            form.parentNode.insertBefore(alertElement, form);
        }
    }
    
    alertElement.textContent = text;
    alertElement.style.display = 'block';
    
    // 5秒后自动隐藏
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}
