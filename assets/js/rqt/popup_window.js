/**
 * RQT create popup
 */
if ($('.rqt-modal').length == 0) {
    $("   <!-- RQT custom popup window -->\n" +
        "    <div class=\"rqt-modal\" id=\"rqt_popup\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\"\n" +
        "         aria-hidden=\"true\">\n" +
        "        <div class=\"modal-dialog\" role=\"document\">\n" +
        "            <div class=\"modal-content\" id=\"rqt_popup_content\">\n" +
        "            </div>\n" +
        "               <div class=\"form-err-msg\"></div>\n" +
        "        </div>\n" +
        "    </div>\n<!-- @endof - RQT custom popup window -->"
    ).insertBefore("body > header");
    // console.log('RQT modal init successfully.');
}


/**
 * RQT popup modal close
 */
$(document).on('click', '.rqt-modal .modal-close', function (e) {
    popup_close($(this).parents('.rqt-modal'));
});


function popup_close(popup) {
    var modal = $('#' + popup.attr('id'));

    if (modal) {
        modal.toggleClass('show');
        if (!modal.hasClass('show')) {

        }
        $('body').toggleClass('modal-overflow');
    }
}


function popup_after_show(popup) {

    // click outside popup
    $(document).on('mousedown', function (e) {
        var el = '.rqt-modal';
        if (jQuery(e.target).closest(el).length) return;
        if ($('.rqt-modal').hasClass('show')) {
            popup_close(popup);
        }
    });

}


function popup_scroll_init(popup) {

    $(popup).niceScroll({
        cursorcolor: "rgba(100, 100, 100,.2)",
        autohidemode: true,
        bouncescroll: true,
        cursorwidth: "4px",
        cursorborder: "0",
        grabcursorenabled: false,
        horizrailenabled: false,
        touchbehavior: true,
        preventmultitouchscrolling: false,
        cursordragontouch: true,
        railpadding: {top: 2, right: 2, left: 0, bottom: 0}, // set padding for rail bar
    });
}

function popup_get_content(action, params, popup) {
    var content = popup.find('.modal-content');

    var request = $.get(rqt_vars._rqt_router, {
        referrer: 'wp',
        action: 'get_popup',
        value: action,
        params: params
    }, function (res) {
        content.html($.base64.decode(res));
        popup_after_content_load(popup);
    })
        .done(function () {
            // second success
        })
        .fail(function () {
            $('body').toggleClass('modal-overflow loading');
            alert("Sorry, data not loaded. Please repeat this request.");

        })
        .always(function () {
            // finished
        });
}


function popup_after_content_load(popup) {
    $('body').toggleClass('loading');
    popup.toggleClass('show');

    // show always top
    $(popup).scrollTop(0);

    $('.phone-validate').mask('(999) 999-9999', {
        showMaskOnFocus: true,
        showMaskOnHover: false,
        autoUnmask: true,
        clearMaskOnLostFocus: true
    });


    popup_scroll_init(popup);
}



/**
 * RQT popup form submit
 */
$(document).on('submit', '.rate_tracker__fancybox form', function (e) {
    e.preventDefault();
    var _this = $(this),
        popup = _this,
        content = popup.find('.modal-content'),
        action = _this.attr('action'),
        method_type = (_this.attr('method')) ? _this.attr('method') : 'POST',
        show_err_msg = true,
        formData = new FormData(_this[0]);

    if (action) {
        // Add advanced params
        formData.append("action", "popup_form_submit");
        formData.append("value", action);
        formData.append("referrer", 'wp');

        popup.addClass('loading');

        $.ajax({
            url: rqt_vars._rqt_router,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (result) {
                console.dir(result);
                _this.find('.mdl-js-textfield .is-invalid').removeClass('is-invalid');

                if (typeof result.errors != 'undefined') {
                    if (typeof result.errors == 'string') {
                        // error message global
                        if ($('.form-validation-message').length) {
                            $('.form-validation-message .label').text(result.errors);
                        } else {
                            $('<span class="form-validation-message mdl-cell mdl-list__item-secondary-content"><span class="label">' + result.errors + '</span></span>').insertBefore(_this);
                        }

                        $(popup).scrollTop(0);
                    } else {
                        _this.find('.form-err-msg').remove();

                        $.each(result.errors, function (key, val) {
                            // about one field
                            let err_field = _this.find('input[name="' + key + '"]').parent();
                            let dyn_msg_key = Object.keys(val)[0];

                            if (typeof val.group_message != 'undefined') {
                                // about group fields
                                err_field.parent().addClass('is-invalid');
                                $('<div class="form-err-msg">' + val[dyn_msg_key] + '</div>').insertAfter(err_field.parent());
                            } else {

                                err_field.addClass('is-invalid');
                                if (show_err_msg == true) {
                                    $('<div class="form-err-msg">' + val[dyn_msg_key] + '</div>').insertAfter(err_field);
                                }
                            }


                        });

                        check_press_input();
                    }
                } else {
                    // success result form
                    content.html($.base64.decode(result));

                    $('.rateTrackerContent').addClass('hide');
                    $('.rateTrackerMessage').addClass('show');

                }
            }
        })
            .fail(function () {
                //$('body').toggleClass('modal-overflow loading');
                alert("Sorry, data not loaded. Please repeat this request.");

            })
            .always(function () {
                popup.removeClass('loading');


            });

    } else {
        alert('This form not have default action');
    }


    function check_press_input() {
        $(document).on('keypress change', '.rqt-modal.show input', function (e) {
            let _form = $(this).parents('form');

            $(this).parents('.mdl-js-textfield').removeClass('is-invalid');

            $(this).parent().next('.form-err-msg').remove();

            $(this).parent().parent().removeClass('is-invalid');

            $(this).parent().parent().next('.form-err-msg').remove();
        });
    }

});


/**
 * RQT show popup
 */
$(document).on('click', '[data-modal]:not(:disabled):not(.btn-disabled)', function (e) {

    var id = $(this).attr('data-modal-id'),
        modalTop = $('#header').outerHeight() + 20,
        params = (typeof $(this).attr('data-params') != 'undefined' && $(this).attr('data-params').length > 0) ? $(this).attr('data-params') : '',
        action = (typeof $(this).attr('data-action') != 'undefined' && $(this).attr('data-action').length > 0) ? $(this).attr('data-action') : '';

    // create popup
    if (typeof id != 'undefined' && id.length) {
        var _popup = $('.rqt-modal').attr('id', id);

        // reset previous popup style size
        _popup.css('height', '');
        _popup.css('left', '');

        var _popupHeight = parseInt(_popup.css('height')),
            _popupWidth = parseInt(_popup.css('width')),
            _popupMaxHeight = parseInt(_popup.css('maxHeight')),
            _popupMaxWidth = parseInt(_popup.css('maxWidth')),
            _popupMobileOptHeight = $(window).outerHeight() - 30,
            _popupDefaultOptHeight = $(window).outerHeight() - 75,
            _screenViewArea = ($(window).outerHeight() - modalTop) - _popupHeight;
    }

    // before show popup
    if (!_popup || _popup == null) return;

    // auto-align and centered response popup
    if (((window.innerWidth - 30) - (_popupWidth)) > 20) {
        _popup.css('left', '');
    } else {
        _popup.css('left', '15px');
    }

    // show popup for specific screen size (mobile,tablet, etc..)  || _screenViewArea < 15
    if (window.innerWidth <= 820) {
        _popup.css('top', '15px');
        _popup.css('height', _popupMobileOptHeight);
    } else {
        // window height and position
        if (_popupHeight < _popupDefaultOptHeight) {
            // set popup height from css
            _popup.css('top', modalTop);
            _popup.css('height', _popupHeight + ' !important');
        } else {
            // set adaptive
            _popup.css('top', '45px');
            _popup.css('height', _popupDefaultOptHeight);
        }
    }

    // loading popup content
    if (action != null)
        popup_get_content(action, params, _popup);


    // add shadow block outside click
    $('body').toggleClass('modal-overflow loading');
    popup_after_show(_popup);
    e.preventDefault();
});


// if realtime resize RQT popup (update popup activity)
$(window).resize(function () {
    var _popup = ($('.rqt-modal').hasClass('show')) ? $('.rqt-modal.show') : null,
        modalTop = $('#header').outerHeight() + 20;

    if (_popup != null) {
        // console.log('popup resize');

        var _popupHeight = parseInt(_popup.css('height')),
            _popupWidth = parseInt(_popup.css('width')),
            _popupMaxHeight = parseInt(_popup.css('maxHeight')),
            _popupMaxWidth = parseInt(_popup.css('maxWidth')),
            _popupMobileOptHeight = $(window).outerHeight() - 30,
            _popupDefaultOptHeight = $(window).outerHeight() - 75,
            _screenViewArea = ($(window).outerHeight() - modalTop) - _popupHeight;

        // auto-align and centered response popup
        if (((window.innerWidth - 30) - (_popupWidth)) > 20) {
            _popup.css('left', '');
        } else {
            _popup.css('left', '15px');
        }
        // console.log('screen width: ' + (window.innerWidth - 40) + ' | popup width: ' + _popupWidth);
        //console.log('w: ' + $(window).outerHeight() + ', m'+modalTop +', ' +_screenViewArea);

        // show popup for specific screen size (mobile,tablet, etc..) || (window.innerWidth > 820 && _screenViewArea < 15)
        if (window.innerWidth <= 820) {
            _popup.css('top', '15px');
            _popup.css('height', _popupMobileOptHeight);
        } else {
            _popup.css('height', '');

            // window height and position
            if (_popupHeight < _popupDefaultOptHeight) {
                // set popup height from css
                _popup.css('top', modalTop);
                _popup.css('height', _popupHeight + ' !important');
            } else {
                // set adaptive
                _popup.css('top', '45px');
                _popup.css('height', _popupDefaultOptHeight);
            }

            // popup scroll inside
            popup_scroll_init(_popup);

        }
    }
});


/*******************************************************************************************************
 * Redesign Form Rate Tracker
 * 10.08.2021
 * @author Alex Cherniy
 * @since 1.0.0
 */
jQuery(document).ready(function ($) {

    /**
     * Tracker Modal
     * @function
     */
    let createModalTracker = function () {

        /**
         * Rate Tracker Modal
         * @fancybox v3
         */
        $('[data-fancybox="rate-tracker"]').fancybox({
            loop        : false,
            toolbar     : false,
            infobar     : false,
            toolbar     : false,
            hash        : null,
            slideShow   : false,
            modal       : false,
            arrows      : false,
            touch       : false,
            baseTpl     :
                '<div class="fancybox-container rate_tracker__fancybox" role="dialog" tabindex="-1">' +
                '<div class="fancybox-bg"></div>' +
                '<div class="fancybox-inner">' +
                '<div class="fancybox-stage"></div>' +
                '</div>' +
                '</div>',
            afterShow   : function (instance, current) {

                /**
                 * Set Focus Input First Name
                 */
                $('.rate_tracker__fancybox [name="first_name"]').focus();

                const zip_code = $('input[name="zip_code"]').val(),
                    loan_purpose = $('[name="loan_purpose_trigger"]:checked + label').text(),
                    credit_score = $('select[name="credit_score"]').val(),
                    property_type = $('select[name="property_type"] option:selected').text(),
                    occupancy = $('select[name="occupancy"] option:selected').text(),
                    purchase_price = $('input[name="purchase_price"]').val(),
                    down_payment_amt = $('input[name="down_payment_amt"]').val(),
                    loan_type = $('[name="loan_type"]').val(),
                    down_payment_pct = $('input[name="down_payment_pct"]').val();

                $('[data-tracker-zip-code]').addClass('done').text(zip_code);
                $('[data-tracker-loan-purpose]').addClass('done').text(loan_purpose);
                $('[data-tracker-credit-score]').addClass('done').text(credit_score);
                $('[data-tracker-property-type]').addClass('done').text(property_type);
                $('[data-tracker-occupancy]').addClass('done').text(occupancy);
                $('[data-tracker-purchase-price]').addClass('done').text(purchase_price);
                $('[data-tracker-loan-type]').addClass('done').val(loan_type);
                $('[data-tracker-down-payment]').addClass('done').text(down_payment_amt + '  |  ' + down_payment_pct);


                /**
                 * Form Float labels
                 * @type {n}
                 */
                var floatlabels = new FloatLabels( '.rate_tracker__fancybox form', {
                    // options go here,
                });

                /**
                 * Sticky Header Container
                 */
                $('.fancybox-slide').on('scroll',function(){
                    var $rHeader            = $('.rate_tracker__header_sticky'),
                        $sticky             = $('.rate_tracker__header'),
                        $fancybox_slide     = $('.fancybox-slide'),
                        position            = Number(($rHeader.offset().top - $('.fancybox-slide').offset().top));

                    if( position > 0 ) {
                        $sticky.removeClass('sticky');
                    }else{
                        $sticky.addClass('sticky');
                    }
                })


                $(".track_rates_form_validate").validate({
                    errorElement: 'span',
                    wrapper: 'div',
                    errorPlacement: function(error, element) {
                        error.appendTo( element.parent() );
                        //element.parent().addClass('error');
                    },
                    success: function(label) {
                        //console.dir(label);
                        //label.parent().parent().removeClass('error');
                    },
                });

        },
            beforeShow   : function (instance, current) {

                /**
                 * Remove Sticky
                 */
                $('.rate_tracker__header').removeClass('sticky');

                /**
                 * Content Success Message
                 */
                $('.rateTrackerContent').removeClass('hide');
                $('.rateTrackerMessage').removeClass('show');
            }
    });


    };
    createModalTracker();



    /**
     * Trigger After Update Rates Form
     */
    $(document.body).on('updated_rates', function () {
            createModalTracker();
    });

    /**
     * Select 2
     */
    $('.rate_tracker__hours').select2({
        minimumResultsForSearch: -1,
        dropdownParent: '#rate_tracker',
    });

    /**
     * Tippy Back
     */
    const tippyBack = tippy('[data-tippy-back]', {
        appendTo: function appendTo() {
            return document.querySelector('#rate_tracker');
        },
        content: 'Back',
        placement: 'bottom',
        offset: function offset(reference) {
            return [0, 4];
        },
    });

    /**
     * Tippy Submit
     */
    const tippySubmit = tippy('[data-tippy-submit]', {
        appendTo: function appendTo() {
            return document.querySelector('.fancybox-slide');
        },
        maxWidth: 220,
        content: 'Subscribe to the offers exclusively made for you',
        placement: 'top',
        followCursor: true,
    });

    /**
     * Show Text Modal
     * Terms & Conditions and Privacy Policy
     * @click
     */
    $(document).on('click', '.ModalTermsConditions', function (e) {

        /**
         * Remove Sticky Header
         */
        $('.rate_tracker__header').removeClass('sticky');

        /**
         * const
         * @type {*|jQuery}
         */
        const type = $(this).data('type');

        $('.rate_tracker__fancybox').addClass('policy_active');
        $('.rate_tracker__policy').addClass(type);

        e.preventDefault();

    });

    /**
     * Hide Text Modal
     * Terms & Conditions and Privacy Policy
     * @click
     */
    $(document).on('click', '.hideTermsContent', function (e) {

        /**
         * Remove Sticky Header
         */
        $('.rate_tracker__header').removeClass('sticky');

        /**
         * Open Fancybox
         */
        $('.rate_tracker__fancybox').removeClass('policy_active');
        $('.rate_tracker__policy')
            .removeClass('terms')
            .removeClass('policy');

        e.preventDefault();

    });

    /**
     * isInvalid Input
     * @keypress
     * @change
     */
    $(document).on('keypress change', '.rate_tracker__fancybox input', function (e) {

        $(this).parent().next('.form-err-msg').remove();

        //$(this).parent().parent().parent().find('.fl-wrap').removeClass('is-invalid');

        $(this).parent().parent().next('.form-err-msg').remove();

    });

    /**
     * Phone Mask
     */
    $('.phone-validate').mask('(999) 999-9999', {
        showMaskOnFocus         : true,
        showMaskOnHover         : false,
        autoUnmask              : true,
        clearMaskOnLostFocus    : true
    }).on('click', function () {

        if ($(this).val() === '(___) ___-____') {
            $(this).get(0).setSelectionRange(1, 1);
        }

    });








});
