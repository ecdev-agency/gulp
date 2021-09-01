jQuery(document).ready(function ($) {

    init_maskMoney();

    init_carusel();

    init_fancybox();

    $(window).resize(function () {
        init_carusel();
    });


    function init_fancybox() {
        $('[data-fancybox]').fancybox({
            youtube: {
                controls: 0,
                showinfo: 0
            },
            vimeo: {
                color: 'f00'
            }
        });
    }

    function init_maskMoney() {
        $('.home__financial__form__input--price').maskMoney({
            prefix: '$ ',
            allowNegative: false,
            thousands: ',',
            decimal: '.',
            affixesStay: true,
            selectAllOnFocus: true,
            precision: 0
        }).trigger('mask.maskMoney');
    }

    function init_carusel() {
        var guides = $('.home__archive__guides__list');
        var videos = $('.home__archive__videos__list');
        if (window.innerWidth < 768) {
            guides.owlCarousel({
                loop: false,
                margin: 30,
                nav: false,
                items: 1,
                center: true,
                responsive: {
                    0: {
                        items: 1,
                        center: true,
                    },
                    576: {
                        items: 2,
                        center: false,
                        margin: 10,
                    },
                }
            })

            videos.owlCarousel({
                loop: false,
                margin: 30,
                nav: false,
                center: true,
                items: 1,
                responsive: {
                    0: {
                        items: 1,
                        center: true,
                    },
                    576: {
                        items: 2,
                        center: false,
                    },
                }
            })
        } else {
            guides.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
            videos.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
            guides.find('.owl-stage-outer').children().unwrap();
            videos.find('.owl-stage-outer').children().unwrap();
        }
    }

    new TypeIt('#Ticker', {
        strings: summaries.titles,
        speed: 90,
        breakLines: false,
        loop: true,
        autoStart: false,
        nextStringDelay: [3000, 2000],
        cursorSpeed: 1000,
        loopDelay: 3000,
    }).go();

    new TypeIt('#Ticker-mob', {
        strings: summaries.titles,
        speed: 90,
        breakLines: false,
        loop: true,
        autoStart: false,
        nextStringDelay: [3000, 2000],
        cursorSpeed: 1000,
        loopDelay: 3000,
    }).go();

    jQuery('img.svg').each(function () {
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function (data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');
    });
});


/**
 * Simple RQT form actions
 */
$(document).on('click', '.home__financial__form input', function () {
    $(this).select();
});


// get location info
sm_get_user_geolocation();

let $location_area = $('.home__limits__state'),
    $loanlimits_area = $('.home__limits__list'),
    $loanlimits_dashboard = $('.home__limits__standard-limits');
/**
 * Any received location detection
 */
$(document).on('geolocation_received', function (e, geo_data) {
    page_set_user_geo_data(geo_data);
});


/**
 * Get location processing
 */
if (sm_user_geo_loading == false) {
    // get real location detection
    $location_area.addClass('preload-values');
    $loanlimits_area.find('.home__limits__item').addClass('preload-values').removeClass('loaded-values');
    $loanlimits_dashboard.addClass('preload-values').removeClass('loaded-values');

    if (getCookie('geolocation')) {
        page_set_user_geo_data(sm_get_user_geolocation());
    }
}


/**
 * Location detection response
 */
function page_set_user_geo_data(geo_data) {

    if (geo_data.hasOwnProperty('city') && geo_data.city
        && geo_data.hasOwnProperty('state') && geo_data.state
        && geo_data.hasOwnProperty('zip_code') && geo_data.zip_code) {

        // show location info
        $('#financial__form__zip').val(geo_data.zip_code);
        $('.home__limits__state-name').html(geo_data.city + ' (' + geo_data.statecode + ')');
        $('.home__limits__state-zip').html('Zip: ' + geo_data.zip_code);

        $location_area.removeClass('preload-values');

    }
}

