jQuery(document).ready(function ($) {
    $('[data-fancybox="images"]').fancybox({
        afterLoad : function(instance, current) {
            var pixelRatio = window.devicePixelRatio || 1;
            if ( pixelRatio > 1.5 ) {
                current.width  = current.width  / pixelRatio;
                current.height = current.height / pixelRatio;
            }
        }
    });

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

    function fixElementHeight(selector) {
        let heightArr = [],
            $item = $(selector);
        $item.css("min-height",   "1px");
        $item.each(function (i) {
            let height = $(this).outerHeight(true);
            heightArr.push(height);
        });
        let max = Math.max.apply(Math, heightArr);
        $item.css("min-height", max + "px");
    }

    $(window).on("load resize", function (e) {
        fixElementHeight('#latest_blog_posts_section .post-title');
    });
});