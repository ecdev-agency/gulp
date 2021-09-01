jQuery(document).ready(function ($) {


    function fixElementHeight(selector) {
        let heightArr = [],
            $item = $(selector);
        $item.css("min-height", "1px");
        $item.each(function (i) {
            let height = $(this).outerHeight(true);
            heightArr.push(height);
        });
        let max = Math.max.apply(Math, heightArr);
        $item.css("min-height", max + "px");
    }

    let $interesedArticles = $('.interested-articles');
    $interesedArticles.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        prevArrow: '<button type="button" class="slick-prev"></button>',
        nextArrow: '<button type="button" class="slick-next"></button>',
        autoplay: false,
        infinite: false,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    centerMode: false, /* set centerMode to false to show complete slide instead of 3 */
                    slidesToScroll: 1,
                    arrows: true,
                    dots: false
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: false, /* set centerMode to false to show complete slide instead of 3 */
                    slidesToScroll: 1,
                    arrows: true,
                    dots: false,
                    autoHeight: true,
                }
            },
        ],
    });

    $interesedArticles.on('afterChange', function (event, slick, currentSlide, nextSlide) {
        fixElementHeight('.latest_post_item');
    });

    fixElementHeight('.latest_post_item');

});