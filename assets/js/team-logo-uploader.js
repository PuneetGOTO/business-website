/**
 * 团队Logo上传管理器
 * 提供上传、选择和管理团队logo图片的功能
 */

// 存储logo数据的本地存储键名
const TEAM_LOGOS_STORAGE_KEY = 'teamLogosData';

// 初始化logo上传器
document.addEventListener('DOMContentLoaded', function() {
    console.log('团队Logo上传器已初始化');
    initTeamLogoUploader();
});

/**
 * 初始化团队Logo上传器
 */
function initTeamLogoUploader() {
    // 创建图片选择模态窗口 (如果尚未存在)
    createLogoSelectorModal();
    
    // 为所有logo选择按钮添加点击事件
    const logoSelectButtons = document.querySelectorAll('.team-logo-select-btn');
    logoSelectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetInputId = this.getAttribute('data-target-input');
            openLogoSelector(targetInputId);
        });
    });
    
    // 为所有logo上传按钮添加点击事件
    const logoUploadButtons = document.querySelectorAll('.team-logo-upload-btn');
    logoUploadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetInputId = this.getAttribute('data-target-input');
            document.getElementById('logoFileUpload').setAttribute('data-target-input', targetInputId);
            document.getElementById('logoFileUpload').click();
        });
    });
    
    // 处理文件上传
    const logoFileUpload = document.getElementById('logoFileUpload');
    if (logoFileUpload) {
        logoFileUpload.addEventListener('change', handleLogoFileUpload);
    }
}

/**
 * 创建Logo选择器模态窗口
 */
function createLogoSelectorModal() {
    // 如果模态窗口已存在，则不重复创建
    if (document.getElementById('logoSelectorModal')) {
        return;
    }
    
    // 创建模态窗口HTML
    const modalHTML = `
    <div class="modal fade" id="logoSelectorModal" tabindex="-1" role="dialog" aria-labelledby="logoSelectorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="logoSelectorModalLabel">选择团队Logo</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header bg-secondary text-white">
                                    <h6 class="mb-0">上传新Logo</h6>
                                </div>
                                <div class="card-body">
                                    <div class="custom-file">
                                        <input type="file" class="custom-file-input" id="newLogoUpload" accept="image/*">
                                        <label class="custom-file-label" for="newLogoUpload">选择图片...</label>
                                    </div>
                                    <div id="newLogoPreview" class="mt-3 text-center d-none">
                                        <img src="" alt="Logo预览" style="max-height: 100px; max-width: 100%;">
                                    </div>
                                    <div class="text-center mt-3">
                                        <button type="button" class="btn btn-primary" id="uploadNewLogoBtn">上传Logo</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <h6 class="mb-3">现有团队Logo</h6>
                            <div id="logoGalleryContainer" class="row">
                                <!-- 现有logo将在这里显示 -->
                                <div class="col-12 text-center py-4 text-muted">
                                    <i class="fas fa-image fa-3x mb-3"></i>
                                    <p>暂无上传的团队Logo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 隐藏的文件上传输入 -->
    <input type="file" id="logoFileUpload" accept="image/*" style="display: none;">
    `;
    
    // 将模态窗口添加到文档中
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // 绑定新logo上传预览
    const newLogoUpload = document.getElementById('newLogoUpload');
    if (newLogoUpload) {
        newLogoUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.querySelector('#newLogoPreview img');
                    preview.src = e.target.result;
                    document.getElementById('newLogoPreview').classList.remove('d-none');
                };
                reader.readAsDataURL(file);
                
                // 更新文件名显示
                const fileLabel = this.nextElementSibling;
                if (fileLabel) {
                    fileLabel.textContent = file.name;
                }
            }
        });
    }
    
    // 绑定上传新logo按钮
    const uploadNewLogoBtn = document.getElementById('uploadNewLogoBtn');
    if (uploadNewLogoBtn) {
        uploadNewLogoBtn.addEventListener('click', uploadNewLogo);
    }
}

/**
 * 打开Logo选择器
 * @param {string} targetInputId - 目标输入框ID
 */
function openLogoSelector(targetInputId) {
    // 存储目标输入框ID
    sessionStorage.setItem('currentLogoTarget', targetInputId);
    
    // 加载现有logo
    loadLogoGallery();
    
    // 显示模态窗口
    $('#logoSelectorModal').modal('show');
}

/**
 * 加载Logo库
 */
function loadLogoGallery() {
    const galleryContainer = document.getElementById('logoGalleryContainer');
    if (!galleryContainer) return;
    
    // 清空当前内容
    galleryContainer.innerHTML = '';
    
    // 获取已保存的logo
    const logos = getTeamLogos();
    
    if (logos.length === 0) {
        // 显示无内容提示
        galleryContainer.innerHTML = `
            <div class="col-12 text-center py-4 text-muted">
                <i class="fas fa-image fa-3x mb-3"></i>
                <p>暂无上传的团队Logo</p>
            </div>
        `;
        return;
    }
    
    // 显示所有logo
    logos.forEach(logo => {
        const logoCard = createLogoCard(logo);
        galleryContainer.appendChild(logoCard);
    });
}

/**
 * 创建Logo卡片
 * @param {Object} logo - Logo对象
 * @returns {HTMLElement} - Logo卡片元素
 */
function createLogoCard(logo) {
    const card = document.createElement('div');
    card.className = 'col-md-3 col-sm-4 col-6 mb-3';
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-body p-2 text-center">
                <img src="${logo.dataUrl}" alt="${logo.name}" class="img-fluid mb-2" style="max-height: 80px;">
                <h6 class="card-title mb-1 text-truncate" title="${logo.name}">${logo.name}</h6>
                <p class="card-text small text-muted mb-2">${formatDate(logo.dateAdded)}</p>
            </div>
            <div class="card-footer p-1">
                <div class="btn-group btn-group-sm w-100">
                    <button type="button" class="btn btn-primary select-logo-btn" data-logo-id="${logo.id}">选择</button>
                    <button type="button" class="btn btn-danger delete-logo-btn" data-logo-id="${logo.id}">删除</button>
                </div>
            </div>
        </div>
    `;
    
    // 绑定选择按钮
    const selectBtn = card.querySelector('.select-logo-btn');
    selectBtn.addEventListener('click', function() {
        selectLogoForInput(logo);
    });
    
    // 绑定删除按钮
    const deleteBtn = card.querySelector('.delete-logo-btn');
    deleteBtn.addEventListener('click', function() {
        deleteTeamLogo(logo.id);
    });
    
    return card;
}

/**
 * 处理Logo文件上传
 */
function handleLogoFileUpload() {
    const fileInput = this;
    const file = fileInput.files[0];
    
    if (!file) return;
    
    // 获取目标输入框ID
    const targetInputId = fileInput.getAttribute('data-target-input');
    
    // 读取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建Logo对象
        const logo = {
            id: generateUniqueId(),
            name: file.name,
            dataUrl: e.target.result,
            dateAdded: new Date().toISOString()
        };
        
        // 保存Logo
        saveTeamLogo(logo);
        
        // 更新输入框值
        updateLogoInput(targetInputId, logo);
        
        // 显示成功消息
        showNotification('Logo已成功上传并应用', 'success');
        
        // 清空文件输入
        fileInput.value = '';
    };
    reader.readAsDataURL(file);
}

/**
 * 上传新Logo
 */
function uploadNewLogo() {
    const fileInput = document.getElementById('newLogoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('请先选择一个Logo图片', 'warning');
        return;
    }
    
    // 读取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建Logo对象
        const logo = {
            id: generateUniqueId(),
            name: file.name,
            dataUrl: e.target.result,
            dateAdded: new Date().toISOString()
        };
        
        // 保存Logo
        saveTeamLogo(logo);
        
        // 重新加载Logo库
        loadLogoGallery();
        
        // 重置输入
        fileInput.value = '';
        document.getElementById('newLogoPreview').classList.add('d-none');
        fileInput.nextElementSibling.textContent = '选择图片...';
        
        // 显示成功消息
        showNotification('Logo已成功上传', 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * 为输入框选择Logo
 * @param {Object} logo - Logo对象
 */
function selectLogoForInput(logo) {
    // 获取目标输入框ID
    const targetInputId = sessionStorage.getItem('currentLogoTarget');
    if (!targetInputId) return;
    
    // 更新输入框值
    updateLogoInput(targetInputId, logo);
    
    // 关闭模态窗口
    $('#logoSelectorModal').modal('hide');
    
    // 显示成功消息
    showNotification('Logo已成功应用', 'success');
}

/**
 * 更新Logo输入框
 * @param {string} inputId - 输入框ID
 * @param {Object} logo - Logo对象
 */
function updateLogoInput(inputId, logo) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // 设置输入框值为logo的dataUrl
    input.value = logo.dataUrl;
    
    // 如果有预览元素，则更新预览
    const previewContainer = input.parentElement.parentElement.querySelector('.logo-preview');
    if (previewContainer) {
        const previewImg = previewContainer.querySelector('img') || document.createElement('img');
        previewImg.src = logo.dataUrl;
        previewImg.alt = logo.name;
        previewImg.className = 'img-fluid';
        previewImg.style.maxHeight = '50px';
        
        if (!previewContainer.contains(previewImg)) {
            previewContainer.innerHTML = '';
            previewContainer.appendChild(previewImg);
        }
        
        previewContainer.classList.remove('d-none');
    }
    
    // 触发输入变化事件，用于更新预览
    const event = new Event('change');
    input.dispatchEvent(event);
    
    // 同步到match-sync.js
    if (typeof syncMatchesToFrontend === 'function') {
        syncMatchesToFrontend();
    }
}

/**
 * 保存团队Logo
 * @param {Object} logo - Logo对象
 */
function saveTeamLogo(logo) {
    // 获取现有logo
    const logos = getTeamLogos();
    
    // 添加新logo
    logos.push(logo);
    
    // 保存到本地存储
    localStorage.setItem(TEAM_LOGOS_STORAGE_KEY, JSON.stringify(logos));
}

/**
 * 删除团队Logo
 * @param {string} logoId - Logo ID
 */
function deleteTeamLogo(logoId) {
    // 获取现有logo
    let logos = getTeamLogos();
    
    // 过滤掉要删除的logo
    logos = logos.filter(logo => logo.id !== logoId);
    
    // 保存到本地存储
    localStorage.setItem(TEAM_LOGOS_STORAGE_KEY, JSON.stringify(logos));
    
    // 重新加载Logo库
    loadLogoGallery();
    
    // 显示成功消息
    showNotification('Logo已成功删除', 'success');
}

/**
 * 获取所有团队Logo
 * @returns {Array} - Logo数组
 */
function getTeamLogos() {
    const logosJson = localStorage.getItem(TEAM_LOGOS_STORAGE_KEY);
    return logosJson ? JSON.parse(logosJson) : [];
}

/**
 * 生成唯一ID
 * @returns {string} - 唯一ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 格式化日期
 * @param {string} dateString - ISO日期字符串
 * @returns {string} - 格式化后的日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

/**
 * 数字前补零
 * @param {number} num - 数字
 * @returns {string} - 补零后的字符串
 */
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success, info, warning, danger)
 */
function showNotification(message, type = 'info') {
    // 检查是否有通知容器
    let container = document.getElementById('notificationContainer');
    
    // 如果没有，则创建一个
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'position-fixed top-0 right-0 p-3';
        container.style.zIndex = '9999';
        container.style.right = '0';
        container.style.top = '60px';
        document.body.appendChild(container);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `toast bg-${type} text-white`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    notification.setAttribute('data-delay', '3000');
    
    notification.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="mr-auto">团队Logo管理器</strong>
            <button type="button" class="ml-2 mb-1 close text-white" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 显示通知
    $(notification).toast('show');
    
    // 通知显示后删除
    $(notification).on('hidden.bs.toast', function() {
        notification.remove();
    });
}
