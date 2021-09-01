jQuery(document).ready(function ($) {

    var owl = $('#blog_list_of_post');
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
    $('.nav_list_of_post .next').click(function () {
        owl.trigger('next.owl.carousel');
    })
// Go to the previous item
    $('.nav_list_of_post .prev').click(function () {
        // With optional speed parameter
        // Parameters has to be in square bracket '[]'
        owl.trigger('prev.owl.carousel', [300]);
    })
});