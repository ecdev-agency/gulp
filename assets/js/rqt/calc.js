/**
 * General tools & calculation functions of RQT
 */

var $rqt_form = $('#parametersForm'),
    $rqt_form_values = {};




function get_form_values() {
    $rqt_form_values = {
        down_payment_amt: (500000 / 100) * 20,
        down_payment_pct: 20,
        credit_score: 760,
        loan_amount: 400000,
        loan_purpose: 0,
        loan_purpose_trigger: 0,
        third_parties_check: '',
        loan_type: "30 year fixed",
        lock_days: 30,
        military_veteran: "N",
        occupancy: 0,
        property_type: 0,
        purchase_price: 500000,
        second_mortgage_amt: "",
        waive_escrow: 0,
        zip_code: 98004,
    };

    $rqt_form.serializeArray().reduce(function (obj, item) {
        let format_val = item.value;

        // convert string values to number / float
        if (format_val.toLowerCase().indexOf('$') != -1 ||
            format_val.toLowerCase().indexOf('%') != -1) {
            format_val = cleanNum(item.value);
        }


        $rqt_form_values[item.name] = format_val;
        return obj;
    }, {});
}


function update_form_values() {
    $.each($rqt_form_values, function (k, v) {
        if (typeof ($('[name=' + k + ']')) != 'undefined' && $('[name=' + k + ']').length > 0) {
            $('[name=' + k + ']').val(v); // .trigger('change');
        }
    });
}


/**
 * Recalculate fields & update form view
 */
function update_view() {
    $rqt_form = $('#parametersForm');

    // get current RQT form values
    get_form_values();

    let $downpayment_value_slider = $rqt_form.find('.down_payment_amt').parents('label').find('.value-slider'),
        $purchase_price_lbl = $rqt_form.find('.purchase_price_lbl');

    // purchase calculation
    if ($rqt_form_values.loan_purpose == 0) {
        // don't show 1st time buyer options if the downpayment is above 5%
        let $first_time_buyer = $rqt_form.find('#first_time_buyer');
        if ($rqt_form_values.down_payment_pct > 5) {
            $first_time_buyer.parents('.extra-options').addClass('hidden');
            $first_time_buyer.removeAttr('checked');
            $first_time_buyer.prop('checked', false);
        } else {

            $first_time_buyer.parents('.extra-options').removeClass('hidden');
        }

        let $lpmi_check = $rqt_form.find('#lpmi_check');
        if ($rqt_form_values.down_payment_pct >= 20) {
            $lpmi_check.parents('.extra-options').addClass('hidden');
            $lpmi_check.prop('checked', false);
            $lpmi_check.removeAttr('checked');
        } else {
            $lpmi_check.parents('.extra-options').removeClass('hidden');
        }

        // refinance / cash out refinance
        $rqt_form.find('input.field-group:disabled, input.field-group.disabled').parents('.fields-group').removeClass('disabled');
        $rqt_form.find('.down_payment_amt, .down_payment_pct').removeAttr('disabled');

        $downpayment_value_slider.show();
        $purchase_price_lbl.find('span').text("Purchase Price");
    } else {
        $rqt_form.find('.down_payment_amt, .down_payment_pct').prop('disabled', true);
        $rqt_form.find('input.field-group:disabled, input.field-group.disabled').parents('.fields-group').addClass('disabled');
        $downpayment_value_slider.hide();
        $purchase_price_lbl.find('span').text("Property Value");
    }


}

/**
 * init cities list popup  & scrollbar
 */
function init_ZIPmodal_popup() {
    let cityPopup = $('.modal-popover .data-list');
    cityPopup.scrollTop(0);

    cityPopup.niceScroll({
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
}


/**
 * after select zip code or city in location popup
 */
function after_change_city_popup() {

    // if header form fields is hidden, submit form exclude form showing
    if ($('#parameters').hasClass('not-open')) {
        $('#parametersForm').submit();
    }
}


/**
 * Change checkbox header
 */
$(document).on('change', 'input.extra-options', function () {
    return $('#parametersForm').submit();
});


$(document).ready(function () {

    /**
     * Zip formatting
     */
    $(document).on('keypress', 'input.onlyNumbers', function (e) {
        // only numbers
        var charCode = (e.which) ? e.which : e.keyCode;
        if (String.fromCharCode(charCode).match(/[^0-9]/g))
            return false;

    });



    /**
     * Formatting currency fields
     */
    $(document).on('keypress', 'input.currency', function (e, parent) {
        // only numbers
        var charCode = (e.which) ? e.which : e.keyCode;
        if (String.fromCharCode(charCode).match(/[^0-9]/g))
            return false;

    });

    $(document).on('keyup', 'input.currency', function (e, parent) {
        if (e.keyCode === 9) return false;

        formatCurrency2($(this), true);

        let $value_slider = (typeof ($(this).parents('label').find('.value-slider.ui-slider')) != 'undefined' &&
            $(this).parents('label').find('.value-slider.ui-slider') != null) ? $(this).parents('label').find('.value-slider.ui-slider') : null;
        if ($value_slider) {
            $value_slider.slider('value', cleanNum($(this).val()));
        }

        // loan amount
        if ($(this).hasClass('loan_amount')) {
            let new_amt_val = ($rqt_form_values.purchase_price - cleanNum($(this).val())),
                down_payment_pct = (new_amt_val / ($rqt_form_values.purchase_price / 100));

            $rqt_form.find('.down_payment_pct').val(down_payment_pct).trigger('change', 'loan_amount');
        }

        update_view();

        let down_payment_amt = $rqt_form_values.down_payment_amt;

        // purchase price event
        if ($(this).hasClass('purchase_price')) {
            down_payment_amt = removeCurrencyDots(($rqt_form_values.purchase_price * ($rqt_form_values.down_payment_pct / 100)));
            let max_downpayment_amt = removeCurrencyDots(($rqt_form_values.purchase_price / 100) * rqt_vars._rqt_conditions.DownPaymentPct.max);

            $rqt_form.find('.down_payment_amt').val(down_payment_amt).attr('max', max_downpayment_amt).trigger('change', 'purchase_price');
//            $rqt_form.find('.loan_amount').attr('max', $rqt_form_values.purchase_price).trigger('change', 'purchase_price');
        }

        // downpayment amount
        if ($(this).hasClass('down_payment_amt')) {
            let down_payment_amt = ($rqt_form_values.down_payment_amt / ($rqt_form_values.purchase_price / 100));
            $rqt_form.find('.down_payment_pct').val(down_payment_amt).trigger('change', 'down_payment_amt');
        }


        // any currency field
        if ($(this).hasClass('purchase_price') ||
            $(this).hasClass('down_payment_pct') ||
            $(this).hasClass('down_payment_amt')) {

            let max_loan_amount = $rqt_form_values.purchase_price, // ($rqt_form_values.purchase_price / 100) * (rqt_vars._rqt_conditions.DownPaymentPct.max);
                min_loan_amount = $rqt_form_values.purchase_price / 100 * (100 - rqt_vars._rqt_conditions.DownPaymentPct.max);

            $rqt_form.find('.loan_amount').attr('min', min_loan_amount.toFixed(0)).attr('max',max_loan_amount.toFixed(0));
            $rqt_form.find('.loan_amount').val($rqt_form_values.purchase_price - down_payment_amt).trigger('change', 'any');
        }

    });


    $(document).on('change', 'input.currency', function (e, parent) {
        if ($(this).val().length == 1 && $(this).val() == 0)
            $(this).val('');

        if (typeof parent != 'undefined') {
            formatCurrency2($(this), false);
        } else {
            formatCurrency2($(this), true);
        }


        let $value_slider = (typeof ($(this).parents('label').find('.value-slider.ui-slider')) != 'undefined' &&
            $(this).parents('label').find('.value-slider.ui-slider') != null) ? $(this).parents('label').find('.value-slider.ui-slider') : null;
        if ($value_slider) {
            $value_slider.slider("value", cleanNum($(this).parents('label').find('[data-slider-target]').val()));
        }



        // update loan amount slider
        let $loan_amount_slider = (typeof ($(this).parents('label[for=loan_amount]').find('.value-slider.ui-slider')) != 'undefined' &&
            $(this).parents('label[for="loan_amount"]').find('.value-slider.ui-slider') != null) ? $(this).parents('label[for="loan_amount"]').find('.value-slider.ui-slider') : null;

        if ($loan_amount_slider) {
            let $target_input = $loan_amount_slider.parents('label').find('input[data-slider-target]'),
                max_loan_amount = parseFloat($target_input.attr('max')),
                min_loan_amount = parseFloat($target_input.attr('min')),
                val_loan_amount = (typeof $target_input.val() != 'undefined') ? cleanNum($target_input.val()) : 0;

            $loan_amount_slider.attr('data-min', min_loan_amount);
            $loan_amount_slider.attr('data-max', max_loan_amount);
            //$loan_amount_slider.attr('data-value', val_loan_amount);

            init_range_slider($loan_amount_slider);
        }
    });


    /**
     * Formatting percentage fields
     */
    $(document).on('keypress', 'input.percentage', function (e, parent) {
        // only numbers
        var charCode = (e.which) ? e.which : e.keyCode;
        if (String.fromCharCode(charCode).match(/[^0-9.]/g))
            return false;

    });

    $(document).on('keyup', 'input.percentage', function (e, parent) {
        if (e.keyCode === 9) return false;

        formatPercent($(this), e, true);


        // downpayment percent
        if ($(this).hasClass('down_payment_pct')) {
            let down_payment_pct = removeCurrencyDots($rqt_form_values.purchase_price / 100 * $rqt_form_values.down_payment_pct);
            $rqt_form.find('.down_payment_amt').val(down_payment_pct).trigger('change', 'down_payment_pct');
        }

        update_view();

        let $value_slider = (typeof ($(this).parents('label').find('.value-slider.ui-slider')) != 'undefined' &&
            $(this).parents('label').find('.value-slider.ui-slider') != null) ? $(this).parents('label').find('.value-slider.ui-slider') : null;
        if ($value_slider) {
            $value_slider.slider('value', $rqt_form_values.down_payment_pct);
        }

        // any currency field
        if (typeof parent != 'undefined' && parent != 'loan_amount') {
            if ($(this).hasClass('purchase_price') ||
                $(this).hasClass('down_payment_pct') ||
                $(this).hasClass('down_payment_amt')) {

                $rqt_form.find('.loan_amount').val($rqt_form_values.purchase_price - $rqt_form_values.down_payment_amt).trigger('change', 'any');
            }
        }
    });

    $(document).on('change', 'input.percentage', function (e, parent) {
        if (typeof parent != 'undefined' && parent == 'down_payment_amt') {
            formatPercent($(this), e, false);
        } else {
            formatPercent($(this), e, true);
        }


        update_view();

        // downpayment percent
        if (typeof parent != 'undefined' && parent == 'loan_amount') {
            let down_payment_pct = removeCurrencyDots($rqt_form_values.purchase_price / 100 * $rqt_form_values.down_payment_pct);
            $rqt_form.find('.down_payment_amt').val(down_payment_pct).trigger('change', 'down_payment_pct');
        }

        let $value_slider = (typeof ($(this).parents('label').find('.value-slider.ui-slider')) != 'undefined' &&
            $(this).parents('label').find('.value-slider.ui-slider') != null) ? $(this).parents('label').find('.value-slider.ui-slider') : null;
        if ($value_slider) {
            $value_slider.slider('value', $rqt_form_values.down_payment_pct);
        }
    });


    /**
     * Autoselect input value on click
     */
    $(document).on('click',
        '#parameters .zip_code, ' +
        '#parameters input.currency,' +
        ' #parameters input.percentage',
        function () {
            $(this).select();
        });


    /**
     * RQT popup print
     */
    $(document).on('click', '#fee_worksheet .print-btn', function (e) {

        $('#rqt_popup_content').printThis({
            importCSS: true,
        });

    });


    // city location popup hide if click out of this popup
    jQuery(document).mousedown(function (e) {
        var container = $(".modal-popover"),
            parent = $('[data-toggle="modal-popover"]');

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            parent.removeClass('open');
            container.fadeOut(100);

        }
    });


    /**
     * cities popup list show
     */
    jQuery(document).on('click', 'a[data-toggle="modal-popover"]', function (e) {
        e.preventDefault();

        // if fields not loaded done
        if ($(this).parents('#calc-content').hasClass('preload-values')) {
            return;
        }

        let id = $(this).attr('href'),
            cityPopupList = $('.modal-popover .data-list'),
            popupSearchInput = jQuery(id).find('.filter-input');

        if ($(id).css('display') == 'block') {
            return false;
        } else {
            $(this).addClass('open');
            jQuery(id).fadeIn(200);
            // jQuery(id).find('.filter-input').focus();

            // clear values & cities list to default
            jQuery(id).find('.filter-input').val('');
            cityPopupList.empty();

            // if current RQT is specific city page, show only zip of current city
            if (rqt_vars._rqt_type != 'default') {
                cityPopupList.attr('data-selected-city', rqt_vars._rqt_city);
                cityPopupList.html(rqt_get_ziplist_by_city(rqt_vars._rqt_city));
                popupSearchInput.attr('placeholder', rqt_vars._config_default_location_city_search_placeholder);
            } else {
                cityPopupList.html(default_cities_list);
                popupSearchInput.attr('placeholder', rqt_vars._config_default_location_search_placeholder);
            }


            // show cities popup
            init_ZIPmodal_popup();
        }
    });


    /**
     * cities popup select item
     */
    jQuery(document).on('click', '.modal-popover .data-list a', function (e) {
        e.preventDefault();

        let parent = $('a[href="#' + $(this).parents('.modal-popover').attr('id') + '"]');
        let zip = $(this).parents('li').attr('data-zip');
        let cityname = $(this).parents('li').attr('data-city');
        let state = $(this).parents('li').attr('data-state');
        let county = $(this).parents('li').attr('data-county');
        let hasChild = (typeof $(this).parents('li').attr('data-childs') != 'undefined' && $(this).parents('li').attr('data-childs') == 'true') ? true : false;

        // if cities has many zip codes
        if (hasChild) {
            // clear cities list & search input
            $('.modal-popover .filter-input').val(cityname);
            $('.modal-popover .data-list').empty();
            // $('.modal-popover .filter-input').focus();

            // add all founded zip codes of selected city to list
            let zipinfo = cities.zip[cityname];
            zipinfo.list.map(function (ZIP, index) {
                let item = '<li data-type="zip"  data-county="' + zipinfo.info.county + '" data-state="' + zipinfo.info.state + '" data-city="' + cityname + '" data-zip="' + ZIP + '"><a href="#">' + ZIP + '</a></li>';
                $('.modal-popover .data-list').append(item);
            });
        } else {
            // if select city which contain only one zip code
            let selected = cityname + ' ' + state + ' (' + county.toUpperCase() + ')';
            parent.find('#cityState').text(selected);
            $('#parameters #zip_code').val(zip);
            $(this).parents('.modal-popover').fadeOut(100, function () {
                parent.removeClass('open');
                // show rates button etc..
                after_change_city_popup();
            });

        }

        // show cities popup
        init_ZIPmodal_popup();
    })

    // Save additional menu position
    $(document).on('click', '.add-options-btn', function () {
        let $add_options_fields = $('.add-options-col');
        $add_options_fields.toggleClass('show');

        if ($add_options_fields.hasClass('show')) {
            createCookie('QRT_add_open', 1, 30);
        } else {
            delCookie('QRT_add_open');
        }
        get_adv_fields_activity();
    });


    function get_adv_fields_activity() {
        let $add_options_fields = $('.add-options-col'),
            $add_options_btn = $('.add-options-btn'),
            $form_fields_container = $('.form-fields-container');

        if ($add_options_fields.hasClass('show')) {
            $add_options_fields.attr('data-show', true);
            $add_options_btn.attr('data-show', true);
            $form_fields_container.attr('show-add-options', true);
        } else {
            $add_options_fields.attr('data-show', false);
            $add_options_btn.attr('data-show', false);
            $form_fields_container.attr('show-add-options', false);
        }
    }

    get_adv_fields_activity();


    /**
     * Change loan type tabs
     */
    $(document).on('change click', '[name=loan_purpose_trigger]', function (e) {
        $("#loan_purpose").val($(this).val()).trigger('keyup');
        update_view();
    });
});


function before_submit(data, result) {
    animate_rates_scroll();
}
