jQuery(document).ready(function ($) {

    if (window.innerWidth >= 768) {
        autoheight_posttitle();
    }

    function autoheight_posttitle() {
        let items = $('#latest_blog_posts_section .post-title');
        let max_item_height = Math.max.apply(null, items.map(function () {
            return $(this).outerHeight();
        }).get());


        items.css('height', max_item_height + 'px');
    }

    /* iFrameResize({ log: true }, '#mrct'); */

    $('#testimonials_slider').owlCarousel({
        loop:true,
        margin:0,
        responsiveClass:true,
        items: 1,
        navigation: false,
        slideSpeed: 1200,
        paginationSpeed: 1200,
        smartSpeed: 310,
        responsive:{
            767:{
                items:1,
            },
        }
    });

});
