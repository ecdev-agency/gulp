/**
 * Loan limits general JS
 */

jQuery(document).ready(function ($) {
    var form_name = '.zipcode_form',
        $form = $(form_name),
        $zip_input = $form.find('input.zip_code'),
        zip_code = '',
        $zip_input_container = $zip_input.parents('.form-fields'), // get zip code from geolocation if empty field
        $locationInfo = $form.find('.location-info'), // current location title label
        $body = $('body');


    /**
     * ZIP code form submit
     */
    $(document).on('submit', form_name, function (e) {
        if (!$zip_input.hasClass('valid')) {
            $zip_input.trigger('change');
        }
        e.preventDefault();
        return false;
    });


    function reset_validation() {
        let $validation_msg = $form.find('.validation-message');
        $validation_msg.text($validation_msg.attr('data-default'));
    }


    function reset_start_data() {
        $('[data-update="county_name"]').each(function () {
            let $this = $(this),
                data_default = $this.data('default');
            if (data_default) $this.text(data_default);
        });

        $('.tab-unit-col-price [data-price-unit]').each(function () {
            var $this = $(this),
                price_start = $this.attr('data-price-start');
            if (price_start) {
                $this.text(price_start);
            }
        });

        $('.tab-unit-col-label[data-unit-label]').each(function () {
            var $this = $(this),
                unit_label = ths.data('unit-label');
            if (unit_label) $this.text(unit_label);
        });

        $('.tab-unit-col-label').removeClass('label-blank');
        return false;
    }


    /**
     * Autoselect value in ZIP input on click
     */
    $zip_input.on('focus', function (e) {
        if (e.type === 'focus') {
            $(this).select();
        }
    });


    /**
     * ZIP code input change
     */
    $zip_input.on('input change  blur', function (e) {
        e.preventDefault();
        zip_code = $(this).val();

        var $this = $(this),
            $form = $this.closest('form'),
            $button = $form.closest('button'),
            $validation_msg = $form.find('.validation-message'),
            $loan_limits_popup = $('.loan-limits-popup');

        if (e.type == 'blur') {
            if (this.value == '' && window.history.replaceState) {
                if (window.location.search) {
                    window.history.replaceState({}, '', window.location.origin + window.location.pathname);
                }
                $form.removeClass('valid_msg_shown');
                $loan_limits_popup.removeClass('shown');
                $body.removeClass('loan_limits_popup_shown');
            }

            return;
        }


        $form.removeClass('valid_msg_shown');
        $loan_limits_popup.removeClass('shown');
        $body.removeClass('loan_limits_popup_shown');

        if (e.type == 'input') {
            if (zip_code.length < 5) $this.removeClass('valid');
            return;
        }

        if (zip_code.length && zip_code.length < 5) {
            $form.addClass('valid_msg_shown');
            reset_start_data();
            return false;
        } else if (this.value == '') {
            reset_start_data();
            return false;
        }

        $this.removeClass('valid').addClass('processing');

        let locationInfo = sm_get_us_user_zip();

        if (!locationInfo || locationInfo.zip != zip_code)
            $locationInfo.addClass('preload-values-d');

        $button.attr('disabled', 'disabled');

        // Get loan limits data
        $.post(sm_obj.ajaxurl, {
            'action': 'loan_limits_get',
            'nonce': sm_obj.nonce,
            'zip': zip_code
        }, function (response) {
            var isZipData = true;
            $this.removeClass('processing');
            $button.removeAttr('disabled');

            reset_validation();

            if (!response.hasOwnProperty('geolocation')) {
                isZipData = false;
                $validation_msg.text(loanlimit_vars.validation_messages.zipcode_not_found);
                $locationInfo.removeClass('show').hide();
            } else {
                $locationInfo.show().addClass('show');
                $locationInfo.text(response.geolocation.city + ' (' + response.geolocation.statecode + ')');
            }

            $locationInfo.removeClass('preload-values-d');


            if (isZipData == false) {
                $form.addClass('valid_msg_shown');
            }

            $('.price_none').removeClass('price_none');
            // $('.tab-unit-col-label').html('&nbsp;').addClass('label-blank');

            if (response.hasOwnProperty('year') && response.year) {
                $('[data-update="current_year"]').text(response.year);
            }

            if (response.hasOwnProperty('county_name') && response.county_name) {
                $('[data-update="county_name"]').text(response.county_name + ' ' + loanlimit_vars.county_label);
                $this.addClass('valid');

                if (response.state_code) {
                    if (jQuery.inArray(response.state_code, geolocation_vars.location_config.available_states) !== -1) {
                        $loan_limits_popup.addClass('shown');
                        $body.addClass('loan_limits_popup_shown');
                    }
                }


                setTimeout(function () {
                    $(window).trigger('resize');
                }, 1000);

            } else {
                $('[data-update="county_name"]').text('');
                $('[data-update="current_year"]').text('');
            }


            if (response.hasOwnProperty('conforming') && response.conforming) {
                for (var key in response.conforming) {
                    let format_price = response.conforming[key] ? parseInt(response.conforming[key]).toLocaleString('en') : '';
                    let $price_el = $('[data-price-type="conforming"][data-price-unit="' + key + '"]');
                    let $standart_value = $('[data-type="conforming"][data-unit="' + key + '"][data-standart-value]');
                    if (format_price) {

                        if (format_price != $standart_value.attr('data-standart-value')) {
                            $standart_value.removeClass('hide');
                        } else {
                            $standart_value.addClass('hide');
                        }

                        $price_el.text(format_price);
                    } else {
                        isZipData = false;
                    }
                }
            }

            if (response.hasOwnProperty('standart') && response.standart) {
                for (var key in response.conforming) {
                    let format_price = response.conforming[key] ? parseInt(response.conforming[key]).toLocaleString('en') : '';
                    let $price_el = $('[data-price-type="conforming"][data-price-unit="' + key + '"]');
                    if (format_price) {
                        $price_el.text(format_price);
                    } else {
                        isZipData = false;
                    }
                }
            }

            if (response.hasOwnProperty('fha') && response.fha) {
                for (var key in response.fha) {
                    let format_price = response.fha[key] ? parseInt(response.fha[key]).toLocaleString('en') : '';
                    let $price_el = $('[data-price-type="fha"][data-price-unit="' + key + '"]');
                    let $standart_value = $('[data-type="fha"][data-unit="' + key + '"][data-standart-value]');

                    if (format_price) {
                        if (format_price != $standart_value.attr('data-standart-value')) {
                            $standart_value.removeClass('hide');
                        } else {
                            $standart_value.addClass('hide');
                        }
                        $price_el.text(format_price);
                    } else {
                        isZipData = false;
                    }
                }
            }


            $zip_input.parents('.form-fields').removeClass('preload-values');

        }, 'json');

        return false;
    });


    /**
     * ZIP code form submit button event
     */
    $form.find('button').on('click', function (e) {
        var $this = $(this),
            $form = $this.closest('form'),
            $zip = $form.find('input[name=zip]');
        if (!$zip.val()) {
            $form.addClass('valid_msg_shown');
            $zip.focus();
            e.preventDefault();
            return false;
        }
    });


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
        $locationInfo.addClass('preload-values-d');
        $zip_input_container.addClass('preload-values');

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

            if (!$zip_input.val()) {
                // get cookie location
                if (geo_data) {
                    zip_code = geo_data.zip_code;
                    $locationInfo.text(geo_data.city + ' (' + geo_data.state + ')').removeClass('preload-values-d').addClass('show');
                    $zip_input.val(zip_code).trigger('change');
                    $zip_input.attr('placeholder', $zip_input.attr('data-placeholder'));
                    $zip_input_container.removeClass('preload-values');
                }

            }
        } else {
            $locationInfo.text('Undefined').removeClass('preload-values-d');
        }
    }

    // detect geolocation after load page
    sm_get_user_geolocation();


    /**
     * Tabs unit event
     */
    $(document).on('click', '.tabs-unit .tab-unit', function (e) {
        e.preventDefault();
        var $_this = $(this), tab_num = $_this.data('num');
        $('.tab-unit-active').removeClass('tab-unit-active');
        $_this.addClass('tab-unit-active');
        $_this.parents('.tab-unit-wrap').addClass('tab-unit-active');
        $('.tab-unit-col[data-num=' + tab_num + ']').addClass('tab-unit-col-active').siblings().removeClass('tab-unit-col-active');

        if (window.innerWidth <= 767) {
            $_this.closest('.tabs-unit').toggleClass('shown');
        }
        return false;
    });


    $('.loan-limits-popup .close-icon').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.loan-limits-popup').toggleClass('shown');
        $body.removeClass('loan_limits_popup_shown');
        return false;
    });


    var $footer = $('.get_started_section'),
        $loan_limits_popup_wrap = $('.loan-limits-popup-wrap'),
        $loan_limits_popup = $('.loan-limits-popup'),
        popup_h = $loan_limits_popup.outerHeight(),
        wpadmin = ($('#wpadminbar') != null) ? $('#wpadminbar').outerHeight() : 0,
        glue_to_footer = 0;

    $(window).on('load resize', function (e) {
        if (window.innerWidth > 767) $('.tabs-unit').removeClass('shown');
    });


});