jQuery(document).ready(function ($) {

    var owl = $('.items.owl-carousel');
    owl.owlCarousel({
        loop: false,
        margin: 20,
        nav: true,
        dosts: false,
        responsive: {
            0: {
                items: 1
            },
            450: {
                items: 2
            },
            767: {
                items: 3
            },
            1000: {
                items: 5
            }
        }
    });

// Go to the next item
    $('#all .customNextBtn').click(function () {
        owl.trigger('next.owl.carousel');
    });
// Go to the previous item
    $('#all .customPrevBtn').click(function () {
        // With optional speed parameter
        // Parameters has to be in square bracket '[]'
        owl.trigger('prev.owl.carousel', [300]);
    });


    setTimeout(function () {
        $('[data-fancybox]').fancybox({
            youtube: {
                controls: 1,
                showinfo: 1
            },
            vimeo: {
                color: 'f00'
            }
        });
    }, 500);


    $('ul.video_category li').on('click', function () {
        if (!$(this).hasClass('active')) {
            $('ul.video_category li').removeClass('active');
            var cat = $(this).addClass('active').data('cat');

            $('html, body').animate({
                scrollTop: $('div#' + cat).offset().top - 170
            }, {
                duration: 400,
                easing: "linear"
            });
        }
        return false;
    });

    function init_scroll() {
        $(".all_list").customScrollbar({
            skin: "default-skin",
            hScroll: false,
            updateOnWindowResize: true,
        });
    }

    /* category filter */

    let list_count = $('.all_list .item').length;
    jQuery('.cat_filter .open').on('click', function () {
        if (jQuery(this).hasClass('active')) {
            jQuery(this).removeClass('active');
            jQuery('.cat_filter .cat_list').slideUp(300);
        } else {
            jQuery(this).addClass('active');
            jQuery('.cat_filter .cat_list').slideDown(300);
            if(list_count > 8){ init_scroll();}
        }
    });

    $('.search_list input').keyup((e) => {
        var s = e.currentTarget.value;
        s = s.toLowerCase();
        if (s.length > 0) {
            $(".all_list .item").slideUp(50);
            $(".all_list [data-s^='" + s + "']").slideDown(50);
        }
        else {
            $(".all_list .item").slideDown(50);
        }
        if(list_count > 8){ init_scroll();}
    });

    jQuery('.all_list .item').on('click', function (e) {
        e.preventDefault();
        jQuery('.cat_filter .name').text(jQuery(this).data('name'));
        jQuery('.cat_filter .open').removeClass('active');
        jQuery('.cat_filter .cat_list').slideUp(300);
        let cat = jQuery(this).data('id');
        $('html, body').animate({
            scrollTop: $('div#' + cat).offset().top - 170
        }, {
            duration: 400,
            easing: "linear"
        });

    });

});
