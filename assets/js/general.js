/**
 * Sammamish General JS
 */

var _wp_admin_bar = {
    show: ($('body').hasClass('logged-in')) ? true : false,
    margin: ($('body').hasClass('logged-in')) ? 32 : 0,
};
// custom top bar
(function () {
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined
    }

    const topBarFor = getCookie('top-bar-for');
    if (topBarFor && topBarFor.length) {
        jQuery.post('/sm-includes/top-bar.php', {
            path: location.pathname,
            'top-bar-for': topBarFor
        }, function (resp) {
            if (resp.hasOwnProperty('html') && resp.html.length) {
                jQuery('html').css('margin-top', '32px');
                jQuery('body').addClass('logged-in');
                jQuery('body').prepend(resp['html']);
                jQuery(document).trigger('topbar-loaded');
            }
        });
    }
})();


/**
 * custom elements sticky
 */
function resize_custom_sticky() {
    return init_custom_sticky();
}


/**
 * Init custom sticky elements
 * - search all sticky elements & prepare array of list
 */
function init_custom_sticky() {
    var sticky_options = [];

    $('[data-custom-sticky]').each(function () {
        var _temp_margin = (typeof $(this).attr('data-margin-top') != 'undefined' && $(this).attr('data-margin-top') != null) ? parseInt($(this).attr('data-margin-top')) : 0,
            _temp_margin_el = $('#header');

        var _sticky_options = {
            sticky_el: $(this),
            sticky_el_pos: $(this).offset().top,
            sticky_end_el: (typeof $(this).attr('data-end-sticky') != 'undefined' && $(this).attr('data-end-sticky') != null) ? $($(this).attr('data-end-sticky')) : 'footer',
            sticky_margin_el: _temp_margin_el,
            sticky_margin_top: _temp_margin,
            inactive_sizes: (typeof $(this).attr('data-inactive-sizes') != 'undefined' && $(this).attr('data-inactive-sizes') != null) ? JSON.parse($(this).attr('data-inactive-sizes')) : false,
            sticky_margin: _temp_margin_el.outerHeight() + _temp_margin + _wp_admin_bar.margin,
            sticky_wrap: (typeof $(this).attr('data-wrap') != 'undefined' && $(this).attr('data-wrap') != null) ? $($(this).attr('data-wrap')) : '',
            smoothScroll: (typeof $(this).attr('data-smooth-scroll') != 'undefined' && $(this).attr('data-smooth-scroll') != null) ? JSON.parse($(this).attr('data-smooth-scroll')) : false,
        };

        sticky_options.push(_sticky_options);
    });

    $(document).scroll(function () {
        update_custom_sticky($(this), sticky_options);
    });

    update_custom_sticky($(this), sticky_options);
}


/**
 * UI Kit input label animation. Moving label on top corner after focus or fill input
 */
$(document).on('keyup blur ', 'input, textarea, select', function () {
// only for text inputs
    if ($(this).not(':input[type=button], :input[type=submit], :input[type=reset]')) {
        let val = $.trim($(this).val());
        if (val.length > 0) {
            $(this).addClass('not-empty');
        } else {
            $(this).removeClass('not-empty');
        }
    }
});

/**
 * Activate sticky elements
 */
function update_custom_sticky($this, options) {
    $.each(options, function (key, obj) {
        var _wrapWidth = (obj.sticky_wrap != '') ? obj.sticky_wrap.innerWidth() - parseInt(obj.sticky_wrap.css('padding-left')) - parseInt(obj.sticky_wrap.css('padding-right')) : 350;
        var _width = obj.sticky_el.outerWidth();
        var _left = obj.sticky_el.offset().left;
        var _smoothScroll = obj.smoothScroll;
        var _realtime_margin_activity = (parseInt(obj.sticky_margin_el.css('top')) < 0) ? obj.sticky_margin_top : obj.sticky_margin;


        if (obj.inactive_sizes !== false) {
            if (window.innerWidth < parseInt(obj.inactive_sizes)) return;
        }

        // hide if active area is scroll end
        if ($this.scrollTop() > obj.sticky_end_el.offset().top - obj.sticky_end_el.outerHeight() - obj.sticky_el.outerHeight() + 20) {
            obj.sticky_el.fadeOut(50);
        } else {
            obj.sticky_el.fadeIn(50);
        }

        if ($this.scrollTop() >= (obj.sticky_el_pos - _realtime_margin_activity)) {

            if (!obj.sticky_el.hasClass('custom-sticky')) {
                obj.sticky_el.addClass('custom-sticky');
                obj.sticky_el.css('width', _width);

                if (_smoothScroll == true) {
                    obj.sticky_wrap.css('position', 'relative');
                    obj.sticky_wrap.css('padding-top', obj.sticky_el.outerHeight());
                }
                obj.sticky_el.css('left', _left);
            }


            obj.sticky_el.css('top', _realtime_margin_activity);
        } else {
            if (obj.sticky_el.hasClass('custom-sticky')) {
                obj.sticky_el.removeClass('custom-sticky');
                //obj.sticky_wrap.css('top', parseInt(obj.sticky_wrap.css('top')) - obj.sticky_el.outerHeight());
                obj.sticky_el.css('top', '');
                obj.sticky_el.css('left', '');
                obj.sticky_el.css('width', '');
                obj.sticky_wrap.css('padding-top', '');
            }
        }

    });
}


/**
 * Specific WP adminbar preload successfull event
 */
$(window).bind('topbar-loaded', function () {
    $('body').addClass('admin-bar');
});


jQuery(document).ready(function ($) {
    // select2
    init_selectbox();

    // UI kit
    init_ui_kit();

    // formatting fields mask
    init_maskinput();

    // elements autoheight
    autoheight();

    // custom sticky elemens
    init_custom_sticky();

    jQuery(document).on('gform_post_render', function (event, form_id, current_page) {
        init_maskinput();
    });


    /* auto-scroll to header */
    $(document).on('click', '#scroll-up', function (e) {
        e.preventDefault();
        $("html, body").animate({scrollTop: 0}, 600);
    });


    if (!Object.entries)
        Object.entries = function (obj) {
            var ownProps = Object.keys(obj),
                i = ownProps.length,
                resArray = new Array(i); // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];

            return resArray;
        };


    if (window.innerWidth < 820) {
        document.addEventListener('scroll', function (event) {
            let pos = $(window).scrollTop(),
                offset = $(window).height() / 1.44;
            if (pos > offset) {
                if (!$('#scroll-up').hasClass('active'))
                    $('#scroll-up').addClass('active');
            } else {
                if ($('#scroll-up').hasClass('active'))
                    $('#scroll-up').removeClass('active');
            }
        }, {passive: true});
    }


    function autoheight() {
        let items = $('.autoheight-item');

        if (items.hasClass('autoheight-mobile')) {
            if (window.innerWidth <= 767) return false;
        }

        let indent = (items.find('[data-indent-autoheight]').length) ? items.find('[data-indent-autoheight]').outerHeight() + parseFloat(items.find('[data-indent-autoheight]').css('marginTop')) : 0;
        let max_item_height = Math.max.apply(null, items.map(function () {
            return $(this).outerHeight();
        }).get());

        items.css('height', max_item_height + indent + 'px');
    }

    function init_maskinput() {
        var $maskinput = $('.phone-container input[type="text"], .phone-validate');
        if (typeof $maskinput.mask === 'function') {
            $maskinput.mask('(999) 999-9999', {
                showMaskOnFocus: true,
                showMaskOnHover: false,
                autoUnmask: true,
                clearMaskOnLostFocus: true
            });
        }

    }


    /**
     * Additional functions & helpers of  UI Kit
     */
    function init_ui_kit() {
        // stop click / link open for disabled buttons
        $(document).on('click', '.btn', function (e) {
            if ($(this).prop('disabled') == true || $(this).hasClass('btn-disabled')) {
                e.preventDefault();
            }
        });

        sm_tooltip();
    }


    function init_selectbox() {
        // Styling select only for table and large screen
        if (window.innerWidth > 820) {
            $('select:not(.no-js-styling)').select2({
                minimumResultsForSearch: -1,
            });
        }

        // Bind an event
        $(document).on('select2:open', function (e) {

            /**
             * Select2 scroll styling
             */
            $('.select2-results__options').niceScroll({
                cursorcolor: "rgba(100, 100, 100,.2)",
                autohidemode: false,
                bouncescroll: true,
                cursorwidth: "4px",
                cursorborder: "4px",
                grabcursorenabled: false,
                horizrailenabled: false,
                touchbehavior: true,
                preventmultitouchscrolling: false,
                cursordragontouch: true,
                railpadding: {top: 0, right: 2, left: 0, bottom: 0}, // set padding for rail bar
            });
        });
    }


    /* sticky  header */
    function add_back() {
        if ($(this).scrollTop() > 50) {
            $('header').addClass('with_back');
        } else if ($(this).scrollTop() < 50) {
            $('header').removeClass('with_back');
        }
    }

    jQuery('li.noclick > a').click(function (e) {
        e.preventDefault();
    });

    /* mob menu */
    function mob_menu_position() {
        var wind_width = $(window).outerWidth();
        var header_cont_width = $('header .container').outerWidth();
        $('.place-ment').css('right', 0);
    }


    /**
     * Validate forms
     * - css class ".custom-validate" for customize JS validate in another JS file
     */
    if (typeof $(".jquery-form-validate:not(.custom-validate)") != 'undefined' && $(".jquery-form-validate:not(.custom-validate)").length > 0) {
        $(".jquery-form-validate:not(.custom-validate)").validate();
    }


    /* animate scroll to el */
    var scrollToElement = function (el, ms, padding) {
        var speed = (ms) ? ms : 600,
            _padding = (typeof $('#header') != 'undefined' && $('#header') != null) ? $('#header').outerHeight() : 0;

        jQuery('html,body').animate({
            scrollTop: ($(el).offset().top - padding - _padding) - _wp_admin_bar.margin
        }, speed);
    }
    /* @endof - animate scroll to el */


    jQuery('.burg_menu').on('click', function (e) {
        e.preventDefault();
        jQuery('header .place-ment').addClass('active');
        jQuery('.menu_overflow').fadeIn(300);

        $("body").toggleClass("disable-scroll");
        $('header').toggleClass('menu__active');

        if ($('header').hasClass('menu__active')) {
        } else {
            hide_mobileMenu();
        }

        mob_menu_position();
    });


    /**
     * Target button (smooth scrolling)
     */
    jQuery(document).on('click', 'a.target-btn', function (e) {
        e.preventDefault();
        var btn_target = $(this).attr('href'),
            padding = (typeof ($(this).attr('data-padding')) != 'undefined' && $(this).attr('data-padding') != null) ? parseInt($(this).attr('data-padding')) : 0;
        scrollToElement(btn_target, 750, padding);
    });

    jQuery('.menu_overflow').on('click', function (e) {
        hide_mobileMenu();
    });

    function hide_mobileMenu() {
        jQuery('#header .place-ment').removeClass('active');

        // hide menu shadow
        jQuery('.menu_overflow').fadeOut(300);

        if ($(window).outerWidth() < 1200) {
            //$('.place-ment').css('right', '-500px');
            let t;
            t = setTimeout(function () {
                $("body").removeClass("disable-scroll");
                $("header").removeClass("menu__active");
                clearInterval(t);
            }, 300);
        }
    }

    jQuery('.place-ment .exit').on('click', function (e) {
        hide_mobileMenu();
    });

    jQuery('#header .place-ment .main_menu a').on('click', function () {
        hide_mobileMenu();
    });

    jQuery('#header .main_menu > li').on('mouseover', function () {
        // $('.searchform').removeClass('show');
    });

    if (jQuery(window).width() < 1200) {
        jQuery('#menu-main li.menu-item-has-children').each(function (index, el) {
            jQuery(el).find('.sub-menu').after('<span class="show_sub_menu"></span>');
        });

    }

    jQuery('body').on('click', '.show_sub_menu', function () {
        jQuery(this).parent().find('.sub-menu').slideToggle(0);
        jQuery(this).toggleClass('active');
    });
    /* mob menu **** */


    /* Quide home buying - page */
    jQuery('.cat_list_title').on('click', function () {
        jQuery(this).parent().find('.cat_posts_list').slideToggle(300);
        jQuery(this).parent().toggleClass('active');
    });

    if (jQuery('#main_content').hasClass('buing_quide_content')) {
        $current_link = location.href;
        jQuery('a[href*="' + $current_link + '"]').addClass('active').closest('.cat_list_item ').addClass('active');
    }
    /* Quide home buying */

    jQuery(document).mouseup(function (e) {
        // var container = $(".searchform");
        //
        // if (!container.is(e.target) && container.has(e.target).length === 0)
        //     container.removeClass('show');
    });

    jQuery(document).mouseup(function (e) {
        var container = $(".phoneform");
        var phoneform = $(".btn_menu_phone");
        if (!container.is(e.target) && container.has(e.target).length === 0 && !phoneform.is(e.target) && phoneform.has(e.target).length === 0) {
            container.removeClass('show');
            phoneform.removeClass('activ');
        }
    });

    /* Show main header search bar */
    $(document).on('click', '.btn_menu_search', function (e) {

        if (e.target.className === 'btn_menu_search') {

            jQuery(this).removeClass('active');
            jQuery('.searchform').removeClass('show');

            e.preventDefault();

        } else {

            jQuery(this).addClass('active');
            jQuery('.searchform').addClass('show');
            jQuery('.headerSearch').find('[type="search"]').focus();

        }

    });

    // jQuery(document).mouseup(function (e){
    //     var div = jQuery('.searchform');
    //     if (!div.is(e.target)
    //         && div.has(e.target).length === 0) {
    //         div.removeClass('show');
    //         $('.btn_menu_search').removeClass('active');
    //     }
    // });


    jQuery('.btn_menu_phone').click(function (e) {
        e.preventDefault();
        jQuery(this).toggleClass('activ');
        jQuery('.phoneform').toggleClass('show');
    });


    $(window).on('resize', function () {
        if ($(window).outerWidth() > 1200) {
            $('.place-ment.active').css('right', 0);
        }

        // custom sticky elemens
        resize_custom_sticky();
    });


    function table_responsive() {
        let $table = $('.inner-page table, #main_content table');
        $table.each(function (i) {
            let $thisTable = $(this),
                titleArr = [];
            $thisTable.find('tr:first-child').addClass('hidden-mobile');
            $thisTable.find('tr:first-child td').each(function (i) {
                let text = $(this).text();
                titleArr.push(text);
            });
            $thisTable.find('tr').each(function (i) {
                let $tr = $(this);
                $tr.find('td').each(function (index) {
                    let $td = $(this);
                    $td.attr('data-title', titleArr[index]);
                });
            });
        });
    }

    table_responsive();


    var $window = $(window),
        lastScrollTop = 0;

    function onScroll(e) {
        if (($(window).width() > 499) && ($(window).width() < 991)) {
            var top = $window.scrollTop();
            if (lastScrollTop > top) {
                $('#header').removeClass('bottom_min');
            } else if ((lastScrollTop < top) && ((top - lastScrollTop) > 15)) {
                $('#header').addClass('bottom_min');
            }
            lastScrollTop = top;
        }
    }

    $window.on('scroll', onScroll);

    $(window).on("orientationchange", function () {
        $('#header').removeClass('bottom_min');
    });


    /**
     * Search Header KeyUP
     * @input
     */
    var xhr = 0,
        xhr_timeout = 0;

    $('.headerSearch [type="search"]').on('input', function (e) {
        let $this = $(this),
            val = $this.val(),
            search;

        if (val.length > 2) {

            if (xhr) {
                xhr.abort();
                clearTimeout(xhr_timeout);
            }

            xhr_timeout = setTimeout(function () {
                xhr = $.ajax({
                    beforeSend: function () {

                        $('.searchClear').addClass('active');
                        $('.searchform__inner').addClass('preloader');
                        $('.searchAjax').html('');

                    },
                    data: {
                        action: 'header_search',
                        search: val,
                    },
                    dataType: 'json',
                    method: 'POST',
                    complete: function () {

                        $('.searchform__inner').removeClass('preloader');
                        xhr = 0;

                    },
                    success: function (response) {
                        $('.searchAjax').html(response.data.html);
                        $('.searchAjax').show();
                    },
                    url: window.sm_obj.ajaxurl,
                });
            }, 100);


        } else {


            if (xhr) {
                xhr.abort();
                clearTimeout(xhr_timeout);
            }
            $('.searchAjax').html('').hide();
            $('.searchform__inner').removeClass('preloader');
            $('.searchClear').removeClass('active');

        }

    })

    /**
     * Scroll Close Search Panel
     * @scroll
     */
    $(window).on('scroll', function () {

        const windowPosition = $(window).scrollTop();

        if (windowPosition > 0) {
            //xhr.abort();
            $('.searchform').removeClass('show');
            $('.btn_menu_search').removeClass('active');
            $('.searchAjax').hide();
            $('.searchform__inner').removeClass('preloader');
        }


    }).scroll();

    /**
     * Search Clear Input
     * @click
     */
    $(document).on('click', '.searchClear', function (e) {

        if (xhr) {
            xhr.abort();
        }
        e.preventDefault();

        $(this).parent().parent().parent().find('[type="search"]').val('');
        $('.searchAjax').html('');

        $(this).parent().removeClass('active');

        $('.searchAjax').hide();
        $('.searchform__inner').removeClass('preloader');


    });

    /**
     * Mouse Up Search
     * @mouseup
     */
    $(document).mouseup(function (e) {

        const $container = $('.searchform'),
            $btn = $('.btn_menu_search');

        if (!$container.is(e.target) && $container.has(e.target).length === 0) {

            $container.removeClass('show');
            $btn.removeClass('active');

        }

    });

    /**
     * Stiky News Letter Sidebar
     * @constructor
     */
    let NewsLetterStiky = function () {

        let h_s = $('.get_started_section').outerHeight(true),
            h_f = $('footer').outerHeight(true),
            h_sf = Number(h_s + h_f + 140);

        if ($('#bottom-newsletter-block').length) {
            h_sf = $(document).height() - $('#bottom-newsletter-block').offset().top + 140;
        }

        $('.widget__newsletter').sticky({
            topSpacing: 100,
            bottomSpacing: h_sf
        });

    }

    NewsLetterStiky();

    $(window).on('load resize', function () {
        NewsLetterStiky();
    });
    /**
     * End
     */

    /**
     * Form
     * @type {n}
     */
    var floatlabels = new FloatLabels('.widget__newsletter form, .widget__newsletter__bottom form', {
        // options go here
    });

    $(document).on('gform_post_render', function (ev, field, form) {

        var floatlabels = new FloatLabels('.widget__newsletter form, .widget__newsletter__bottom form', {
            // options go here
        });

        NewsLetterStiky();

    });
    /**
     * End
     */


    // $(document).on('change', '#input_3_8_3', function(e){
    //     var widget = parseFloat($('.widget__newsletter').offset().top - 1);
    //
    //     $(window).scrollTop(widget);
    //
    // });

    /**
     * Footer mobile menu toggle
     * */

    if (jQuery(window).width() < 992) {
        $('footer .title').on('click', function () {
            $(this).toggleClass('active');
            $(this).parent().find('.f_menu').slideToggle(200);
        });
    }
    /**
     * End
     */

});

// Restricts input for the set of matched elements to the given inputFilter function.
(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });

    };
}(jQuery));
