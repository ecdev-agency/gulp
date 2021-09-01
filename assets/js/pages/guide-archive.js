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

    const $guidesSlider = $('#guidesSlider');
    $guidesSlider.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        autoplay: false,
        infinite: false,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
            },
        ],
    });

    const $prevBtn = $('.guidesList__button-prev'),
        $nextBtn = $('.guidesList__button-next');

    $(document).on('click', '.guidesList__button', function (e) {
        const $this = $(this);
        if ($this.hasClass('guidesList__button-next')) {
            $guidesSlider.slick('slickNext');
        } else {
            $guidesSlider.slick('slickPrev');
        }
    });

    $guidesSlider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
        if ($guidesSlider.find('.slick-slide:last-child').hasClass('slick-active')) {
            $nextBtn.addClass('disabled');
        } else {
            $nextBtn.removeClass('disabled');
        }
        if ($guidesSlider.find('.slick-slide:first-child').hasClass('slick-active')) {
            $prevBtn.addClass('disabled');
        } else {
            $prevBtn.removeClass('disabled');
        }
    });

    $(window).on('load resize', function (e) {
        const checkWidth = $(document).width();
        if (checkWidth > 767) {
            fixElementHeight('.slick-slider .guidesSlider__content');
        }
    });

    const guideSearchInput = $('#guideSearch'),
        formSearchClear = $('.formSearch__clear');

    guideSearchInput.on('input', function (e) {
        const $this = $(this),
            // val = $this.val().replace(/\s+/g, " ");
            val = $this.val().replace(/^\s+|\s+$/g, " ").trimStart();
        this.value = val;

        if (val.length >= 3) {
            formSearchClear.removeClass('formSearch__clear-hide');
        } else {
            formSearchClear.addClass('formSearch__clear-hide');
        }
    });
    formSearchClear.on('click', function (e) {
        guideSearchInput.val('');
        $(this).addClass('formSearch__clear-hide');
    });


    guideSearchInput.focusin(
        function(){
            $(this).parent().addClass('formSearch-active');
        }).focusout(
        function(){
            $(this).parent().removeClass('formSearch-active');
        });
});
