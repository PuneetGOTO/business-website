/**
 * 比赛预览功能
 * 用于后台编辑比赛信息时实时预览前端展示效果
 */

$(document).ready(function() {
    // 初始化预览
    initMatchPreview();
    
    // 绑定输入事件
    $('.match-input').on('input', function() {
        updateMatchPreview();
    });
    
    // 预览风格切换
    $('input[name="previewStyle"]').on('change', function() {
        const style = $(this).val();
        updatePreviewStyle(style);
    });
});

/**
 * 初始化比赛预览
 */
function initMatchPreview() {
    // 初始化预览内容
    updateMatchPreview();
    
    // 设置初始预览风格
    updatePreviewStyle($('input[name="previewStyle"]:checked').val());
}

/**
 * 更新比赛预览内容
 */
function updateMatchPreview() {
    // 更新标题
    const matchesTitle = $('#upcomingMatchesTitle').val() || '即将举行的比赛';
    $('#previewMatchesTitle').text(matchesTitle);
    
    // 更新队伍信息
    $('#previewTeams').html($('#match1Teams').val() || 'Team A vs. Team B');
    
    // 更新比赛名称
    $('#previewMatchName').text($('#match1Name').val() || '比赛名称');
    
    // 更新日期和时间
    $('#previewMatchDate').text($('#match1Date').val() || '比赛日期');
    $('#previewMatchTime').text($('#match1Time').val() || '比赛时间');
    
    // 更新分组和玩家数
    $('#previewMatchGroups').text($('#match1Groups').val() || '分组');
    $('#previewMatchPlayers').text($('#match1Players').val() || '玩家数');
    
    // 更新奖池信息
    $('#previewMatchPrizeLabel').text(($('#match1PrizeLabel').val() || '奖池') + ':');
    $('#previewMatchPrize').text($('#match1Prize').val() || '奖金');
    
    // 更新队伍Logo
    if ($('#match1Team1Logo').val()) {
        $('#previewTeam1Logo').attr('src', $('#match1Team1Logo').val());
    }
    
    if ($('#match1Team2Logo').val()) {
        $('#previewTeam2Logo').attr('src', $('#match1Team2Logo').val());
    }
}

/**
 * 更新预览风格
 * @param {string} style - 预览风格类型: modern/classic
 */
function updatePreviewStyle(style) {
    const previewContainer = $('#matchPreviewContainer');
    
    if (style === 'modern') {
        // 现代卡片式样式
        previewContainer.removeClass('bg-light text-dark').addClass('bg-dark text-white');
        $('.match-preview-card').css({
            'background-color': '#1e2124',
            'border-radius': '8px',
            'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.2)'
        });
        $('#previewMatchName').removeClass('text-dark').addClass('text-white');
    } else {
        // 经典表单式样式
        previewContainer.removeClass('bg-dark text-white').addClass('bg-light text-dark');
        $('.match-preview-card').css({
            'background-color': '#f8f9fa',
            'border-radius': '0',
            'box-shadow': 'none'
        });
        $('#previewMatchName').removeClass('text-white').addClass('text-dark');
    }
}

/**
 * 打开媒体库选择图片
 * @param {string} targetInput - 目标输入框ID
 */
function openMediaLibrary(targetInput) {
    // 保存目标输入框ID供选择后使用
    sessionStorage.setItem('currentMediaTarget', targetInput);
    
    // 显示媒体库模态窗口
    $('#mediaLibraryModal').modal('show');
    
    // 加载媒体库内容
    loadMediaLibrary();
}

/**
 * 加载媒体库内容
 */
function loadMediaLibrary() {
    // 这里应该调用媒体管理器的函数加载已上传的图片
    // 此处依赖于media-manager.js中的功能
    if (typeof loadMediaGalleryForSelection === 'function') {
        loadMediaGalleryForSelection();
    }
}
