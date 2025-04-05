/**
 * 媒体管理器
 * 用于处理图片和视频的上传和管理
 */

// 存储媒体数据的本地存储键名
const MEDIA_STORAGE_KEY = 'websiteMediaContent';

// 基本的媒体URL路径
const MEDIA_BASE_PATH = 'assets/';
const IMAGE_PATH = MEDIA_BASE_PATH + 'picture/';
const VIDEO_PATH = MEDIA_BASE_PATH + 'file/';

// 初始化媒体管理
document.addEventListener('DOMContentLoaded', function() {
    // 仅在管理后台页面执行
    if (window.location.href.includes('admin/dashboard.html')) {
        console.log('媒体管理器已初始化');
        initMediaManager();
    }
});

// 初始化媒体管理器
function initMediaManager() {
    // 绑定图片上传按钮事件
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', handleImageUpload);
    }
    
    // 绑定视频上传按钮事件
    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', handleVideoUpload);
    }
    
    // 加载已有的媒体文件
    loadExistingMedia();
}

// 加载已有的媒体文件
function loadExistingMedia() {
    const mediaData = getMediaData();
    
    // 加载图片
    renderImageGallery(mediaData.images || []);
    
    // 加载视频
    renderVideoGallery(mediaData.videos || []);
}

// 处理图片上传
function handleImageUpload() {
    const imageFile = document.getElementById('imageFile').files[0];
    const imageTitle = document.getElementById('imageTitle').value;
    const imageCategory = document.getElementById('imageCategory').value;
    
    if (!imageFile) {
        showMessage('请选择要上传的图片', 'warning');
        return;
    }
    
    if (!imageTitle) {
        showMessage('请输入图片标题', 'warning');
        return;
    }
    
    // 创建文件读取器
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 生成唯一ID
        const imageId = 'img_' + new Date().getTime();
        
        // 获取图片数据URL
        const imageDataUrl = e.target.result;
        
        // 创建图片对象
        const imageObject = {
            id: imageId,
            title: imageTitle,
            category: imageCategory,
            fileName: imageFile.name,
            dataUrl: imageDataUrl,
            uploadDate: new Date().toISOString()
        };
        
        // 保存图片
        saveImage(imageObject);
        
        // 清空表单
        document.getElementById('imageUploadForm').reset();
        
        showMessage('图片上传成功', 'success');
    };
    
    reader.onerror = function() {
        showMessage('读取图片文件时出错', 'error');
    };
    
    // 读取图片文件
    reader.readAsDataURL(imageFile);
}

// 处理视频上传
function handleVideoUpload() {
    const videoFile = document.getElementById('videoFile').files[0];
    const videoTitle = document.getElementById('videoTitle').value;
    const videoDescription = document.getElementById('videoDescription').value;
    const videoCategory = document.getElementById('videoCategory').value;
    
    if (!videoFile) {
        showMessage('请选择要上传的视频', 'warning');
        return;
    }
    
    if (!videoTitle) {
        showMessage('请输入视频标题', 'warning');
        return;
    }
    
    // 检查文件大小，视频通常较大
    if (videoFile.size > 100 * 1024 * 1024) { // 100MB限制
        showMessage('视频文件过大，请选择小于100MB的视频', 'warning');
        return;
    }
    
    // 显示进度提示
    showMessage('正在处理视频，请稍候...', 'info');
    
    // 创建文件读取器
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 生成唯一ID
        const videoId = 'vid_' + new Date().getTime();
        
        // 获取视频数据URL
        const videoDataUrl = e.target.result;
        
        // 创建视频对象
        const videoObject = {
            id: videoId,
            title: videoTitle,
            description: videoDescription,
            category: videoCategory,
            fileName: videoFile.name,
            dataUrl: videoDataUrl,
            uploadDate: new Date().toISOString()
        };
        
        // 保存视频
        saveVideo(videoObject);
        
        // 清空表单
        document.getElementById('videoUploadForm').reset();
        
        showMessage('视频上传成功', 'success');
    };
    
    reader.onerror = function() {
        showMessage('读取视频文件时出错', 'error');
    };
    
    // 读取视频文件
    reader.readAsDataURL(videoFile);
}

// 保存图片
function saveImage(imageObject) {
    const mediaData = getMediaData();
    
    // 确保images数组存在
    if (!mediaData.images) {
        mediaData.images = [];
    }
    
    // 添加新图片
    mediaData.images.push(imageObject);
    
    // 保存到本地存储
    saveMediaData(mediaData);
    
    // 更新图片库显示
    renderImageGallery(mediaData.images);
}

// 保存视频
function saveVideo(videoObject) {
    const mediaData = getMediaData();
    
    // 确保videos数组存在
    if (!mediaData.videos) {
        mediaData.videos = [];
    }
    
    // 添加新视频
    mediaData.videos.push(videoObject);
    
    // 保存到本地存储
    saveMediaData(mediaData);
    
    // 更新视频库显示
    renderVideoGallery(mediaData.videos);
}

// 渲染图片库
function renderImageGallery(images) {
    const galleryContainer = document.getElementById('imageGallery');
    const noImagesMessage = document.getElementById('noImagesMessage');
    
    if (!galleryContainer) return;
    
    // 清空现有内容
    galleryContainer.innerHTML = '';
    
    if (!images || images.length === 0) {
        // 显示无图片消息
        galleryContainer.appendChild(noImagesMessage || createNoContentMessage('暂无上传的图片'));
        return;
    }
    
    // 隐藏无图片消息
    if (noImagesMessage) {
        noImagesMessage.style.display = 'none';
    }
    
    // 添加图片卡片
    images.forEach(image => {
        const imageCard = createImageCard(image);
        galleryContainer.appendChild(imageCard);
    });
}

// 渲染视频库
function renderVideoGallery(videos) {
    const galleryContainer = document.getElementById('videoGallery');
    const noVideosMessage = document.getElementById('noVideosMessage');
    
    if (!galleryContainer) return;
    
    // 清空现有内容
    galleryContainer.innerHTML = '';
    
    if (!videos || videos.length === 0) {
        // 显示无视频消息
        galleryContainer.appendChild(noVideosMessage || createNoContentMessage('暂无上传的视频'));
        return;
    }
    
    // 隐藏无视频消息
    if (noVideosMessage) {
        noVideosMessage.style.display = 'none';
    }
    
    // 添加视频卡片
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        galleryContainer.appendChild(videoCard);
    });
}

// 创建图片卡片
function createImageCard(image) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.setAttribute('data-id', image.id);
    
    // 图片预览
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = image.dataUrl;
    img.alt = image.title;
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    
    // 卡片内容
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = image.title;
    
    const category = document.createElement('p');
    category.className = 'card-text';
    category.innerHTML = `<small class="text-muted">分类: ${getCategoryName(image.category, 'image')}</small>`;
    
    const date = document.createElement('p');
    date.className = 'card-text';
    date.innerHTML = `<small class="text-muted">上传时间: ${formatDate(image.uploadDate)}</small>`;
    
    // 复制链接按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-primary mr-2';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制链接';
    copyBtn.addEventListener('click', function() {
        copyToClipboard(image.dataUrl);
        showMessage('图片链接已复制到剪贴板', 'success');
    });
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> 删除';
    deleteBtn.addEventListener('click', function() {
        if (confirm('确定要删除这张图片吗？')) {
            deleteMedia('images', image.id);
        }
    });
    
    // 组装卡片
    cardBody.appendChild(title);
    cardBody.appendChild(category);
    cardBody.appendChild(date);
    cardBody.appendChild(document.createElement('div')).className = 'mb-2'; // 间隔
    cardBody.appendChild(copyBtn);
    cardBody.appendChild(deleteBtn);
    
    card.appendChild(img);
    card.appendChild(cardBody);
    
    col.appendChild(card);
    
    return col;
}

// 创建视频卡片
function createVideoCard(video) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.setAttribute('data-id', video.id);
    
    // 视频预览
    const videoEl = document.createElement('video');
    videoEl.className = 'card-img-top';
    videoEl.src = video.dataUrl;
    videoEl.controls = true;
    videoEl.style.height = '200px';
    videoEl.style.objectFit = 'cover';
    
    // 卡片内容
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = video.title;
    
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = video.description;
    
    const category = document.createElement('p');
    category.className = 'card-text';
    category.innerHTML = `<small class="text-muted">分类: ${getCategoryName(video.category, 'video')}</small>`;
    
    const date = document.createElement('p');
    date.className = 'card-text';
    date.innerHTML = `<small class="text-muted">上传时间: ${formatDate(video.uploadDate)}</small>`;
    
    // 复制链接按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-primary mr-2';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制链接';
    copyBtn.addEventListener('click', function() {
        copyToClipboard(video.dataUrl);
        showMessage('视频链接已复制到剪贴板', 'success');
    });
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> 删除';
    deleteBtn.addEventListener('click', function() {
        if (confirm('确定要删除这个视频吗？')) {
            deleteMedia('videos', video.id);
        }
    });
    
    // 组装卡片
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(category);
    cardBody.appendChild(date);
    cardBody.appendChild(document.createElement('div')).className = 'mb-2'; // 间隔
    cardBody.appendChild(copyBtn);
    cardBody.appendChild(deleteBtn);
    
    card.appendChild(videoEl);
    card.appendChild(cardBody);
    
    col.appendChild(card);
    
    return col;
}

// 删除媒体
function deleteMedia(type, id) {
    const mediaData = getMediaData();
    
    if (!mediaData[type]) return;
    
    // 过滤掉要删除的项
    mediaData[type] = mediaData[type].filter(item => item.id !== id);
    
    // 保存到本地存储
    saveMediaData(mediaData);
    
    // 更新显示
    if (type === 'images') {
        renderImageGallery(mediaData.images);
    } else if (type === 'videos') {
        renderVideoGallery(mediaData.videos);
    }
    
    showMessage(`${type === 'images' ? '图片' : '视频'}已成功删除`, 'success');
}

// 创建无内容消息
function createNoContentMessage(message) {
    const div = document.createElement('div');
    div.className = 'col-12 text-center';
    
    const p = document.createElement('p');
    p.className = 'text-muted';
    p.textContent = message;
    
    div.appendChild(p);
    
    return div;
}

// 获取分类名称
function getCategoryName(category, type) {
    const imageCategories = {
        'banner': '首页横幅',
        'game': '游戏图片',
        'team': '团队成员',
        'gallery': '图库',
        'other': '其他'
    };
    
    const videoCategories = {
        'promo': '宣传视频',
        'tutorial': '教程视频',
        'gameplay': '游戏演示',
        'other': '其他'
    };
    
    if (type === 'image') {
        return imageCategories[category] || category;
    } else {
        return videoCategories[category] || category;
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

// 数字前补零
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 从本地存储获取媒体数据
function getMediaData() {
    const mediaDataString = localStorage.getItem(MEDIA_STORAGE_KEY);
    
    if (!mediaDataString) {
        return { images: [], videos: [] };
    }
    
    try {
        return JSON.parse(mediaDataString);
    } catch (error) {
        console.error('解析媒体数据时出错:', error);
        return { images: [], videos: [] };
    }
}

// 保存媒体数据到本地存储
function saveMediaData(mediaData) {
    try {
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaData));
    } catch (error) {
        console.error('保存媒体数据时出错:', error);
        
        // 可能是数据太大，尝试移除某些大字段
        if (error.name === 'QuotaExceededError') {
            showMessage('存储空间不足，请删除一些不需要的媒体文件', 'warning');
        }
    }
}

// 复制内容到剪贴板
function copyToClipboard(text) {
    // 创建临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // 选择并复制文本
    textarea.select();
    document.execCommand('copy');
    
    // 移除临时元素
    document.body.removeChild(textarea);
}

// 显示消息
function showMessage(message, type = 'info') {
    // 检查是否存在showSuccessMessage或showErrorMessage函数
    if (typeof showSuccessMessage === 'function' && type === 'success') {
        showSuccessMessage(message);
    } else if (typeof showErrorMessage === 'function' && (type === 'error' || type === 'warning')) {
        showErrorMessage(message);
    } else {
        // 创建新的消息元素
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        
        messageContainer.appendChild(alertDiv);
        
        // 5秒后自动消失
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                messageContainer.removeChild(alertDiv);
            }, 150);
        }, 5000);
    }
}
