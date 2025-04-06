/**
 * 轮播功能辅助脚本
 * 用于支持网站上的轮播内容
 */
(function($) {
    'use strict';
    
    // 等待文档加载完成
    $(document).ready(function() {
        console.log('slide.js 已加载');
        
        // 初始化轮播组件（如果页面上有自定义轮播的话）
        initializeSliders();
    });
    
    /**
     * 初始化所有轮播组件
     */
    function initializeSliders() {
        // 检查是否页面上有轮播组件
        if ($('.custom-slider').length > 0) {
            $('.custom-slider').each(function() {
                setupSlider($(this));
            });
        }
    }
    
    /**
     * 设置单个轮播组件
     * @param {Object} slider - jQuery轮播元素
     */
    function setupSlider(slider) {
        // 轮播配置
        var config = {
            autoplay: slider.data('autoplay') !== undefined ? slider.data('autoplay') : true,
            dots: slider.data('dots') !== undefined ? slider.data('dots') : true,
            arrows: slider.data('arrows') !== undefined ? slider.data('arrows') : true,
            speed: slider.data('speed') || 500,
            slidesToShow: slider.data('slides-to-show') || 1
        };
        
        // 使用配置初始化轮播
        if ($.fn.slick) {
            slider.slick(config);
        } else {
            console.log('Slick轮播库未加载，使用Owl Carousel作为备选');
            // 如果没有slick，尝试使用owl carousel
            if ($.fn.owlCarousel) {
                var owlConfig = {
                    items: config.slidesToShow,
                    autoplay: config.autoplay,
                    dots: config.dots,
                    nav: config.arrows,
                    autoplaySpeed: config.speed
                };
                slider.owlCarousel(owlConfig);
            }
        }
    }
    
})(jQuery);
