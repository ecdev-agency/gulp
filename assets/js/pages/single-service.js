/*
jQuery(document).ready(function ($) {
    var testimonialsSlider = $('#testimonialsSlider');
    testimonialsSlider.slick({
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
        prevArrow: "<button type='button' class='slick__btn slick__btn-white slick__btn-prev'><i class='icon icon-arrow-right flex-center'></i></button>",
        nextArrow: "<button type='button' class='slick__btn slick__btn-white slick__btn-next'><i class='icon icon-arrow-right flex-center'></i></button>",
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    arrows: false,
                    dots: false
                }
            }
        ]
    });

    testimonialsSlider.on('afterChange', function () {
        var slideNumber = testimonialsSlider.find('.slick-current').attr("data-number");
        if (slideNumber) {
            $('#testimonialSliderCurrentStep').html(slideNumber + ' /');
        }
    });

    $(document).on('click', '.testimonialsSlider__navBtn', function (e) {
        e.preventDefault();
        var target = $(this).data('target');
        if (target === 'prev') {
            $('#testimonialsSlider').slick('slickPrev');
        } else {
            $('#testimonialsSlider').slick('slickNext');
        }
    });
});
*/