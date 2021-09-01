jQuery(document).ready(function ($) {

    var owl = $('.interested-articles');
    owl.owlCarousel({
        loop: true,
        margin: 30,
        dots: false,
        nav: false,
        autoHeight: false,
        responsive: {
            0: {
                items: 1,
                autoHeight: true,
                margin: 0,
            },
            600: {
                items: 2,
                autoHeight: true,
            },

            1000: {
                items: 3
            }
        }
    });
    $('.slider-controls .next').click(function () {
        owl.trigger('next.owl.carousel');
    })
// Go to the previous item
    $('.slider-controls .prev').click(function () {
        // With optional speed parameter
        // Parameters has to be in square bracket '[]'
        owl.trigger('prev.owl.carousel', [300]);
    })
});