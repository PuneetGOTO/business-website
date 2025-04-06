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
const BACKGROUND_PATH = MEDIA_BASE_PATH + 'background/'; // 新增背景图片路径

// 远程服务器上的媒体URL路径
const REMOTE_BASE_URL = 'https://luobulesitsb.ggff.net/';
const REMOTE_VIDEO_PATH = REMOTE_BASE_URL + 'assets/file/';

// 当前选中的分类
let currentFilters = {
    image: 'all',
    video: 'all',
    background: 'all'
};

// 存储网站现有媒体文件的对象
let existingSiteMedia = {
    images: [],
    videos: [],
    backgrounds: [] // 新增背景图片数组
};

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
    
    // 绑定背景图片上传按钮事件
    const uploadBackgroundBtn = document.getElementById('uploadBackgroundBtn');
    if (uploadBackgroundBtn) {
        uploadBackgroundBtn.addEventListener('click', handleBackgroundUpload);
    }
    
    // 绑定替换图片相关事件
    initReplaceImageHandlers();
    
    // 绑定替换视频相关事件
    initReplaceVideoHandlers();
    
    // 绑定替换背景图片相关事件
    initReplaceBackgroundHandlers();
    
    // 初始化分类过滤器
    initCategoryFilters();
    
    // 扫描网站上现有的媒体文件
    scanExistingSiteMedia();
    
    // 加载已有的媒体文件
    loadExistingMedia();
}

// 初始化分类过滤器
function initCategoryFilters() {
    // 初始化图片分类过滤器
    initCategoryFilterButtons('imageCategoryFilter', 'image');
    
    // 初始化视频分类过滤器
    initCategoryFilterButtons('videoCategoryFilter', 'video');
    
    // 初始化背景图片分类过滤器
    initCategoryFilterButtons('backgroundCategoryFilter', 'background');
}

// 初始化分类过滤器按钮
function initCategoryFilterButtons(filterId, mediaType) {
    const filterContainer = document.getElementById(filterId);
    if (!filterContainer) return;
    
    const buttons = filterContainer.querySelectorAll('button[data-category]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活跃状态
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // 设置当前按钮为活跃状态
            this.classList.add('active');
            
            // 获取分类值
            const category = this.getAttribute('data-category');
            
            // 更新当前过滤器
            currentFilters[mediaType] = category;
            
            // 根据媒体类型刷新显示
            refreshMediaDisplay(mediaType);
        });
    });
}

// 根据媒体类型刷新显示
function refreshMediaDisplay(mediaType) {
    switch(mediaType) {
        case 'image':
            renderExistingImageSection();
            break;
        case 'video':
            renderExistingVideoSection();
            break;
        case 'background':
            renderExistingBackgroundSection();
            break;
    }
}

// 判断媒体是否匹配当前分类筛选条件
function matchesCategory(src, category, mediaType) {
    // 如果是全部分类，直接返回true
    if (category === 'all') return true;
    
    // 如果是远程媒体分类，检查是否以http开头
    if (category === 'remote') return src.startsWith('http');
    
    // 根据不同媒体类型和分类进行判断
    switch(mediaType) {
        case 'image':
            if (category === 'header' && (src.includes('header') || src.includes('logo'))) return true;
            if (category === 'product' && src.includes('product')) return true;
            if (category === 'background' && (src.includes('background') || src.includes('banner') || src.includes('bg'))) return true;
            if (category === 'team' && (src.includes('team') || src.includes('person') || src.includes('people') || src.includes('member'))) return true;
            if (category === 'other') {
                return !src.includes('header') && !src.includes('logo') &&
                       !src.includes('product') && 
                       !src.includes('background') && !src.includes('banner') && !src.includes('bg') &&
                       !src.includes('team') && !src.includes('person') && !src.includes('people') && !src.includes('member');
            }
            break;
        case 'video':
            if (category === 'intro' && (src.includes('intro') || src.includes('introduction'))) return true;
            if (category === 'game' && src.includes('game')) return true;
            if (category === 'product' && src.includes('product')) return true;
            if (category === 'other') {
                return !src.includes('intro') && !src.includes('introduction') &&
                       !src.includes('game') && !src.includes('product');
            }
            break;
        case 'background':
            if (category === 'default' && (src.includes('banner') || src.includes('home'))) return true;
            if (category === 'game' && src.includes('game')) return true;
            if (category === 'other') {
                return !src.includes('banner') && !src.includes('home') && !src.includes('game');
            }
            break;
    }
    
    return false;
}

// 渲染现有图片区域（添加分类过滤）
function renderExistingImageSection() {
    const container = document.getElementById('existingSiteImages');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 根据当前筛选条件过滤图片
    const filteredImages = existingSiteMedia.images.filter(imgSrc => 
        matchesCategory(imgSrc, currentFilters.image, 'image')
    );
    
    if (filteredImages.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">未找到符合条件的图片</p></div>';
    } else {
        // 添加计数显示
        container.innerHTML = `<div class="col-12 mb-3"><span class="badge badge-info">显示 ${filteredImages.length} 个文件，共 ${existingSiteMedia.images.length} 个</span></div>`;
        
        filteredImages.forEach(imgSrc => {
            const imgCard = createExistingImageCard(imgSrc);
            container.appendChild(imgCard);
        });
    }
}

// 渲染现有视频区域（添加分类过滤）
function renderExistingVideoSection() {
    const container = document.getElementById('existingSiteVideos');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 根据当前筛选条件过滤视频
    const filteredVideos = existingSiteMedia.videos.filter(videoSrc => 
        matchesCategory(videoSrc, currentFilters.video, 'video')
    );
    
    if (filteredVideos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">未找到符合条件的视频</p></div>';
    } else {
        // 添加计数显示
        container.innerHTML = `<div class="col-12 mb-3"><span class="badge badge-info">显示 ${filteredVideos.length} 个文件，共 ${existingSiteMedia.videos.length} 个</span></div>`;
        
        filteredVideos.forEach(videoSrc => {
            const videoCard = createExistingVideoCard(videoSrc);
            container.appendChild(videoCard);
        });
    }
}

// 渲染现有背景图片区域（添加分类过滤）
function renderExistingBackgroundSection() {
    const container = document.getElementById('existingSiteBackgrounds');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 根据当前筛选条件过滤背景图片
    const filteredBackgrounds = existingSiteMedia.backgrounds.filter(bgSrc => 
        matchesCategory(bgSrc, currentFilters.background, 'background')
    );
    
    if (filteredBackgrounds.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">未找到符合条件的背景图片</p></div>';
    } else {
        // 添加计数显示
        container.innerHTML = `<div class="col-12 mb-3"><span class="badge badge-info">显示 ${filteredBackgrounds.length} 个文件，共 ${existingSiteMedia.backgrounds.length} 个</span></div>`;
        
        filteredBackgrounds.forEach(bgSrc => {
            const bgCard = createExistingBackgroundCard(bgSrc);
            container.appendChild(bgCard);
        });
    }
}

// 扫描网站上现有的媒体文件
function scanExistingSiteMedia() {
    // 显示扫描中消息
    showMessage('正在扫描网站媒体文件，请稍候...', 'info');
    
    // 获取HTML文件列表
    const htmlFiles = [
        '../index.html',
        '../about.html',
        '../contact.html',
        '../gallery.html',
        '../games.html',
        '../match_detail.html'
    ];
    
    // 清空现有媒体列表
    existingSiteMedia.images = [];
    existingSiteMedia.videos = [];
    existingSiteMedia.backgrounds = []; // 新增清空背景图片
    
    // 发起HTML文件获取请求
    Promise.all(htmlFiles.map(file => 
        fetch(file)
            .then(response => response.text())
            .catch(error => {
                console.error(`获取${file}时出错:`, error);
                return '';
            })
    ))
    .then(htmlContents => {
        // 处理所有HTML文件内容
        htmlContents.forEach((html, index) => {
            if (html) {
                // 扫描图片
                const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(html)) !== null) {
                    const imgSrc = imgMatch[1];
                    if ((imgSrc.startsWith('assets/picture/') || imgSrc.startsWith(REMOTE_BASE_URL)) && !existingSiteMedia.images.includes(imgSrc)) {
                        existingSiteMedia.images.push(imgSrc);
                    }
                }
                
                // 扫描视频
                const videoRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>|<source[^>]+src=["']([^"']+)["'][^>]*>/g;
                let videoMatch;
                while ((videoMatch = videoRegex.exec(html)) !== null) {
                    const videoSrc = videoMatch[1] || videoMatch[2];
                    if (videoSrc && (videoSrc.startsWith('assets/file/') || videoSrc.startsWith(REMOTE_VIDEO_PATH)) && !existingSiteMedia.videos.includes(videoSrc)) {
                        existingSiteMedia.videos.push(videoSrc);
                    }
                }
                
                // 扫描背景图片
                const bgRegex = /background-image:\s*url\(['"]?([^'"]*?)['"]?\)/g;
                let bgMatch;
                while ((bgMatch = bgRegex.exec(html)) !== null) {
                    const bgSrc = bgMatch[1];
                    if (bgSrc && !existingSiteMedia.backgrounds.includes(bgSrc)) {
                        existingSiteMedia.backgrounds.push(bgSrc);
                    }
                }
                
                // 也扫描内联样式中的背景图片
                const styleRegex = /style=["'].*?background-image:\s*url\(['"]?([^'"]*?)['"]?\).*?["']/g;
                let styleMatch;
                while ((styleMatch = styleRegex.exec(html)) !== null) {
                    const bgSrc = styleMatch[1];
                    if (bgSrc && !existingSiteMedia.backgrounds.includes(bgSrc)) {
                        existingSiteMedia.backgrounds.push(bgSrc);
                    }
                }
                
                // 扫描CSS中的背景图片 (使用特殊类名)
                const mainBanner = document.querySelector('.main-banner');
                if (mainBanner) {
                    const computedStyle = window.getComputedStyle(mainBanner);
                    const backgroundImage = computedStyle.backgroundImage;
                    if (backgroundImage && backgroundImage !== 'none') {
                        const bgUrlMatch = backgroundImage.match(/url\(['"]?([^'"]*?)['"]?\)/);
                        if (bgUrlMatch && bgUrlMatch[1] && !existingSiteMedia.backgrounds.includes(bgUrlMatch[1])) {
                            existingSiteMedia.backgrounds.push(bgUrlMatch[1]);
                        }
                    }
                }
            }
        });
        
        // 手动添加可能未被扫描到的重要背景图片
        if (!existingSiteMedia.backgrounds.includes('assets/picture/banner-bg.jpg')) {
            existingSiteMedia.backgrounds.push('assets/picture/banner-bg.jpg');
        }
        
        // 添加远程服务器上的视频文件
        const remoteVideos = [
            REMOTE_VIDEO_PATH + 'video1.mp4',
            REMOTE_VIDEO_PATH + 'video2.mp4',
            REMOTE_VIDEO_PATH + 'intro.mp4'
        ];
        
        remoteVideos.forEach(videoUrl => {
            if (!existingSiteMedia.videos.includes(videoUrl)) {
                existingSiteMedia.videos.push(videoUrl);
            }
        });
        
        // 扫描完成后，显示现有媒体文件
        renderExistingSiteMediaSection();
        
        console.log('网站媒体文件扫描完成:', existingSiteMedia);
        showMessage('网站媒体文件扫描完成', 'success');
    })
    .catch(error => {
        console.error('扫描网站媒体文件时出错:', error);
        showMessage('扫描网站媒体文件时出错', 'error');
    });
}

// 显示网站现有媒体文件
function renderExistingSiteMediaSection() {
    // 渲染现有图片部分（使用分类过滤）
    renderExistingImageSection();
    
    // 渲染现有视频部分（使用分类过滤）
    renderExistingVideoSection();
    
    // 渲染现有背景图片部分（使用分类过滤）
    renderExistingBackgroundSection();
}

// 加载已有的媒体文件
function loadExistingMedia() {
    const mediaData = getMediaData();
    
    // 加载图片（使用分类过滤）
    renderImageGallery(mediaData.images || []);
    
    // 加载视频（使用分类过滤）
    renderVideoGallery(mediaData.videos || []);
    
    // 加载背景图片（使用分类过滤）
    renderBackgroundGallery(mediaData.backgrounds || []);
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

// 处理背景图片上传
function handleBackgroundUpload() {
    const fileInput = document.getElementById('backgroundFile');
    const categorySelect = document.getElementById('backgroundCategory');
    
    if (!fileInput || !fileInput.files.length) {
        showMessage('请选择一个背景图片文件', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    // 检查文件类型
    if (!file.type.match('image.*')) {
        showMessage('请选择有效的图片文件', 'warning');
        return;
    }
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        showMessage('图片文件太大，请选择小于5MB的文件', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const category = categorySelect ? categorySelect.value : 'default';
        const timestamp = new Date().getTime();
        const fileName = 'bg_' + timestamp + '_' + file.name.replace(/\s+/g, '_');
        
        const backgroundObject = {
            id: 'bg_' + timestamp,
            name: fileName,
            path: BACKGROUND_PATH + fileName,
            category: category,
            dataUrl: e.target.result,
            uploadDate: new Date().toISOString()
        };
        
        saveBackground(backgroundObject);
    };
    
    reader.readAsDataURL(file);
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

// 保存背景图片
function saveBackground(backgroundObject) {
    showMessage('正在保存背景图片...', 'info');
    
    // 这里模拟保存到服务器
    // 实际环境中，这里应该调用API将图片上传到服务器
    setTimeout(() => {
        const mediaData = getMediaData();
        mediaData.backgrounds = mediaData.backgrounds || [];
        mediaData.backgrounds.push(backgroundObject);
        saveMediaData(mediaData);
        
        showMessage('背景图片已保存', 'success');
        
        // 清空表单
        const backgroundFileInput = document.getElementById('backgroundFile');
        if (backgroundFileInput) {
            backgroundFileInput.value = '';
        }
        
        // 更新图片库显示
        loadExistingMedia();
        
        // 关闭模态框
        $('#uploadBackgroundModal').modal('hide');
    }, 1000);
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

// 渲染背景图片库
function renderBackgroundGallery(backgrounds) {
    const galleryContainer = document.getElementById('backgroundGallery');
    const noBackgroundsMessage = document.getElementById('noBackgroundsMessage');
    
    if (!galleryContainer) return;
    
    // 清空现有内容
    galleryContainer.innerHTML = '';
    
    if (!backgrounds || backgrounds.length === 0) {
        // 显示无背景图片消息
        galleryContainer.appendChild(noBackgroundsMessage || createNoContentMessage('暂无上传的背景图片'));
        return;
    }
    
    // 隐藏无背景图片消息
    if (noBackgroundsMessage) {
        noBackgroundsMessage.style.display = 'none';
    }
    
    // 添加背景图片卡片
    backgrounds.forEach(background => {
        const backgroundCard = createBackgroundCard(background);
        galleryContainer.appendChild(backgroundCard);
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

// 创建背景图片卡片
function createBackgroundCard(background) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.setAttribute('data-id', background.id);
    
    // 背景图片预览
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = background.dataUrl;
    img.alt = background.name;
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    
    // 卡片内容
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = background.name;
    
    const category = document.createElement('p');
    category.className = 'card-text';
    category.innerHTML = `<small class="text-muted">分类: ${getCategoryName(background.category, 'background')}</small>`;
    
    const date = document.createElement('p');
    date.className = 'card-text';
    date.innerHTML = `<small class="text-muted">上传时间: ${formatDate(background.uploadDate)}</small>`;
    
    // 复制链接按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-primary mr-2';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制链接';
    copyBtn.addEventListener('click', function() {
        copyToClipboard(background.dataUrl);
        showMessage('背景图片链接已复制到剪贴板', 'success');
    });
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> 删除';
    deleteBtn.addEventListener('click', function() {
        if (confirm('确定要删除这个背景图片吗？')) {
            deleteMedia('backgrounds', background.id);
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
    } else if (type === 'backgrounds') {
        renderBackgroundGallery(mediaData.backgrounds);
    }
    
    showMessage(`${type === 'images' ? '图片' : type === 'videos' ? '视频' : '背景图片'}已成功删除`, 'success');
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
    
    const backgroundCategories = {
        'default': '默认背景',
        'game': '游戏背景',
        'other': '其他'
    };
    
    if (type === 'image') {
        return imageCategories[category] || category;
    } else if (type === 'video') {
        return videoCategories[category] || category;
    } else if (type === 'background') {
        return backgroundCategories[category] || category;
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
        return { images: [], videos: [], backgrounds: [] };
    }
    
    try {
        return JSON.parse(mediaDataString);
    } catch (error) {
        console.error('解析媒体数据时出错:', error);
        return { images: [], videos: [], backgrounds: [] };
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

// 处理图片替换
function handleImageReplace() {
    // 获取当前要替换的图片路径
    const currentImagePath = document.getElementById('currentImagePath').value;
    if (!currentImagePath) {
        showMessage('未找到要替换的图片路径', 'error');
        return;
    }
    
    // 获取新图片文件
    const replaceImageFile = document.getElementById('replaceImageFile').files[0];
    if (!replaceImageFile) {
        showMessage('请选择要替换的新图片', 'error');
        return;
    }
    
    // 显示处理中消息
    showMessage('正在处理图片替换，请稍候...', 'info');
    
    // 读取新图片文件为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建新图片对象以获取尺寸
        const img = new Image();
        img.onload = function() {
            // 保存替换记录到本地存储
            const replacementRecord = {
                originalPath: currentImagePath,
                replacementData: e.target.result,
                timestamp: new Date().getTime(),
                width: img.width,
                height: img.height
            };
            
            // 获取现有的替换记录
            let replacements = JSON.parse(localStorage.getItem('mediaReplacements') || '[]');
            
            // 检查是否已存在此路径的替换，如果有则更新
            const existingIndex = replacements.findIndex(r => r.originalPath === currentImagePath);
            if (existingIndex !== -1) {
                replacements[existingIndex] = replacementRecord;
            } else {
                replacements.push(replacementRecord);
            }
            
            // 保存更新后的替换记录
            localStorage.setItem('mediaReplacements', JSON.stringify(replacements));
            
            // 关闭模态窗口
            $('#replaceImageModal').modal('hide');
            
            // 显示成功消息
            showMessage(`图片 ${currentImagePath.split('/').pop()} 已成功替换！`, 'success');
            
            // 刷新页面上显示的图片
            updateReplacedImages();
        };
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showMessage('读取图片文件时出错', 'error');
    };
    
    // 读取图片文件
    reader.readAsDataURL(replaceImageFile);
}

// 处理视频替换
function handleVideoReplace() {
    // 获取当前要替换的视频路径
    const currentVideoPath = document.getElementById('currentVideoPath').value;
    if (!currentVideoPath) {
        showMessage('未找到要替换的视频路径', 'error');
        return;
    }
    
    // 获取新视频文件
    const replaceVideoFile = document.getElementById('replaceVideoFile').files[0];
    if (!replaceVideoFile) {
        showMessage('请选择要替换的新视频', 'error');
        return;
    }
    
    // 如果视频大于50MB，显示警告
    if (replaceVideoFile.size > 50 * 1024 * 1024) {
        if (!confirm('选择的视频较大（大于50MB），可能会导致性能问题，是否继续？')) {
            return;
        }
    }
    
    // 显示处理中消息
    showMessage('正在处理视频替换，请稍候...', 'info');
    
    // 读取新视频文件为Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        // 保存替换记录到本地存储
        const replacementRecord = {
            originalPath: currentVideoPath,
            replacementData: e.target.result,
            timestamp: new Date().getTime(),
            size: replaceVideoFile.size,
            type: replaceVideoFile.type
        };
        
        // 获取现有的替换记录
        let replacements = JSON.parse(localStorage.getItem('mediaReplacements') || '[]');
        
        // 检查是否已存在此路径的替换，如果有则更新
        const existingIndex = replacements.findIndex(r => r.originalPath === currentVideoPath);
        if (existingIndex !== -1) {
            replacements[existingIndex] = replacementRecord;
        } else {
            replacements.push(replacementRecord);
        }
        
        // 保存更新后的替换记录
        localStorage.setItem('mediaReplacements', JSON.stringify(replacements));
        
        // 关闭模态窗口
        $('#replaceVideoModal').modal('hide');
        
        // 显示成功消息
        showMessage(`视频 ${currentVideoPath.split('/').pop()} 已成功替换！`, 'success');
        
        // 刷新页面上显示的视频
        updateReplacedVideos();
    };
    
    reader.onerror = function() {
        showMessage('读取视频文件时出错', 'error');
    };
    
    // 读取视频文件
    reader.readAsDataURL(replaceVideoFile);
}

// 处理背景图片替换
function handleBackgroundReplace() {
    const fileInput = document.getElementById('replaceBackgroundFile');
    const currentPath = document.getElementById('currentBackgroundPath').value;
    
    if (!fileInput || !fileInput.files.length) {
        showMessage('请选择一个背景图片文件', 'warning');
        return;
    }
    
    if (!currentPath) {
        showMessage('无法确定要替换的背景图片', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    // 检查文件类型
    if (!file.type.match('image.*')) {
        showMessage('请选择有效的图片文件', 'warning');
        return;
    }
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        showMessage('图片文件太大，请选择小于5MB的文件', 'warning');
        return;
    }
    
    showMessage('正在替换背景图片...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // 这里模拟替换背景图片
        // 实际环境中，这里应该调用API将图片上传到服务器，并更新原始图片
        setTimeout(() => {
            // 存储替换记录
            localStorage.setItem('replacedBackground_' + currentPath, e.target.result);
            
            // 更新所有页面中的该背景图片
            updateReplacedBackgrounds();
            
            showMessage('背景图片已替换', 'success');
            
            // 清空表单
            fileInput.value = '';
            document.getElementById('replaceBackgroundPreviewContainer').classList.add('d-none');
            
            // 关闭模态框
            $('#replaceBackgroundModal').modal('hide');
            
            // 更新预览
            const cardImg = document.querySelector(`[data-src="${currentPath}"] img`);
            if (cardImg) {
                cardImg.src = e.target.result;
            }
        }, 1000);
    };
    
    reader.readAsDataURL(file);
}

// 更新已替换的图片
function updateReplacedImages() {
    // 获取替换记录
    const replacements = JSON.parse(localStorage.getItem('mediaReplacements') || '[]');
    
    // 找到所有图片元素
    const imgElements = document.querySelectorAll('img');
    
    // 遍历所有图片元素
    imgElements.forEach(img => {
        let src = img.getAttribute('src');
        
        // 如果是相对路径，转换为标准格式
        if (src && src.startsWith('../')) {
            src = src.substring(3); // 去掉开头的 ../
        }
        
        // 检查是否有这个图片的替换记录
        const replacement = replacements.find(r => r.originalPath === src);
        if (replacement) {
            // 替换图片源
            img.src = replacement.replacementData;
        }
    });
    
    // 刷新现有图片显示
    renderExistingSiteMediaSection();
}

// 更新已替换的视频
function updateReplacedVideos() {
    // 获取替换记录
    const replacements = JSON.parse(localStorage.getItem('mediaReplacements') || '[]');
    
    // 找到所有视频元素
    const videoElements = document.querySelectorAll('video, source');
    
    // 遍历所有视频元素
    videoElements.forEach(video => {
        let src = video.getAttribute('src');
        
        // 如果是相对路径，转换为标准格式
        if (src && src.startsWith('../')) {
            src = src.substring(3); // 去掉开头的 ../
        }
        
        // 检查是否有这个视频的替换记录
        const replacement = replacements.find(r => r.originalPath === src);
        if (replacement) {
            // 替换视频源
            video.src = replacement.replacementData;
            
            // 如果是video元素，则重新加载
            if (video.tagName === 'VIDEO') {
                video.load();
            }
        }
    });
    
    // 刷新现有视频显示
    renderExistingSiteMediaSection();
}

// 更新已替换的背景图片
function updateReplacedBackgrounds() {
    // 获取所有背景图片元素
    let stylesWithBackgrounds = [];
    
    // 查找内联样式中的背景图
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        const match = style.match(/background-image:\s*url\(['"]?([^'"]*?)['"]?\)/);
        if (match && match[1]) {
            stylesWithBackgrounds.push({
                element: el,
                backgroundSrc: match[1],
                isInline: true
            });
        }
    });
    
    // 处理所有背景图片替换
    stylesWithBackgrounds.forEach(item => {
        const replacedDataUrl = localStorage.getItem('replacedBackground_' + item.backgroundSrc);
        if (replacedDataUrl) {
            if (item.isInline) {
                const style = item.element.getAttribute('style');
                const newStyle = style.replace(
                    /background-image:\s*url\(['"]?([^'"]*?)['"]?\)/, 
                    `background-image: url('${replacedDataUrl}')`
                );
                item.element.setAttribute('style', newStyle);
            }
        }
    });
    
    // 特殊处理：主页横幅背景
    const mainBanner = document.querySelector('.main-banner');
    if (mainBanner) {
        const replacedBanner = localStorage.getItem('replacedBackground_assets/picture/banner-bg.jpg');
        if (replacedBanner) {
            mainBanner.style.backgroundImage = `url('${replacedBanner}')`;
        }
    }
}

// 自动替换页面上的视频
function replaceSiteVideos() {
    // 获取所有视频元素
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // 检查视频源
        const sources = video.querySelectorAll('source');
        if (sources.length > 0) {
            // 处理有source标签的视频
            sources.forEach(source => {
                const srcAttr = source.getAttribute('src');
                if (srcAttr) {
                    const replacedVideo = localStorage.getItem('replacedVideo_' + srcAttr);
                    if (replacedVideo) {
                        source.setAttribute('src', replacedVideo);
                        // 重新加载视频
                        video.load();
                    }
                }
            });
        } else {
            // 处理直接设置src的视频
            const srcAttr = video.getAttribute('src');
            if (srcAttr) {
                const replacedVideo = localStorage.getItem('replacedVideo_' + srcAttr);
                if (replacedVideo) {
                    video.setAttribute('src', replacedVideo);
                    // 重新加载视频
                    video.load();
                }
            }
        }
    });
    
    // 特殊处理：检查iframe中的视频
    const iframes = document.querySelectorAll('iframe[src*="video"]');
    iframes.forEach(iframe => {
        const srcAttr = iframe.getAttribute('src');
        if (srcAttr) {
            const replacedVideo = localStorage.getItem('replacedVideo_' + srcAttr);
            if (replacedVideo) {
                iframe.setAttribute('src', replacedVideo);
            }
        }
    });
}

// 自动替换页面上的媒体文件
function autoReplacePageMedia() {
    // 不在后台管理页面才执行自动替换
    if (!window.location.href.includes('admin/')) {
        // 更新替换的图片
        updateReplacedImages();
        
        // 更新替换的视频
        updateReplacedVideos();
        
        // 更新替换的背景图片
        updateReplacedBackgrounds();
        
        // 替换视频
        replaceSiteVideos();
    }
}

// 页面加载时自动替换媒体
document.addEventListener('DOMContentLoaded', function() {
    // 延迟一秒执行，确保页面中的所有媒体元素都已加载
    setTimeout(autoReplacePageMedia, 1000);
});

// 初始化替换图片相关处理程序
function initReplaceImageHandlers() {
    // 绑定图片文件选择预览
    const replaceImageFileInput = document.getElementById('replaceImageFile');
    if (replaceImageFileInput) {
        replaceImageFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.getElementById('replaceImagePreviewContainer');
                    const preview = document.getElementById('replaceImagePreview');
                    
                    preview.src = e.target.result;
                    previewContainer.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 绑定确认替换图片按钮
    const confirmReplaceImageBtn = document.getElementById('confirmReplaceImageBtn');
    if (confirmReplaceImageBtn) {
        confirmReplaceImageBtn.addEventListener('click', handleImageReplace);
    }
}

// 初始化替换视频相关处理程序
function initReplaceVideoHandlers() {
    // 绑定视频文件选择预览
    const replaceVideoFileInput = document.getElementById('replaceVideoFile');
    if (replaceVideoFileInput) {
        replaceVideoFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.getElementById('replaceVideoPreviewContainer');
                    const preview = document.getElementById('replaceVideoPreview');
                    
                    preview.src = e.target.result;
                    previewContainer.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 绑定确认替换视频按钮
    const confirmReplaceVideoBtn = document.getElementById('confirmReplaceVideoBtn');
    if (confirmReplaceVideoBtn) {
        confirmReplaceVideoBtn.addEventListener('click', handleVideoReplace);
    }
}

// 初始化替换背景图片相关处理程序
function initReplaceBackgroundHandlers() {
    // 绑定背景图片文件选择预览
    const replaceBackgroundFileInput = document.getElementById('replaceBackgroundFile');
    if (replaceBackgroundFileInput) {
        replaceBackgroundFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.getElementById('replaceBackgroundPreviewContainer');
                    const preview = document.getElementById('replaceBackgroundPreview');
                    
                    preview.src = e.target.result;
                    previewContainer.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 绑定确认替换背景图片按钮
    const confirmReplaceBackgroundBtn = document.getElementById('confirmReplaceBackgroundBtn');
    if (confirmReplaceBackgroundBtn) {
        confirmReplaceBackgroundBtn.addEventListener('click', handleBackgroundReplace);
    }
}

// 创建现有图片卡片
function createExistingImageCard(imgSrc) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    card.setAttribute('data-src', imgSrc);
    
    // 图片预览
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = imgSrc.startsWith('http') ? imgSrc : '../' + imgSrc;
    img.alt = imgSrc.split('/').pop();
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    
    // 图片加载失败时显示占位图
    img.onerror = function() {
        this.src = '../assets/picture/placeholder.jpg';
        this.onerror = null;
    };
    
    // 为远程图片添加标记
    if (imgSrc.startsWith('http')) {
        const remoteBadge = document.createElement('span');
        remoteBadge.className = 'favorite-badge';
        remoteBadge.textContent = '远程图片';
        card.appendChild(remoteBadge);
    }
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h5');
    title.className = 'card-title text-truncate';
    title.title = imgSrc;
    title.textContent = imgSrc.split('/').pop();
    
    const path = document.createElement('p');
    path.className = 'card-text';
    path.innerHTML = `<small class="text-muted">路径: ${imgSrc}</small>`;
    
    // 替换按钮
    const replaceBtn = document.createElement('button');
    replaceBtn.className = 'btn btn-primary btn-sm btn-block mt-3 mb-2';
    replaceBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 替换此图片';
    replaceBtn.setAttribute('data-toggle', 'modal');
    replaceBtn.setAttribute('data-target', '#replaceImageModal');
    replaceBtn.addEventListener('click', function() {
        // 设置当前选中的图片路径
        document.getElementById('currentImagePath').value = imgSrc;
        document.getElementById('currentImagePreview').src = imgSrc.startsWith('http') ? imgSrc : '../' + imgSrc;
        document.getElementById('currentImageName').textContent = imgSrc.split('/').pop();
    });
    
    // 组装卡片
    cardBody.appendChild(title);
    cardBody.appendChild(path);
    cardBody.appendChild(replaceBtn);
    
    card.appendChild(img);
    card.appendChild(cardBody);
    
    col.appendChild(card);
    
    return col;
}

// 创建现有视频卡片
function createExistingVideoCard(videoSrc) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.id = 'video-card-' + videoSrc.replace(/[^a-zA-Z0-9]/g, '-');
    col.setAttribute('data-src', videoSrc);
    
    // 创建视频预览
    const videoContainer = document.createElement('div');
    videoContainer.className = 'card shadow-sm';
    
    // 使用完整URL
    const videoUrl = videoSrc.startsWith('http') ? videoSrc : '../' + videoSrc;
    
    const videoEl = document.createElement('video');
    videoEl.className = 'card-img-top';
    videoEl.src = videoUrl;
    videoEl.controls = true;
    videoEl.muted = true;
    videoEl.style.height = '200px';
    videoEl.style.backgroundColor = '#000';
    videoEl.onerror = function() {
        this.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'text-center p-4 bg-dark text-white';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 视频加载失败';
        errorMsg.style.height = '200px';
        errorMsg.style.display = 'flex';
        errorMsg.style.alignItems = 'center';
        errorMsg.style.justifyContent = 'center';
        this.parentNode.insertBefore(errorMsg, this);
    };
    
    // 为远程视频添加标记
    if (videoSrc.startsWith('http')) {
        const remoteBadge = document.createElement('span');
        remoteBadge.className = 'favorite-badge';
        remoteBadge.textContent = '远程视频';
        videoContainer.appendChild(remoteBadge);
    }
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title text-truncate';
    cardTitle.innerText = videoSrc.split('/').pop();
    
    const cardText = document.createElement('p');
    cardText.className = 'card-text small text-muted';
    cardText.innerText = videoSrc.startsWith('http') ? '远程视频' : '本地视频';
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group w-100';
    
    const replaceBtn = document.createElement('button');
    replaceBtn.className = 'btn btn-sm btn-outline-primary';
    replaceBtn.innerText = '替换';
    replaceBtn.setAttribute('data-toggle', 'modal');
    replaceBtn.setAttribute('data-target', '#replaceVideoModal');
    replaceBtn.setAttribute('data-src', videoSrc);
    replaceBtn.addEventListener('click', function() {
        document.getElementById('currentVideoPath').value = videoSrc;
        const videoPreview = document.getElementById('currentVideoPreview');
        videoPreview.src = videoUrl;
        videoPreview.parentElement.classList.remove('d-none');
    });
    
    btnGroup.appendChild(replaceBtn);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(btnGroup);
    
    videoContainer.appendChild(videoEl);
    videoContainer.appendChild(cardBody);
    col.appendChild(videoContainer);
    
    return col;
}

// 创建现有背景图片卡片
function createExistingBackgroundCard(bgSrc) {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.id = 'background-card-' + bgSrc.replace(/[^a-zA-Z0-9]/g, '-');
    card.setAttribute('data-src', bgSrc);
    
    // 创建图片预览
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card shadow-sm';
    
    // 使用完整URL
    const imgUrl = bgSrc.startsWith('http') ? bgSrc : '../' + bgSrc;
    
    const imgEl = document.createElement('img');
    imgEl.className = 'card-img-top';
    imgEl.src = imgUrl;
    imgEl.alt = '背景图片';
    imgEl.style.height = '200px';
    imgEl.style.objectFit = 'cover';
    imgEl.onerror = function() {
        this.src = '../assets/picture/placeholder.jpg';
        this.onerror = null;
    };
    
    // 为远程背景图片添加标记
    if (bgSrc.startsWith('http')) {
        const remoteBadge = document.createElement('span');
        remoteBadge.className = 'favorite-badge';
        remoteBadge.textContent = '远程背景';
        imgContainer.appendChild(remoteBadge);
    }
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title text-truncate';
    cardTitle.innerText = bgSrc.split('/').pop();
    
    const cardText = document.createElement('p');
    cardText.className = 'card-text small text-muted';
    cardText.innerText = bgSrc.startsWith('http') ? '远程背景图片' : '本地背景图片';
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group w-100';
    
    const replaceBtn = document.createElement('button');
    replaceBtn.className = 'btn btn-sm btn-outline-primary';
    replaceBtn.innerText = '替换';
    replaceBtn.setAttribute('data-toggle', 'modal');
    replaceBtn.setAttribute('data-target', '#replaceBackgroundModal');
    replaceBtn.setAttribute('data-src', bgSrc);
    replaceBtn.addEventListener('click', function() {
        document.getElementById('currentBackgroundPath').value = bgSrc;
        document.getElementById('currentBackgroundPreview').src = imgUrl;
        document.getElementById('currentBackgroundPreview').parentElement.classList.remove('d-none');
    });
    
    btnGroup.appendChild(replaceBtn);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(btnGroup);
    
    imgContainer.appendChild(imgEl);
    imgContainer.appendChild(cardBody);
    card.appendChild(imgContainer);
    
    return card;
}
