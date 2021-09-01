jQuery(document).ready(function ($) {
    /* shadow header */
    function add_shadow() {
        var sticky = $('header'),
            scroll = $(window).scrollTop();
        if (scroll >= 10) sticky.addClass('with_shadow');
        else sticky.removeClass('with_shadow');
    }
    add_shadow();

    $(window).scroll(function () {
        add_shadow();
    });
});