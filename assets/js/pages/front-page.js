jQuery(document).ready(function ($) {
    var checkWidth = $(document).width(),
        testimonialsSlider = $('#testimonialsSlider'),
        slider = $('#slider');

    function servicesSectionFix() {
            var heightArr = [];
            var item = $('.services__itemContent');
            item.each(function (i) {
                var height = $(this).outerHeight(true);
                heightArr.push(height);
            });
            var max = Math.max.apply(Math, heightArr);
            $('#servicesIcons').css("padding-top", max + "px");
            $('#servicesItemsWrap').css("margin-bottom", '-' + max + "px");
    }

    function panelSectionFix() {
        var checkWidth = $(document).width(),
            imgHeight = $('.panel__img').outerHeight(true),
            panelMargin = (checkWidth < 991 ? imgHeight - 50 : 0);
        $('.panel').css("margin-top", panelMargin + "px");
    }

    function buildWelcomeScreenSlider() {
        var checkWidth = $(document).width(),
         welcomeScreenSlider = $('#welcomeScreenSlider');
        if (checkWidth < 767 && !welcomeScreenSlider.hasClass('slick-initialized')) {
            welcomeScreenSlider.slick({
                dots: true,
                infinite: true,
                arrows: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: '60px',
                adaptiveHeight: true
            });
        } else if(welcomeScreenSlider.hasClass('slick-initialized')) {
            $('#welcomeScreenSlider').slick('unslick');
            welcomeScreenSlider.removeClass('slick-initialized');
        }
    }

    buildWelcomeScreenSlider();

    $(window).on("load resize", function (e) {
        servicesSectionFix();
        panelSectionFix();
    });

    servicesSectionFix();
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

    slider.slick({
        dots: false,
        infinite: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false
    });

    slider.on('afterChange', function () {
        var slideNumber = slider.find('.slick-current').attr("data-number");
        if (slideNumber) {
            $('#sliderCurrentStep').html(slideNumber + ' /');
        }
    });

    $(document).on('click', '.slider__navBtn', function (e) {
        e.preventDefault();
        var target = $(this).data('target');
        if (target === 'prev') {
            $('#slider').slick('slickPrev');
        } else {
            $('#slider').slick('slickNext');
        }
    });

    $('[data-fancybox]').fancybox({
        toolbar: false,
        smallBtn: true,
        iframe: {
            preload: false
        }
    })
});