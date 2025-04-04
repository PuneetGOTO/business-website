// 只保留有用的标签页激活功能
function makeTabActive() {
    var url = window.location.href;
    var idx = url.indexOf("#");
    if (idx > -1) {
        var hash = url.substring(idx + 1);
        if (typeof hash != "undefined" && hash != "" && hash != "#") {
            jQuery('.nav-tabs li a').removeClass('active');
            jQuery('#' + hash).addClass('active');
            jQuery('.tab-pane').removeClass('active in show');
            jQuery('.nav-tabs li a[href=\'#' + hash + '\']').addClass('active');
        }
    }
};