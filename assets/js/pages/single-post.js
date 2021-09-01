jQuery(document).ready(function ($) {

    $(window).on('resize load', function () {
        var wind_width = $(window).innerWidth();
        var gk_social = $('.gk-social-buttons').innerWidth();
        var container_width = $('.container').innerWidth();
        var border = wind_width / 2 - container_width / 2;
        var left_pos = border - gk_social - 52;
        if (left_pos > 0) {
            $('.gk-social-buttons').css('left', left_pos);
        }
    });

    function check_share_position() {
        var block_share = jQuery('.gk-social-buttons');
        if (jQuery('.get_started_section').length) {
            var distance = jQuery('.get_started_section').offset().top;
        } else {
            var distance = jQuery('.list_of_post').offset().top;
        }
        if ((distance - block_share.offset().top) < 260) {
            block_share.addClass('hidden');
        } else {
            block_share.removeClass('hidden');
        }
    }

    $(window).scroll(function () {
        if (jQuery(window).width() > 1199) {
            check_share_position();
        }
    });

    /* Blog contents navigation */
    jQuery(document).on('click', '.post-table-contents a', function (e) {
        e.preventDefault();
        let href = $(this).attr('href'),
            positionMargin = 15,
            adminBar = ($('#wpadminbar').length) ? $('#wpadminbar').outerHeight() : 0,
            header = $('header').outerHeight(),
            el_Height = $(href).outerHeight(),
            outputHeight = 0,
            hrefMargins = parseInt($(href).css('marginTop').replace('px', '')) + parseInt($(href).css('marginBottom').replace('px', ''));

        if (el_Height > 50) {
            outputHeight = (el_Height + adminBar);
        } else {
            outputHeight = (el_Height + adminBar + header);
        }

        $('body, html').animate({
            scrollTop: $(href).offset().top - outputHeight
        }, 800);
    });

   /* let owl = $('#blog_list_of_post');
    if (owl.length) {
        owl.owlCarousel({
            loop: false,
            margin: 30,
            dots: false,
            nav: false,
            autoHeight: false,
            responsive: {
                0: {
                    items: 1,
                    autoHeight: true,
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
        });

        $('.nav_list_of_post .prev').click(function () {
            owl.trigger('prev.owl.carousel', [300]);
        });
    }*/

});