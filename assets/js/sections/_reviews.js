var $enable_sticky = true;
var sticky = null;

function init_sticky() {
    if (typeof (sticky) != 'undefined' && sticky != null)
        sticky.destroy();

    if (window.innerWidth <= 992) {
        $enable_sticky = false;
    }
    else {
        $enable_sticky = true;
        sticky = new Sticky('[data-sticky]', {});
    }
}

jQuery(document).ready(function ($) {
    init_sticky();


    $(window).on('resize', function(){
        init_sticky();
    });

    function more_reviews_html() {
        var reviews = $('.partners-container .partners-reviews .list');
        reviews.find('.reviews-item').removeClass('not-show');
        $('.partners-container').find('.show-more-container').remove();
    }

    $(document).on("click", '.show-more-container .btn', function () {
        $(this).attr("disabled", true);
        more_reviews_html();
    });
});