"use strict";

jQuery(document).ready(function ($) {
    /* if zip in url */
    var urlParams = {};
    var data = {};
    var geolocation = {};
    var userState = "";
    var history_result = {};
    var XHR = 0;
    var XHR_timeout = 0;
    var expires = new Date(Date.now() + 3600e3);

    var taxRatesByState = page_vars.taxRatesByState,
        $hpInterestRate = $('#hp-interest-rate'),
        $iInterestRate = $('#i-interest-rate'),
        $mpInterestRate = $('#mp-interest-rate'),
        $bwInterestRate = $('#bw-interest-rate');

    // get params from browser URL
    location.search.substr(1).split("&").forEach(function (item) {
        urlParams[item.split("=")[0]] = item.split("=")[1];
    });

    // check zipcode by URL
    if (urlParams.hasOwnProperty('zip_code')) {
        $('input[name=zipcode]').val(urlParams.zip_code);
        get_loc_html(urlParams.zip_code);
    } else {
        // detect geolocation
        sm_get_user_geolocation();
    }

    $('.mortgage-calculator__calculator .date_ch').click(function () {
        $('.mortgage-calculator__calculator .date-values').slideToggle(300);
        var before_val = $('#i-date-type').val();

        if (before_val === "1") {
            $('.date-values').html('/ month').data('type', "12");
            $('#change_income').html('Annual Income');
        } else {
            $('.date-values').html('/ year').data('type', "1");
            $('#change_income').html('Monthly Income');
        }
    });
    $('.mortgage-calculator__calculator .date-values').click(function () {
        $('#i-date-type').val($(this).data('type')).trigger('change');
        $('.mortgage-calculator__calculator .date_ch span').html($(this).html());
    });
    $('input').on('click', function () {
        $(this).select();
    }); // afford ranger
    var slider_dti = $("#aff_Range");
    var slider_dti_max = slider_dti.attr('max');
    var slider_dti_min = slider_dti.attr('min');
    var slider_dti_val = slider_dti.val();
    afford_range_change(slider_dti_val, slider_dti_min);
    var start_slider_dti__w = slider_dti_val / slider_dti_max * 100;
    var output_dti = $("#i-debt-to-income");
    var output_dti_val = output_dti.val();

    function afford_range_change(procent, slider_dti_min) {
        var l = procent - slider_dti_min;
        var pin_pos = procent;
        if (procent < 33) {
            var a = 100 / 32 * procent;
            $('#aff-line-active').css('width', a + '%');
            $('#mod-line-active').css('width', 0);
            $('#name-line-active').css('width', 0);
            $('#unaff-line-active').css('width', 0);
            $('#range-monthly-payment span.range_part').html('Affordable');
            $('#custom-handle').css('background-color', '#009821');
        }
        if (procent > 32 && procent < 44) {
            var a = 100 / 11 * (procent - 32);
            $('#aff-line-active').css('width', 100 + '%');
            $('#mod-line-active').css('width', a + '%');
            $('#name-line-active').css('width', 0);
            $('#unaff-line-active').css('width', 0);
            $('#range-monthly-payment span.range_part').html('Moderate');
            $('#custom-handle').css('background-color', '#ffec43');
        }

        if (procent > 43 && procent < 51) {
            var a = 100 / 8 * (procent - 43);
            $('#aff-line-active').css('width', 100 + '%');
            $('#mod-line-active').css('width', 100 + '%');
            $('#name-line-active').css('width', a + '%');
            $('#unaff-line-active').css('width', 0);
            $('#range-monthly-payment span.range_part').html('High');
            $('#custom-handle').css('background-color', '#ffd166');
        }

        if (procent > 50) {
            var a = 100 / 50 * (procent - 50);
            $('#aff-line-active').css('width', 100 + '%');
            $('#mod-line-active').css('width', 100 + '%');
            $('#name-line-active').css('width', 100 + '%');
            $('#unaff-line-active').css('width', a + '%');
            $('#range-monthly-payment span.range_part').html('Unaffordable');
            $('#custom-handle').css('background-color', '#ea5b0b');
        }
    }

    output_dti.val(slider_dti_val);
    slider_dti.on('change input', function () {
        output_dti.val($(this).val());
        $('#i-debt-to-income').trigger('change');
        afford_range_change($(this).val(), slider_dti_min);
    });
    var handle = $("#custom-handle");
    $("#slider").slider({
        min: 1,
        max: 99,
        values: [36],
        create: function () {
            handle.html('<span id="range-monthly-payment"><span class="price"></span><span class="range_part"></span></span>');
        },
        slide: function (event, ui) {
            $("#aff_Range").val(ui.values[0]);
            output_dti.val(ui.values[0]);
            $('#i-debt-to-income').trigger('change');
            afford_range_change(ui.values[0], slider_dti_min);
        }
    });


    // afford ranger end

    $('.show_more_options').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $(this).closest('form').find('.more_options_place').slideToggle(300);
        var cur_form_id = $(this).closest('form').attr('id');

    });
    $('#tabs_hp .m_calc_out_tab').on('click', function () {
        if ($(this).hasClass('active')) return false;
        $('#tabs_hp .m_calc_out_tab.active').removeClass('active');
        $('#tabs_hp .m_calc_out_content.active').removeClass('active');
        var cur_id = $(this).data('id');
        $(this).addClass('active');
        $('#m_calc_out_tab-' + cur_id).addClass('active');
    });
    $('#tabs_mp .m_calc_out_tab').on('click', function () {
        if ($(this).hasClass('active')) return false;
        $('#tabs_mp .m_calc_out_tab.active').removeClass('active');
        $('#tabs_mp .m_calc_out_content.active').removeClass('active');
        var cur_id = $(this).data('id');
        $(this).addClass('active');
        $('#m_calc_out_tab-' + cur_id).addClass('active');
        $('.tables_slider').slick('refresh');
    });

    var propertyTax = 0;


    function save_interest_rate(response) {
        var expires = new Date(Date.now() + 3600 * 6); // expiry 6 hours

        setCookie('mortgage_rates', JSON.stringify(response), {expires: expires});
    }

    function init_calc() {
        propertyTax = getTaxRateByState(userState);
        data = {
            hp: {
                calculated: false,
                calculated_first_time: true,
                loanAmount: inputToNumber($('#hp-loan-amount').val()),
                downPayment: inputToNumber($('#hp-down-payment-amount').val()),
                downPaymentPercent: inputToNumber($('#hp-down-payment-percent').val()),
                loanTermInMonth: inputToNumber($('#hp-loanTermInMonths').val()),
                userState: userState,
                interestRate: inputToNumber($('#hp-interest-rate').val()),
                propertyTaxManual: false,
                propertyTax: 0,
                propertyTaxPercent: 0,
                homeInsurance: inputToNumber($('#hp-home-insurance').val()),
                hoa: inputToNumber($('#hp-hoa').val()),
                hpChart: false,
                monthlyPayment: 0,
                customRate: false
            },
            i: {
                calculated: false,
                income: inputToNumber($('#i-income').val()),
                monthlyDebts: inputToNumber($('#i-monthly-debts').val()),
                debtToIncome: inputToNumber($('#i-debt-to-income').val()),
                data_type: inputToNumber($('#i-date-type').val()),
                loanTermInMonth: inputToNumber($("#i-loanTermInMonths").val()),
                userState: userState,
                interestRate: inputToNumber($('#i-interest-rate').val()),
                downPayment: inputToNumber($('#i-down-payment-amount').val()),
                downPaymentPercent: inputToNumber($('#i-down-payment-percent').val()),
                downPaymentType: 'percent',
                propertyTax: 0,
                propertyTaxPercent: 0,
                propertyTaxCurrency: 0,
                homeInsurance: inputToNumber($('#i-home-insurance').val()),
                hoa: inputToNumber($('#i-hoa').val()),
                loanAmount: 0,
                monthlyPayment: 0,
                customRate: false
            },
            mp: {
                calculated: false,
                monthlyPayment: inputToNumber($('#mp-monthly-payment').val()),
                downPayment: inputToNumber($('#mp-down-payment-amount').val()),
                downPaymentPercent: inputToNumber($('#mp-down-payment-percent').val()),
                downPaymentType: 'percent',
                loanTermInMonth: inputToNumber($("#mp-loanTermInMonths").val()),
                userState: userState,
                interestRate: inputToNumber($('#mp-interest-rate').val()),
                propertyTax: 0,
                propertyTaxPercent: 0,
                homeInsurance: inputToNumber($('#mp-home-insurance').val()),
                hoa: inputToNumber($('#mp-hoa').val()),
                loanAmount: 0,
                principalAndInterest: 0,
                customRate: false,
                epApply: false,
                epToYourMonthlyPayment: 0,
                epAsAnExtraYearlyPayment: 0,
                epOccurringEvery: 0,
                epAsOneTimePaymentIn: 0,
                epAsOneTimePaymentMonth: 0,
                epAsOneTimePaymentYear: 0
            },
            bw: {
                calculated: false,
                loanAmount: inputToNumber($('#bw-loan-amount').val()),
                downPayment: inputToNumber($('#bw-down-payment-amount').val()),
                downPaymentPercent: inputToNumber($('#bw-down-payment-percent').val()),
                downPaymentType: 'percent',
                loanTermInMonth: inputToNumber($('#bw-loanTermInMonths').val()),
                userState: userState,
                interestRate: inputToNumber($('#bw-interest-rate').val()),
                propertyTaxManual: false,
                propertyTax: 0,
                propertyTaxPercent: 0,
                homeInsurance: inputToNumber($('#bw-home-insurance').val()),
                hoa: inputToNumber($('#bw-hoa').val()),
                hpChart: false,
                monthlyPayment: 0,
                customRate: false
            }
        };

        // setup property tax

        data.hp.propertyTax = data.hp.loanAmount * getTaxRateByState(data.hp.userState) / 1200;
        data.hp.propertyTaxPercent = getTaxRateByState(data.hp.userState);
        data.i.propertyTaxPercent = getTaxRateByState(data.hp.userState);
        data.bw.propertyTaxPercent = getTaxRateByState(data.hp.userState);
        data.mp.propertyTaxPercent = getTaxRateByState(data.hp.userState);
        $('#hp-property-tax').val(data.hp.propertyTaxPercent);
        $('#i-property-tax').val(numberToPercent(data.i.propertyTaxPercent));
        $('#mp-property-tax').val(numberToPercent(data.mp.propertyTaxPercent));
        $('#bw-property-tax').val(numberToPercent(data.bw.propertyTaxPercent));
        $('#pb-property-tax').val(numberToPercent(data.hp.propertyTax));

    }

    function get_loc_html(user_zip) {
        loc_name = '';
        var mc_geolocation = getCookie('geolocation');
        if (mc_geolocation) {
            try {
                mc_geolocation = JSON.parse(mc_geolocation);
                if (!mc_geolocation.hasOwnProperty('country') || !mc_geolocation.hasOwnProperty('zip_code') || !mc_geolocation.hasOwnProperty('state_code')) {
                    throw 'geolocation error';
                }
            } catch (e) {
                mc_geolocation = false;
            }
        }
        if (typeof mc_geolocation == 'undefined' || mc_geolocation == false || mc_geolocation.zip_code != user_zip) {
            $('input[name=zipcode]').val(user_zip);
            $('#auto_geolocation').val(user_zip);
            $('#loc_name').html('').addClass('hold');
            var user_arr = {
                action: 'arrloc',
                zip_code: user_zip,
                size: true
            };
            jQuery.post(sm_obj.ajaxurl, user_arr, function (response) {
                if (response) {
                    if (response.hasOwnProperty('city') && response.hasOwnProperty('county_name')) {
                        loc_name = response.city + ' ' + response.statecode + ' (' + response.county_name + ')';
                        $('#i-state').val(response.statecode).trigger('change');
                        $('#mp-state').val(response.statecode).trigger('change');
                        $('#bw-state').val(response.statecode).trigger('change');
                        $('#hp-state').val(response.statecode).trigger('change');
                        var geolocation = {
                            zip_code: response.zip_code,
                            state_code: response.statecode,
                            state: response.state,
                            city: response.city,
                            county_name: response.county_name,
                            country: 'US'
                        };
                        setCookie('geolocation', JSON.stringify(geolocation), {
                            expires: expires
                        });

                        $('input[name=zipcode]').val(geolocation.zip_code);
                        $('#auto_geolocation').val(geolocation.state);

                        $(document).trigger('geolocation_received', geolocation);
                    }
                } else {
                    loc_name = "not found";
                }
                $('#loc_name').html(loc_name).removeClass('hold');
            });

        } else {
            $('input[name=zipcode]').val(mc_geolocation.zip_code);
            $('#auto_geolocation').val(mc_geolocation.state_code);
            var loc_state = mc_geolocation.state_code;
            var loc_name = mc_geolocation.city + ' ' + loc_state + ' (' + mc_geolocation.county_name + ')';
            $('#loc_name').html(loc_name);
            $('#i-state').val(loc_state).trigger('change');
            $('#mp-state').val(loc_state).trigger('change');
            $('#bw-state').val(loc_state).trigger('change');
            $('#hp-state').val(loc_state).trigger('change');
        }
    }

    $('input[name=zipcode]').on('change', function () {
        var be_val = $(this).val().replace(/[^0-9\.]+/g, '');
        $(this).val(be_val);
        var cur_val = $(this).val();

        if (cur_val.length == 5) {
            get_loc_html(cur_val);
            $(this).removeClass('warning');
        } else {
            $(this).addClass('warning');
        }
    });

    function validate_input_for_text(evt) {
        var theEvent = evt || window.event; // Handle paste

        if (theEvent.type === 'paste') {
            key = event.clipboardData.getData('text/plain');
        } else {
            // Handle key press
            var key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        }

        var keyCode = evt.keyCode || evt.which;

        if (!(keyCode >= 96 && keyCode <= 105 || keyCode >= 48 && keyCode <= 57 || keyCode == 190 || keyCode == 110 || keyCode == 8 || keyCode == 13 || keyCode == 9)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }

    function render_result(arr) {
        var inner_html = '';
        if (arr.length > 0) {
            inner_html = '<ul>';
            arr.forEach(function (element) {
                inner_html += '<li data-zip="' + element.zip_code + '" data-st="' + element.statecode + '" data-sn="' + element.state + '"  data-cn="' + element.county_name + '" data-city="' + element.city + '">' + element.city + ' <strong>' + element.statecode + ' (' + element.county_name + ')' + '</strong></li>';
            });
            inner_html += '</ul>';
        } else { inner_html = '<p>Not found</p>';}

        $('#city-search-list').html('');
        $('#city-search-list').append(inner_html);
    }

    $('body').on('click', '#city-search-list li', function () {
        var loc_name = '';
        var loc_state = $(this).data('st');

        if ($(this).data('zip')) {
            $('input[name=zipcode]').val($(this).data('zip'));
            $('#auto_geolocation').val(userState);
            loc_name = $(this).data('city') + ' ' + loc_state + ' (' + $(this).data('cn') + ')';
            $('#loc_name').html(loc_name).toggleClass('active');
            var geolocation = {
                zip_code: $(this).data('zip'),
                state_code: $(this).data('st'),
                state: $(this).data('sn'),
                city: $(this).data('city'),
                county_name: $(this).data('cn'),
                country: 'US'
            };
            setCookie('geolocation', JSON.stringify(geolocation), {
                expires: expires
            });
            $(document).trigger('geolocation_received', geolocation);
        }

        $('.mortgage-calculator-city-search').slideToggle(300);
    });
    $('.city-search_field').click(function () {
        $(this).addClass('active');
    });
    $('.city-search_field .input_clean').on('click', function () {
        $(this).parent().find('input').val('');
        $('.mortgage-calculator-city-search').slideToggle(300);
        $('#loc_name').removeClass('active');
        $('#city-search-list').html($('#city-const-list').html());
    });
    $('#loc_name').on('click', function () {
        $(this).toggleClass('active');
        $('.mortgage-calculator-city-search').slideToggle(0).find('input').focus();
    });
    $('#city-search_field').on('input', function () {
        if ($(this).val().length < 2) return;
        $('#city-search-list').html('Search..');
        $('#city-search-list ul').remove();
        var user_arr = {
            action: 'arrloc',
            size: 'search',
            search: $(this).val()
        };

        if (XHR) {
            XHR.abort();
            clearTimeout(XHR_timeout);
        }

        if (history_result.hasOwnProperty(user_arr.search)) {
            render_result(history_result[user_arr.search]);
        } else {
            XHR_timeout = setTimeout(function () {
                XHR = $.ajax({
                    url: sm_obj.ajaxurl,
                    data: user_arr,
                    type: 'POST'
                }).done(function (arr) {
                    render_result(arr); // addto history
                    history_result[user_arr.search] = arr;
                    XHR = 0;
                });
            }, 100);
        }
    });


    /**
     * Tabs
     */

    function switchToTab(tabId) {
        switch (tabId) {
            case 'by-home-price':
                $('#by-home-price').addClass('active');
                $('#by-income').removeClass('active');
                $('#by-monthly-payment').removeClass('active');
                $('#bi-weekly-payment').removeClass('active');
                $('.by-home-price-item').show();
                $('.by-income-item').hide();
                $('.by-monthly-payment-item').hide();
                $('.bi-weekly-payment-item').hide();
                $('body').removeClass('bw-chart-tooltip');
                rebase_active_menu('by-home-price');
                if (!data.hp.calculated) {
                    calculateByHomePrice();
                }

                break;

            case 'by-income':
                $('#by-home-price').removeClass('active');
                $('#by-income').addClass('active');
                $('#by-monthly-payment').removeClass('active');
                $('#bi-weekly-payment').removeClass('active');
                $('.by-home-price-item').hide();
                $('.by-income-item').show();
                $('.by-monthly-payment-item').hide();
                $('.bi-weekly-payment-item').hide();
                $('body').removeClass('bw-chart-tooltip');

                rebase_active_menu('by-income');
                if (!data.i.calculated) {
                    calculateByIncome();
                }
                $('#i-debt-to-income').trigger('change');
                break;

            case 'by-monthly-payment':
                $('#by-home-price').removeClass('active');
                $('#by-income').removeClass('active');
                $('#bi-weekly-payment').removeClass('active');
                $('#by-monthly-payment').addClass('active');
                $('.by-home-price-item').hide();
                $('.by-income-item').hide();
                $('.by-monthly-payment-item').show();
                $('.bi-weekly-payment-item').hide();
                $('body').removeClass('bw-chart-tooltip');
                rebase_active_menu('by-monthly-payment');
                if (!data.mp.calculated) {
                    calculateByMonthlyPayment();
                }

                break;

            case 'bi-weekly-payment':
                $('#by-home-price').removeClass('active');
                $('#by-income').removeClass('active');
                $('#by-monthly-payment').removeClass('active');
                $('#bi-weekly-payment').addClass('active');
                $('body').addClass('bw-chart-tooltip');
                $('.by-home-price-item').hide();
                $('.by-income-item').hide();
                $('.by-monthly-payment-item').hide();
                $('.bi-weekly-payment-item').show();
                rebase_active_menu('bi-weekly-payment');
                if (!data.bw.calculated) {
                    calculateBiWeeklyPayment();
                }

                break;
        }
    }

    /* $('#by-home-price, #by-income, #by-monthly-payment , #bi-weekly-payment').on('click', function () {*/
    $('.mortgage-calculator__tabs .mortgage-calculator__tab').on('click', function (e) {
        e.preventDefault();
        switchToTab($(this).attr('id'));
    });

    /**
     * Helpers
     */

    function getTaxRateByState(state) {
        return taxRatesByState.hasOwnProperty(state) ? Number(taxRatesByState[state]) : 0;
    }

    function homePriceFromMonthlyPaymentDownPaymentAmount(monthlyPayment, monthlyInterestRate, loanTerm, monthlyPropertyTax, downPayment, privateMortgageInsurance) {
        return ((Math.pow(monthlyInterestRate + 1, loanTerm) - 1) * monthlyPayment + (downPayment * Math.pow(monthlyInterestRate + 1, loanTerm) - downPayment) * privateMortgageInsurance + downPayment * monthlyInterestRate * Math.pow(monthlyInterestRate + 1, loanTerm)) / ((Math.pow(monthlyInterestRate + 1, loanTerm) - 1) * monthlyPropertyTax + (Math.pow(monthlyInterestRate + 1, loanTerm) - 1) * privateMortgageInsurance + monthlyInterestRate * Math.pow(monthlyInterestRate + 1, loanTerm));
    }

    function homePriceFromMonthlyPayment(monthlyPayment, monthlyInterestRate, loanTerm, monthlyPropertyTax, downPaymentPercent, privateMortgageInsurance) {
        return (Math.pow(monthlyInterestRate + 1, loanTerm) - 1) * monthlyPayment / ((Math.pow(monthlyInterestRate + 1, loanTerm) - 1) * monthlyPropertyTax + ((1 - downPaymentPercent) * Math.pow(monthlyInterestRate + 1, loanTerm) + downPaymentPercent - 1) * privateMortgageInsurance + (1 - downPaymentPercent) * monthlyInterestRate * Math.pow(monthlyInterestRate + 1, loanTerm));
    }

    function getPMIPercent(downPaymentPercent) {
        if (downPaymentPercent < 0.05) {
            return 0.0130;
        } else if (downPaymentPercent < 0.10) {
            return 0.0068;
        } else if (downPaymentPercent < 0.15) {
            return 0.0051;
        } else if (downPaymentPercent < 0.20) {
            return 0.0036;
        } else {
            return 0;
        }
    }

    function monthlyPaymentFromPrincipal(monthlyInterestRate, loanTerm, principal) {
        return monthlyInterestRate * principal * Math.pow(1 + monthlyInterestRate, loanTerm) / (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
    }

    function inputToNumber(input) {
        var in_nummer = Number(input.replace(/[^0-9\.]+/g, ''));
        return in_nummer;
    }

    function numberToCurrency(number) {
        return '$' + parseFloat(number).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function numberToInt(number) {
        number = parseFloat(number).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '');
        return parseInt(number);
    }

    function numberToFloat(number) {
        number = parseFloat(number);
        if (number_isInteger(number) == false) {
            number = number.toFixed(1);
        }
        return number;
    }

    function addZeroes(value) {
        var new_value = value * 1; //removes trailing zeros

        new_value = new_value + ''; //casts it to string

        var pos = new_value.indexOf('.');
        if (pos == -1) new_value = new_value + '.00'; else if (pos == -2) new_value = new_value + '.000'; else {
            var integer = new_value.substring(0, pos);
            var decimals = new_value.substring(pos + 1);
            while (decimals.length < 2) {
                decimals = decimals + '0';
            }
            new_value = integer + '.' + decimals;
        }
        return new_value;
    }

    function number_isInteger(value) {
        return typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value;
    };

    function numberToPercent(number, precision) {
        if (precision == undefined) {
            precision = 3;
        }

        var percent;

        if (number_isInteger(number)) {
            percent = parseInt(number);
            percent = percent + "%";
            return percent;
        }

        percent = parseFloat(parseFloat(number).toFixed(precision));
        percent = percent + "%";
        percent = percent.replace(',', '.');
        return percent;
    }

    function numberToExactPercent(number, precision) {
        if (precision == undefined) {
            precision = 3;
        }

        var percent;

        if (number_isInteger(number)) {
            percent = parseInt(number);
            percent = parseFloat(percent.toFixed(3)) + "%";
            return percent;
        }

        percent = parseFloat(parseFloat(number).toFixed(precision)) + "%";
        percent = percent.replace(',', '.');
        return percent;
    }

    function numberToPercentInt(number) {
        return parseInt(number);
    }

    function maskNum(x) {
        try {
            return x.toLocaleString('en-US', {
                useGrouping: 'true',
                maximumFractionDigits: 0
            });
        } catch (e) {
            console.log('Error: ' + e);
        }
    }

    function getInterestRateByState(type) {
        var loanTermInYears = parseInt(data[type].loanTermInMonth / 12);
        data[type].interestRate = data[type].userState && page_vars.mortgageRatesByState.hasOwnProperty(data[type].userState) ? Number(page_vars.mortgageRatesByState[data[type].userState]['Fixed' + loanTermInYears + 'Year']['rate']) : 0;

        /**
         * all interest rate don`t change
         * */
        if (type === 'hp') {
            $hpInterestRate.val(numberToPercent(data[type].interestRate));
        } else if (type === 'i') {
            $iInterestRate.val(numberToPercent(data[type].interestRate));
            $hpInterestRate.val(numberToPercent(data.hp.interestRate));
        } else if (type === 'mp') {
            $mpInterestRate.val(numberToPercent(data[type].interestRate));
        } else if (type === 'bw') {
            $bwInterestRate.val(numberToPercent(data[type].interestRate));
        }

        return data[type].interestRate;
    }

    function updateEstimateYears(loan_term_sel, id) {
        var cur_year = parseInt(jQuery('.estimate_year').data('year'));
        var selector = '#' + id + ' b';
        $(selector).html(cur_year + loan_term_sel);
    }

    function get_amortization(dataHp) {
        // calculation
        var data = new Array();
        var downPayment = inputToNumber($('#hp-down-payment-amount').val());
        var homePrice = inputToNumber($('#hp-loan-amount').val());
        var propertyTax = inputToNumber($('#hp-property-tax').val());
        var homeInsurance = inputToNumber($('#hp-home-insurance').val());
        var downPaymentPercent = downPayment / homePrice * 100;
        var loanAmount = homePrice - downPayment;
        var loanTermInMonth = parseFloat($('#hp-loanTermInMonths').val());
        var monthlyInterestRate = inputToNumber($('#hp-interest-rate').val()) / 1200;
        var monthlyPayment = monthlyInterestRate * loanAmount * Math.pow(1 + monthlyInterestRate, loanTermInMonth) / (Math.pow(1 + monthlyInterestRate, loanTermInMonth) - 1);
        var monthlyTax = homePrice * propertyTax / 1200;
        var monthlyInsurance = homeInsurance / 12;
        var monthlyHoa = inputToNumber($('#hp-hoa').val());
        var monthlyTotal = monthlyPayment + monthlyTax + monthlyInsurance + monthlyHoa;
        var fullPayment = monthlyPayment * loanTermInMonth;
        var fullInterest = fullPayment - loanAmount; //shedule

        var totalInterest = 0;
        var totalPrincipal = 0;
        var principalRemaining = loanAmount;
        var arr_principalRemaining = [loanAmount];
        var arr_totalPrincipal = [0];
        var arr_totalInterest = [0];
        var month;
        var interest, principal;

        for (month = 1; month <= loanTermInMonth; month++) {
            var principalInterest = monthlyPayment;
            interest = principalRemaining * monthlyInterestRate;
            totalInterest += interest;
            principal = principalInterest - interest;
            totalPrincipal += principal;
            principalRemaining = principalRemaining - principal;

            if (month % 12 == 0) {
                arr_principalRemaining.push(Math.round(Math.abs(principalRemaining)));
                arr_totalPrincipal.push(Math.round(totalPrincipal));
                arr_totalInterest.push(Math.round(totalInterest));
            }
        }

        var legend_display = false;
        if ($(window).width() < 991) legend_display = false;
        var arr_labels = $.map(Array.from(Array(dataHp.loanTermInMonth / 12 + 1)), function (element, index) {
            return index
        });
        var chartData = {
            datasets: [{
                label: 'Principal Remaining',
                data: arr_principalRemaining,
                borderColor: '#24AB4C',
                backgroundColor: '',
                fill: false,
                borderWidth: 1,
                pointRadius: 2,
                pointStyle: 'circle',
                pointHitRadius: 15,
                pointHoverBackgroundColor: '#24AB4C',
                pointHoverBorderColor: '#24AB4C',
                pointHoverBorderWidth: 2,
                pointHoverRadius: 3,
                pointRotation: 20,
                usePointStyle: true
            }, {
                label: 'Interest Paid',
                data: arr_totalInterest,
                borderColor: '#8874fa',
                backgroundColor: 'rgba(241,234,254,.5)',
                borderWidth: 1,
                pointStyle: 'circle',
                pointRadius: 2,
                pointHitRadius: 15,
                pointHoverBackgroundColor: '#8874fa',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 1,
                pointHoverRadius: 3,
                pointRotation: 20
            },
                {
                    label: 'Principal Paid',
                    data: arr_totalPrincipal,
                    borderColor: '#4064E4',
                    backgroundColor: 'rgba(242,251,255,.5)',
                    borderWidth: 1,
                    pointStyle: 'circle',
                    pointRadius: 2,
                    pointHitRadius: 15,
                    pointHoverBackgroundColor: '#4064E4',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 1,
                    pointHoverRadius: 3,
                    pointRotation: 20
                }],
            labels: arr_labels


        };

        if (!dataHp.hpChart) {
            Chart.defaults.LineWithLine = Chart.defaults.line;
            Chart.controllers.LineWithLine = Chart.controllers.line.extend({
                draw: function draw(ease) {
                    Chart.controllers.line.prototype.draw.call(this, ease);

                    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                        var activePoint = this.chart.tooltip._active[0],
                            ctx = this.chart.ctx,
                            x = activePoint.tooltipPosition().x,
                            topY = this.chart.scales['y-axis-0'].top,
                            bottomY = this.chart.scales['y-axis-0'].bottom; // draw line

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x, topY);
                        ctx.lineTo(x, bottomY);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#8B8B8B';
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            });
            Chart.defaults.global.pointHitDetectionRadius = 1;
            var mobile_width = $(window).width() > 900;

            var customTooltipsHp = function customTooltipsHp(tooltip) {
                // Tooltip Element
                var tooltipEl = document.getElementById('chartjs-tooltip1');

                if (!tooltipEl) {
                    tooltipEl = document.createElement('div');
                    tooltipEl.id = 'chartjs-tooltip1';
                    tooltipEl.innerHTML = "<table class='table_tooltip'></table>";

                    if (!mobile_width) {
                        document.getElementById('m_calc_out_tab-02').appendChild(tooltipEl);
                    } else {
                        document.body.appendChild(tooltipEl);
                    }
                } // Hide if no tooltip


                if (tooltip.opacity === 0 && mobile_width) {
                    tooltipEl.style.opacity = 0;
                    return;
                } // Set caret Position


                tooltipEl.classList.remove('above', 'below', 'no-transform');

                if (tooltip.yAlign) {
                    tooltipEl.classList.add(tooltip.yAlign);
                } else {
                    tooltipEl.classList.add('no-transform');
                }

                function getBody(bodyItem) {
                    return bodyItem.lines;
                } // Set Text


                if (tooltip.body) {
                    var titleLines = tooltip.title || [];
                    var bodyLines = tooltip.body.map(getBody);

                    var innerHtml = '<thead>';
                    titleLines.forEach(function (title) {
                        innerHtml += '<tr><th>' + title + '</th></tr>';
                    });
                    innerHtml += '</thead><tbody>';
                    bodyLines.forEach(function (body, i) {
                        var colors = tooltip.labelColors[i];
                        var style = 'background:' + colors.backgroundColor;
                        style += '; border-color:' + colors.borderColor;
                        style += '; border-width: 2px';
                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                        innerHtml += '<tr><td>' + span + body + '</td></tr>';
                    });
                    innerHtml += '</tbody>';
                    var tableRoot = tooltipEl.querySelector('table');
                    tableRoot.innerHTML = innerHtml;
                }

                var position = this._chart.canvas.getBoundingClientRect(); // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;

                var height_to_shedule = $('#hp-chart').offset().top;
                var shedule_height = $('#hp-chart').height() / 2;
                var tooltip_width = $(tooltipEl).width();
                tooltipEl.style.left = position.left + tooltip.caretX - (tooltip_width + 15) + 'px';
                var tooltip_height = $(tooltipEl).height();

                if (tooltip.caretY > shedule_height) {
                    tooltipEl.style.top = height_to_shedule + tooltip.caretY - tooltip_height + 'px';
                } else {
                    tooltipEl.style.top = height_to_shedule + tooltip.caretY + 'px';
                }

                tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
            };

            dataHp.hpChart = new Chart($('#hp-chart'), {
                type: 'LineWithLine',
                data: chartData,
                options: {
                    responsive: true,
                    usePointStyle: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Chart.js LineWithLine'
                        }
                    },
                    tooltips: {
                        enabled: false,
                        mode: 'index',
                        position: 'nearest',
                        custom: customTooltipsHp,
                        backgroundColor: '#ffffff',
                        titleFontColor: '#000000',
                        bodyFontColor: '#000000',
                        titleFont: {
                            style: 'bold',
                            size: '36'
                        },
                        bodySpacing: 4,
                        caretPadding: 8,
                        titleMarginBottom: 13,
                        padding: 100,
                        cornerRadius: 4,
                        usePointStyle: true,
                        callbacks: {
                            title: function title(tooltipItem) {
                                return 'Year ' + tooltipItem[0].index;
                            },
                            label: function label(tooltipItem, data) {
                                var label = data.datasets[tooltipItem.datasetIndex].label + ': ';
                                label += '<b>$ ' + Math.round(tooltipItem.yLabel).toLocaleString('en') + '</b>';
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: legend_display,
                        position: 'bottom',
                        labels: {
                            boxWidth: 0,
                            boxHeight: 0,
                            padding: 30,
                            fontSize: 16,
                            pointStyle: 'circle',
                            fontColor: '#000000',
                            usePointStyle: 'true',
                            color: 'rgb(255, 99, 132)'
                        }
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                labelString: 'Length of Loan (loan)'
                            },
                            gridLines: {
                                drawOnChartArea: false,
                                borderDashOffset: 3
                            },
                            ticks: {
                                maxRotation: 0,
                                callback: function callback(value, index) {
                                    if(($(window).width() < 767) && (arr_labels.length > 20)){
                                        if (index % 3 === 0) return value;
                                    } else {
                                        if (index % 2 !== 0) return value;
                                    }
                                },
                                beginAtZero: true
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                drawOnChartArea: false
                            },
                            position: 'right',
                            ticks: {
                                callback: function callback(value) {
                                    return '  $' + (value > 999 ? value / 1000 + 'k' : value);
                                },
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        } else {
            dataHp.hpChart.data = chartData;
            dataHp.hpChart.update();
        }

    }

    function get_amortizationBw() {
        // calculation
        var data = new Array();
        var downPayment = inputToNumber($('#bw-down-payment-amount').val());
        var homePrice = inputToNumber($('#bw-loan-amount').val());
        var propertyTax = inputToNumber($('#bw-property-tax').val());
        var homeInsurance = inputToNumber($('#bw-home-insurance').val());
        var downPaymentPercent = downPayment / homePrice * 100;
        var loanAmount = homePrice - downPayment;
        var loanTermInMonth = $('#bw-loanTermInMonths').val();
        var loanTerm = $('#bw-loanTermInMonths').val() / 12;
        var monthlyInterestRate = inputToNumber($('#bw-interest-rate').val()) / 1200;
        var monthlyPayment = monthlyInterestRate * loanAmount * Math.pow(1 + monthlyInterestRate, loanTermInMonth) / (Math.pow(1 + monthlyInterestRate, loanTermInMonth) - 1);
        var monthlyTax = propertyTax / 12;
        var monthlyInsurance = homeInsurance / 12;
        var monthlyHoa = inputToNumber($('#bw-hoa').val());
        var monthlyTotal = monthlyPayment + monthlyTax + monthlyInsurance + monthlyHoa;
        var fullPayment = monthlyPayment * loanTermInMonth;
        var fullInterest = fullPayment - loanAmount;
        var bw_times = 0; //shedule

        var totalInterest = 0;
        var totalInterestBw = 0;
        var totalPrincipal = 0;
        var totalPrincipalBw = 0;
        var principalRemaining = loanAmount;
        var principalRemainingBw = loanAmount;
        var arr_principalRemaining = [loanAmount];
        var arr_principalRemainingBw = [loanAmount];
        var month;
        var interest, principal, interestBw, principalBw;

        if (monthlyInterestRate > 0) {
            for (month = 1; month <= loanTermInMonth; month++) {
                var principalInterest = monthlyPayment;
                interest = principalRemaining * monthlyInterestRate;
                totalInterest += interest;
                principal = principalInterest - interest;
                totalPrincipal += principal;
                principalRemaining = principalRemaining - principal;

                if (month % 12 == 0) {
                    arr_principalRemaining.push(Math.round(principalRemaining));
                }
            }
        }

        var biweeklyPayment = monthlyPayment / 2;
        var biweeklyInterestRate = inputToNumber($('#bw-interest-rate').val()) / 36525 * 14;
        var n = parseInt(365.25 / 14),
            e = Math.ceil(365.25 * loanTerm / 14);
        var all = 0;

        if (biweeklyInterestRate > 0) {
            for (var bw_items = 1; bw_items <= e; bw_items++) {
                var bwPrincipalInterest = biweeklyPayment;
                all += biweeklyPayment;
                interestBw = principalRemainingBw * biweeklyInterestRate;
                totalInterestBw += interestBw;
                principalBw = bwPrincipalInterest - interestBw;
                totalPrincipalBw += principalBw;
                principalRemainingBw = Math.max(0, principalRemainingBw - principalBw);
                arr_principalRemainingBw.push(Math.round(principalRemainingBw));

                if (principalRemainingBw <= 0) {
                    break;
                }
                bw_times = bw_items;
            }
        }


        var bw_years = (bw_times * 14 / 365.25).toFixed(1);
        $('#biweekly_interest_saving').html(numberToCurrency(totalInterest - totalInterestBw));
        $('#bw-output-home-price').html(numberToCurrency(totalInterest - totalInterestBw));
        $('#monthly_monthly_payment').html(numberToCurrency(monthlyPayment));
        $('#biweekly_monthly_payment').html(numberToCurrency(monthlyPayment / 2));
        $('#biweekly_total_interest').html(numberToCurrency(totalInterestBw));
        $('#monthly_total_interest').html(numberToCurrency(totalInterest));
        $('#biweekly_term').html(bw_years + ' years');
        $('#monthly_term').html(numberToCurrency(loanTerm) + ' years');
        var bw_to_year_array = [];
        arr_principalRemainingBw.forEach(function (el, index) {
            if (index % 26 == 0) {
                bw_to_year_array.push(el);
            }
        });
        bw_to_year_array.push(0);
        var arr_chart_bw = [arr_principalRemaining, bw_to_year_array];
        return arr_chart_bw;
    }

    var table_monthly_slider = $('.tables_slider');

    function get_month_of_pay(line_month) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var d = new Date();
        var datamonth = new Object();
        var monthNum = d.getMonth();
        var index_m = 0;

        if (line_month + monthNum >= 12) {
            index_m = monthNum + line_month - 12;
        } else {
            index_m = monthNum + line_month;
        }

        datamonth = {
            text: months[index_m],
            month: index_m
        };
        return datamonth;
    }

    function get_year_of_pay(cur_month, year) {
        var d = new Date();
        var dataYear = 0;
        var yearNum = d.getFullYear();
        var monthNum = d.getMonth();

        if (cur_month <= monthNum) {
            dataYear = yearNum + year;
        } else {
            dataYear = yearNum + year - 1;
        }

        return dataYear;
    }

    function get_amortizationMp(data_mp) {
        if ($('#table_monthly_content').html().length > 0) {
            destoy_slick();
            $('#table_monthly_content').html('');
        }

        var monthlyInterestRate = data_mp.interestRate / 1200;
        var totalInterest = 0,
            totalPrincipal = 0,
            principalRemaining = data_mp.loanAmount - data_mp.downPayment,
            year = 0,
            years = 0,
            monthof_pay = '',
            yearof_pay = '',
            interest,
            principal,
            annaual_html_mp = '',
            yearPrincipalInterest = 0,
            yearPrincipal = 0,
            yearInterest = 0,
            principalInterest = 0;
        annaual_html_mp += '<div class="outer"><div class="inner"><div class="mortgage_report__shedule-table-info"><p>Use a finger to move the table</p><a href="#close" class="close"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#F7F7FB"/><path d="M14 6L6 14" stroke="#7991B6" stroke-width="1.5"/><path d="M6 6L14 14" stroke="#7991B6" stroke-width="1.5"/></svg></a></div><table class="amortization-table"><thead><tr><th>Year</th><th>Principal and Interest</th><th>Principal</th><th>Interest</th><th>Principal Remaining</th><th>Total Interest</th></tr></thead><tbody>';

        for (var month = 1; month <= data_mp.loanTermInMonth; month++) {
            principalInterest = data_mp.principalAndInterest;

            if (month % 12 == 1) {
                year++;
                var open_html = '<div class="item"><div class="outer"><div class="inner"><div class="mortgage_report__shedule-table-info"><p>Use a finger to move the table</p><a href="#close" class="close"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#F7F7FB"/><path d="M14 6L6 14" stroke="#7991B6" stroke-width="1.5"/><path d="M6 6L14 14" stroke="#7991B6" stroke-width="1.5"/></svg></a></div><table class="amortization-table"><thead><tr><th>Month</th><th>Principal and Interest</th><th>Principal</th><th>Interest</th><th>Principal Remaining</th><th>Total Interest</th></tr></thead><tbody id ="cur_year_' + year + '">';
                var closs_html = '</tbody></table></div></div></div>';
                $('#table_monthly_content').append(open_html + closs_html);
            }

            var line_month = month - (year - 1) * 12;
            monthof_pay = get_month_of_pay(line_month);
            yearof_pay = get_year_of_pay(monthof_pay.month, year); // calculating table

            interest = principalRemaining * monthlyInterestRate;

            if (data_mp.epToYourMonthlyPayment > 0) {
                principalInterest = Math.min(principalRemaining + interest, principalInterest + data_mp.epToYourMonthlyPayment);
            }

            if (data_mp.epAsAnExtraYearlyPayment > 0 && monthof_pay.month == data_mp.epOccurringEvery - 1) {
                principalInterest = Math.min(principalRemaining + interest, principalInterest + data_mp.epAsAnExtraYearlyPayment);
            }

            if (data_mp.epAsOneTimePaymentIn > 0 && monthof_pay.month == data_mp.epAsOneTimePaymentMonth - 1 && yearof_pay == data_mp.epAsOneTimePaymentYear - 0) {
                principalInterest = Math.min(principalRemaining + interest, principalInterest + data_mp.epAsOneTimePaymentIn);
            }

            totalInterest += interest;
            principal = principalInterest - interest;
            totalPrincipal += principal;
            principalRemaining = Math.max(0, principalRemaining - principal);
            yearPrincipalInterest += principalInterest;
            yearPrincipal += principal;
            yearInterest += interest;
            $('#table_monthly_content').find('#cur_year_' + year).append('<tr><td>' + monthof_pay.text + ' ' + yearof_pay + '</td><td>' + numberToCurrency(principalInterest) + '</td><td>' + numberToCurrency(principal) + '</td><td>' + numberToCurrency(interest) + '</td><td>' + numberToCurrency(principalRemaining) + '</td><td>' + numberToCurrency(totalInterest) + '</td></tr>');

            if (month % 12 == 0 || principalRemaining == 0) {
                years++;
                annaual_html_mp += '<tr><td>' + years + '</td><td>' + numberToCurrency(yearPrincipalInterest) + '</td><td>' + numberToCurrency(yearPrincipal) + '</td><td>' + numberToCurrency(yearInterest) + '</td><td>' + numberToCurrency(principalRemaining) + '</td><td>' + numberToCurrency(totalInterest) + '</td></tr>';
                yearPrincipalInterest = 0;
                yearPrincipal = 0;
                yearInterest = 0;
            }

            if (principalRemaining == 0) {
                break;
            }
        }

        $('#cur_slide_count').html(years + ' Year');
        annaual_html_mp += '</tbody></table></div></div>';
        $('#annual-content').html(annaual_html_mp); // slider update
        // monthly payment tab shedule

        function check_cur_slick_pos() {
            var cur_pos = $('li.slick-active button').html();
            var last_pos = $('.slick-dots li:last button').html();
            $('#cur_slide_num').html(cur_pos);

            if (cur_pos == last_pos) {
                $('.cust_slick_nav .next').addClass('not_active');
            } else {
                $('.cust_slick_nav .next').removeClass('not_active');
            }

            if (cur_pos == '1') {
                $('.cust_slick_nav .prev').addClass('not_active');
            } else {
                $('.cust_slick_nav .prev').removeClass('not_active');
            }
        }

        $('.cust_slick_nav .next').click(function (e) {
            e.preventDefault();
            $('.slick-next.slick-arrow').trigger('click');
            check_cur_slick_pos();
        });
        $('.cust_slick_nav .prev').click(function (e) {
            e.preventDefault();
            $('.slick-prev.slick-arrow').trigger('click');
            check_cur_slick_pos();
        });
        update_slick_slider(); // slider updated
    }

    function destoy_slick() {
        table_monthly_slider.slick("unslick");
    }

    function update_slick_slider() {
        table_monthly_slider.slick({
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            adaptiveHeight: true,
            touchMove: false,
            swipe: false
        });
        $('#cur_slide_num').html('1');
    }

    $('.table_tabs_item').click(function (e) {
        e.preventDefault();

        if ($(this).hasClass('active')) {
            return;
        }

        $('.table_tabs_item.active').removeClass('active');
        $('.table_content > div.active').removeClass('active');
        $(this).addClass('active');
        $('.table_content #' + $(this).data('tab')).addClass('active');
        $('.tables_slider').slick('refresh');
    });
    /**
     * Loan Term Switchers
     */

    $('#hp-loanTermInMonths').on('change', function (e) {
        e.preventDefault();
        var loanTermInMonth = $(this).val();
        data.hp.loanTermInMonth = loanTermInMonth;
        calculateByHomePrice();
        updateEstimateYears(loanTermInMonth / 12, 'hp-est');
    });

    $('#i-loanTermInMonths').on('change', function (e) {
        e.preventDefault();
        var loanTermInMonth = $(this).val();
        data.i.loanTermInMonth = loanTermInMonth;
        calculateByIncome();
        updateEstimateYears(loanTermInMonth / 12, 'i-est');
    });

    $('#mp-loanTermInMonths').on('change', function (e) {
        e.preventDefault();
        var loanTermInMonth = $(this).val();
        data.mp.loanTermInMonth = loanTermInMonth;
        calculateByMonthlyPayment();
        updateEstimateYears(loanTermInMonth / 12, 'mp-est');
    });

    $('#bw-loanTermInMonths').on('change', function (e) {
        e.preventDefault();
        var loanTermInMonth = $(this).val();
        data.bw.loanTermInMonth = loanTermInMonth;
        calculateBiWeeklyPayment();
    });

    /**
     * By Home Price Calculator
     */

    function calculateByHomePrice(amortization) {
        if (fieldsErrorHp()) return false;

        if (typeof data.hp.customRate == 'undefined' || data.hp.customRate == false) {
            getInterestRateByState('hp');
        }

        var monthlyInterestRate = data.hp.interestRate / 1200,
            monthlyHomeInsurance = data.hp.homeInsurance / 12;
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment,
            principalAndInterest;

        if (data.hp.downPaymentType == 'percent') {
            downPaymentPercent = data.hp.downPaymentPercent / 100;
            data.hp.downPayment = downPaymentPercent * data.hp.loanAmount;
            principalAmount = data.hp.loanAmount - data.hp.downPayment;
            pmiPayment = principalAmount * getPMIPercent(data.hp.downPayment / data.hp.loanAmount) / 12;
            principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.hp.loanTermInMonth, principalAmount);
        } else {
            do {
                principalAmount = data.hp.loanAmount - data.hp.downPayment;
                pmiPayment = principalAmount * getPMIPercent(data.hp.downPayment / data.hp.loanAmount) / 12;
                downPaymentPercent = data.hp.downPayment / data.hp.loanAmount;
                principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.hp.loanTermInMonth, principalAmount);
            } while (pmiPayment < getPMIPercent(downPaymentPercent));

            if (downPaymentPercent > 0.99) {
                data.hp.downPaymentType = 'percent';
                downPaymentPercent = 0.99;
                data.hp.downPayment = data.hp.loanAmount * downPaymentPercent;
                principalAmount = data.hp.loanAmount - data.hp.downPayment;
                pmiPayment = principalAmount * getPMIPercent(data.hp.downPayment / data.hp.loanAmount) / 12;
                principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.hp.loanTermInMonth, principalAmount);
            }
        }

        data.hp.monthlyPayment = pmiPayment + data.hp.propertyTax + monthlyHomeInsurance + principalAndInterest + data.hp.hoa;
        data.hp.downPaymentPercent = downPaymentPercent * 100;
        $('#hp-down-payment-amount').val(numberToCurrency(data.hp.downPayment));
        $('#hp-down-payment-percent').val(numberToPercent(data.hp.downPaymentPercent, 2));
        $('#pb-principal_and_interest').html(numberToCurrency(principalAndInterest));
        $('#pb-private_mortgage_insurance').html(numberToCurrency(pmiPayment));
        $('#pb-property_tax').html(numberToCurrency(data.hp.propertyTax));
        $('#pb-homeowners_insurance').val(numberToPercentInt(monthlyHomeInsurance));
        $('#pb-hoa_other').val(numberToPercentInt(data.hp.hoa));
        /* calculateByHomePrice lines */

        var proc_principalAndInterest = numberToInt(principalAndInterest);
        var proc_pmiPayment = numberToInt(pmiPayment);
        var proc_propertyTax = numberToInt(data.hp.propertyTax);
        var proc_monthlyHomeInsurance = numberToInt(monthlyHomeInsurance);
        var proc_hoa = numberToInt(data.hp.hoa);
        var sumByHomePrice = proc_principalAndInterest + proc_pmiPayment + proc_propertyTax + proc_monthlyHomeInsurance + proc_hoa;
        $('#hp-mortgage-calculator-title').html(numberToCurrency(sumByHomePrice));
        $('#line-pb-principal_and_interest .line b').css('width', parseInt(proc_principalAndInterest / sumByHomePrice * 100) + '%');
        $('#line-pb-private_mortgage_insurance .line b').css('width', parseInt(proc_pmiPayment / sumByHomePrice * 100) + '%');
        $('#line-pb-property_tax .line b').css('width', parseInt(proc_propertyTax / sumByHomePrice * 100) + '%');
        $('#line-pb-homeowners_insurance .line b').css('width', parseInt(proc_monthlyHomeInsurance / sumByHomePrice * 100) + '%');
        $('#line-pb-hoa_other .line b').css('width', parseInt(proc_hoa / sumByHomePrice * 100) + '%');
        updateEstimateYears(data.hp.loanTermInMonth / 12, 'hp-est');

        data.hp.calculated = true;
        data.hp.calculated_first_time = false;

        if (amortization !== false) {
            get_amortization(data.hp);
        }
    }

    $('#hp-loan-amount').on('change', function () {
        if (fieldsErrorHp()) return false;
        data.hp.loanAmount = inputToNumber($(this).val());

        updateRange($(this));
        $(this).val(numberToCurrency(data.hp.loanAmount));

        $('#hp-down-payment-amount').attr('max', data.hp.loanAmount * 0.99)

        data.hp.downPayment = data.hp.loanAmount * data.hp.downPaymentPercent / 100;

        if (data.hp.downPayment > data.hp.loanAmount) {
            data.hp.downPayment = data.hp.loanAmount;
            data.hp.downPaymentPercent = 99;
            $("#hp-down-payment-percent").val(numberToPercent(data.hp.downPaymentPercent));
        }

        $('#hp-down-payment-amount').val(numberToCurrency(data.hp.downPayment));

        if (!data.hp.propertyTaxManual) {
            data.hp.propertyTaxPercent = getTaxRateByState(data.hp.userState);
            data.hp.propertyTax = data.hp.loanAmount * getTaxRateByState(data.hp.userState) / 1200;
            $('#hp-property-tax').val(numberToPercent(data.hp.propertyTaxPercent));
            $('#pb-property-tax').val(numberToPercent(data.hp.propertyTax));
        } else {
            data.hp.propertyTax = data.hp.loanAmount * data.hp.propertyTaxPercent / 1200;
            $('#pb-property-tax').val(numberToPercent(data.hp.propertyTax));
        }

        calculateByHomePrice();
    });
    $('#hp-down-payment-amount').on('change', function () {

        if (fieldsErrorHp()) return false;
        data.hp.downPaymentType = 'amount';
        data.hp.downPayment = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.hp.downPayment));

        var monthlyInterestRate = data.hp.interestRate / 1200,
            monthlyHomeInsurance = data.hp.homeInsurance / 12;
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment,
            principalAndInterest;
        do {
            principalAmount = data.hp.loanAmount - data.hp.downPayment;
            pmiPayment = principalAmount * getPMIPercent(data.hp.downPayment / data.hp.loanAmount) / 12;
            downPaymentPercent = data.hp.downPayment / data.hp.loanAmount;
            principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.hp.loanTermInMonth, principalAmount);
        } while (pmiPayment < getPMIPercent(downPaymentPercent));

        data.hp.downPaymentPercent = parseFloat(data.hp.downPayment / data.hp.loanAmount * 100).toFixed(3);
        data.hp.monthlyPayment = pmiPayment + data.hp.propertyTax + monthlyHomeInsurance + principalAndInterest + data.hp.hoa;
        data.hp.downPaymentPercent = downPaymentPercent * 100;
        $('#hp-down-payment-amount').val(numberToCurrency(data.hp.downPayment));
        $('#hp-down-payment-percent').val(numberToPercent(data.hp.downPaymentPercent, 2)).trigger('change');
        calculateByHomePrice();
    });
    $('#hp-down-payment-percent').on('change', function () {
        if (fieldsErrorHp()) {
            return false;
        }
        data.hp.downPaymentType = 'percent';
        data.hp.downPaymentPercent = inputToNumber($(this).val());

        if (data.hp.downPaymentPercent > 99) {
            data.hp.downPaymentPercent = 99;
        }

        $(this).closest('.field').find('.ui-slider-range').css('width', data.hp.downPaymentPercent + '%');
        $(this).closest('.field').find('.ui-slider-handle').css('left', data.hp.downPaymentPercent + '%');

        var monthlyInterestRate = data.hp.interestRate / 1200,
            monthlyHomeInsurance = data.hp.homeInsurance / 12;
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment,
            principalAndInterest;
        $(this).val(numberToPercent(data.hp.downPaymentPercent));
        downPaymentPercent = data.hp.downPaymentPercent / 100;
        data.hp.downPayment = downPaymentPercent * data.hp.loanAmount;
        principalAmount = data.hp.loanAmount - data.hp.downPayment;
        pmiPayment = principalAmount * getPMIPercent(data.hp.downPayment / data.hp.loanAmount) / 12;
        principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.hp.loanTermInMonth, principalAmount);
        data.hp.monthlyPayment = pmiPayment + data.hp.propertyTax + monthlyHomeInsurance + principalAndInterest + data.hp.hoa;
        data.hp.downPaymentPercent = downPaymentPercent * 100;
        data.hp.downPayment = data.hp.downPaymentPercent * data.hp.loanAmount / 100;
        $('#hp-down-payment-amount').val(numberToCurrency(data.hp.downPayment));
        $('#hp-down-payment-percent').val(numberToPercent(data.hp.downPaymentPercent, 2));
        calculateByHomePrice();
    });
    $('#hp-state').on('change', function () {
        data.hp.userState = $(this).val();
        data.hp.propertyTaxManual = false;
        data.hp.propertyTaxPercent = getTaxRateByState(data.hp.userState);
        data.hp.propertyTax = data.hp.loanAmount * getTaxRateByState(data.hp.userState) / 1200;
        $('#hp-property-tax').val(numberToPercent(data.hp.propertyTaxPercent));
        $('#pb-property_tax').val(numberToPercent(data.hp.propertyTax));
        calculateByHomePrice();
    });
    $('#hp-interest-rate').on('change', function () {
        if (fieldsErrorHp()) {
            return false;
        }
        data.hp.interestRate = Math.max(Math.min(inputToNumber($(this).val()), 100), 0.001);
        data.hp.customRate = true;
        $(this).val(numberToExactPercent(data.hp.interestRate));
        calculateByHomePrice();
    });

    $('#hp-property-tax').on('change', function () {
        if (fieldsErrorHp()) {
            return false;
        }
        data.hp.propertyTaxManual = true;
        data.hp.propertyTaxPercent = inputToNumber($(this).val());
        if (data.hp.propertyTaxPercent > 99) {
            data.hp.propertyTaxPercent = 99;
        }
        data.hp.propertyTax = data.hp.loanAmount * data.hp.propertyTaxPercent / 1200;
        $(this).val(numberToPercent(data.hp.propertyTaxPercent));
        $('#pb-property_tax').val(numberToPercent(data.hp.propertyTax));

        if (!data.hp.calculated_first_time) {
            calculateByHomePrice();
        }
    });

    $('#hp-home-insurance').on('change', function () {
        data.hp.homeInsurance = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.hp.homeInsurance));
        calculateByHomePrice();
    });
    $('#hp-hoa').on('change', function () {
        data.hp.hoa = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.hp.hoa));
        calculateByHomePrice();
    });
    /* line change  */

    $('#pb-homeowners_insurance').on('change', function () {
        data.hp.homeInsurance = 12 * inputToNumber($(this).val());
        $('#hp-home-insurance').val(numberToCurrency(data.hp.homeInsurance));
        calculateByHomePrice();
    });
    $('#pb-hoa_other').on('change', function () {
        data.hp.hoa = inputToNumber($(this).val());
        $('#hp-hoa').val(numberToCurrency(data.hp.hoa));
        calculateByHomePrice();
    });
    $('#affpb-homeowners_insurance').on('change', function () {
        data.i.homeInsurance = 12 * inputToNumber($(this).val());
        $('#i-home-insurance').val(numberToCurrency(data.i.homeInsurance));
        calculateByIncome();
    });
    $('#affpb-hoa_other').on('change', function () {
        data.i.hoa = inputToNumber($(this).val());
        $('#i-hoa').val(numberToCurrency(data.i.hoa));
        calculateByIncome();
    });
    $('#bmppb-homeowners_insurance').on('change', function () {
        data.mp.homeInsurance = 12 * inputToNumber($(this).val());
        $('#mp-home-insurance').val(numberToCurrency(data.mp.homeInsurance));
        calculateByMonthlyPayment();
    });
    $('#bmppb-hoa_other').on('change', function () {
        data.mp.hoa = inputToNumber($(this).val());
        $('#mp-hoa').val(numberToCurrency(data.mp.hoa));
        calculateByMonthlyPayment();
    });
    /* line change  end  */

    $('#hp-amortization-report').on('click contextmenu', function (e) {
        e.preventDefault();
        var args = {
                hp: Math.round(data.hp.loanAmount),
                dp: Math.round(data.hp.downPayment),
                lt: data.hp.loanTermInMonth,
                tr: parseFloat((data.hp.propertyTax * 1200 / data.hp.loanAmount).toFixed(2)),
                yi: data.hp.homeInsurance,
                hoa: data.hp.hoa,
                ir: data.hp.interestRate
            },
            url = $(this).attr('href') + '?' + $.param(args);
        window.open(url);
        return false;
    });

    /**
     * By Income Calculator
     */

    function calculateByIncome() {
        if (fieldsErrorAff()) return false;
        if (typeof data.i.customRate == 'undefined' || data.i.customRate == false) {
            getInterestRateByState('i');
        }
        var monthlyHomeInsurance = data.i.homeInsurance / 12,
            monthlyPayment = data.i.income * data.i.data_type / 12 * (data.i.debtToIncome / 100) - data.i.monthlyDebts - data.i.hoa - monthlyHomeInsurance,
            monthlyInterestRate = data.i.interestRate / 1200,
            monthlyPropertyTax = data.i.propertyTaxPercent / 1200,
            downPaymentPercent = data.i.downPaymentPercent / 100,
            PMI = getPMIPercent(downPaymentPercent),
            loanAmount = homePriceFromMonthlyPayment(monthlyPayment, monthlyInterestRate, data.i.loanTermInMonth, monthlyPropertyTax, downPaymentPercent, PMI / 12),
            downPayment = downPaymentPercent * loanAmount;
        data.i.propertyTax = loanAmount * monthlyPropertyTax;
        var
            monthlyPropertyTaxPayment = data.i.propertyTax,
            principalAmount = loanAmount * (1 - downPaymentPercent),
            principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.i.loanTermInMonth, principalAmount),
            pmiPayment = principalAmount * PMI / 12;
        data.i.propertyTaxCurrency = monthlyPropertyTaxPayment;
        data.i.loanAmount = loanAmount;
        data.i.monthlyPayment = monthlyPayment;
        data.i.downPayment = downPayment;
        var afford_summa = pmiPayment + monthlyPropertyTaxPayment + monthlyHomeInsurance + principalAndInterest + data.i.hoa;
        $('#i-output-home-price').html(numberToCurrency(data.i.loanAmount));
        $('#i-down-payment-amount').attr('max', parseInt(data.i.loanAmount * 0.99));
        $('#i-monthly-debts').attr('max', parseInt(afford_summa));
        $('#i-output-home-price_input').val(numberToCurrency(data.i.loanAmount));
        $('#i-output-monthly-payment').html(numberToCurrency(afford_summa));
        $('#range-monthly-payment span.price').html(numberToCurrency(afford_summa) + '/mo');
        $('#affpb-principal_and_interest').html(numberToCurrency(principalAndInterest));
        $('#affpb-private_mortgage_insurance').html(numberToCurrency(pmiPayment));
        $('#affpb-property_tax').html(numberToCurrency(monthlyPropertyTaxPayment));
        $('#affpb-homeowners_insurance').val(numberToPercentInt(monthlyHomeInsurance));
        $('#affpb-hoa_other').val(numberToPercentInt(data.i.hoa));
        $('#l-aff-pb-principal_and_interest .line b').css('width', parseInt(principalAndInterest / afford_summa * 100) + '%');
        $('#l-aff-pb-property_tax .line b').css('width', parseInt(monthlyPropertyTaxPayment / afford_summa * 100) + '%');
        $('#l-aff-pb-private_mortgage_insurance .line b').css('width', parseInt(pmiPayment / afford_summa * 100) + '%');
        $('#l-aff-pb-homeowners_insurance .line b').css('width', parseInt(monthlyHomeInsurance / afford_summa * 100) + '%');
        $('#l-aff-pb-hoa_other .line b').css('width', parseInt(data.i.hoa / afford_summa * 100) + '%');
        updateEstimateYears(data.i.loanTermInMonth / 12, 'i-est');
        data.i.calculated = true;
    } /// affordability


    $('#i-income').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.income = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.i.income));
        calculateByIncome();
    });
    $('#i-date-type').on('change', function () {
        data.i.data_type = $(this).val();
        calculateByIncome();
    });
    $('#i-monthly-debts').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.monthlyDebts = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.i.monthlyDebts));
        calculateByIncome();
    });
    $('#i-debt-to-income').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.debtToIncome = inputToNumber($(this).val());
        $(this).val(numberToPercent(data.i.debtToIncome));
        $("#aff_Range").val(numberToPercent(data.i.debtToIncome));
        afford_range_change(data.i.debtToIncome, 0);
        calculateByIncome();
    });
    $('#i-state').on('change', function () {
        data.i.userState = $(this).val();
        data.i.propertyTaxPercent = getTaxRateByState(data.i.userState);
        $('#i-property-tax').val(numberToPercent(data.i.propertyTaxPercent));
        calculateByIncome();
    });
    $('#i-interest-rate').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.interestRate = Math.max(Math.min(inputToNumber($(this).val()), 100), 0.001);
        data.i.customRate = true;
        $(this).val(numberToExactPercent(data.i.interestRate));
        calculateByIncome();
    });

    $('#i-down-payment-amount').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.downPayment = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.i.downPayment));
        var monthlyPropertyTax = data.i.propertyTaxPercent / 1200,
            monthlyInterestRate = data.i.interestRate / 1200;
        var downPaymentPercent = 0.20,
            PMI,
            loanAmount;

        do {
            PMI = getPMIPercent(downPaymentPercent);
            loanAmount = homePriceFromMonthlyPaymentDownPaymentAmount(data.i.monthlyPayment, monthlyInterestRate, data.i.loanTermInMonth, monthlyPropertyTax, data.i.downPayment, PMI / 12);
            downPaymentPercent = data.i.downPayment / loanAmount;
        } while (PMI < getPMIPercent(downPaymentPercent));

        data.i.downPaymentPercent = parseFloat(downPaymentPercent * 100).toFixed(3);
        $('#i-down-payment-percent').val(numberToPercent(data.i.downPaymentPercent));
        calculateByIncome();
    });
    $('#i-down-payment-percent').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.downPaymentPercent = inputToNumber($(this).val());

        if (data.i.downPaymentPercent > 99) {
            data.i.downPaymentPercent = 99;
        }

        $(this).val(numberToPercent(data.i.downPaymentPercent));
        var downPaymentPercent = data.i.downPaymentPercent / 100,
            monthlyPropertyTax = data.i.propertyTaxPercent / 1200,
            monthlyInterestRate = data.i.interestRate / 1200,
            PMI = getPMIPercent(downPaymentPercent),
            loanAmount = homePriceFromMonthlyPayment(data.i.monthlyPayment, monthlyInterestRate, data.i.loanTermInMonth, monthlyPropertyTax, downPaymentPercent, PMI / 12);
        data.i.downPayment = data.i.downPaymentPercent * loanAmount;
        $('#i-down-payment-amount').val(numberToCurrency(data.i.downPayment));
        calculateByIncome();
    });
    $('#i-property-tax').on('change', function () {
        if (fieldsErrorAff()) {
            return false;
        }
        data.i.propertyTaxPercent = inputToNumber($(this).val());
        $(this).val(numberToPercent(data.i.propertyTaxPercent));
        calculateByIncome();
    });

    $('#i-home-insurance').on('change', function () {
        data.i.homeInsurance = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.i.homeInsurance));
        calculateByIncome();
    });
    $('#i-hoa').on('change', function () {
        data.i.hoa = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.i.hoa));
        calculateByIncome();
    });
    $('#i-amortization-report').on('click', function (e) {
        e.preventDefault();
        var args = {
                hp: Math.round(data.i.loanAmount),
                dp: Math.round(data.i.downPayment),
                lt: data.i.loanTermInMonth,
                tr: data.i.propertyTaxPercent,
                yi: data.i.homeInsurance,
                hoa: data.i.hoa,
                ir: data.i.interestRate
            },
            url = $(this).attr('href') + '?' + $.param(args);
        window.open(url);
        return false;
    });

    /**
     * By Monthly Payment Calculator
     */

    function calculateByMonthlyPayment(amortization) {
        if (fieldsErrorMp()) return false;

        if (typeof data.mp.customRate == 'undefined' || data.mp.customRate == false) {
            getInterestRateByState('mp');
        }
        var monthlyHomeInsurance = data.mp.homeInsurance / 12,
            monthlyPayment = data.mp.monthlyPayment - data.mp.hoa - monthlyHomeInsurance,
            monthlyInterestRate = data.mp.interestRate / 1200,
            monthlyPropertyTax = data.mp.propertyTaxPercent / 1200;
        var downPaymentPercent = 0,
            PMI;

        if (data.mp.downPaymentType == 'percent') {
            downPaymentPercent = data.mp.downPaymentPercent / 100;
            PMI = getPMIPercent(downPaymentPercent);
            data.mp.loanAmount = homePriceFromMonthlyPayment(monthlyPayment, monthlyInterestRate, data.mp.loanTermInMonth, monthlyPropertyTax, downPaymentPercent, PMI / 12);
            data.mp.downPayment = downPaymentPercent * data.mp.loanAmount;
        } else {
            do {
                PMI = getPMIPercent(downPaymentPercent);
                data.mp.loanAmount = homePriceFromMonthlyPaymentDownPaymentAmount(monthlyPayment, monthlyInterestRate, data.mp.loanTermInMonth, monthlyPropertyTax, data.mp.downPayment, PMI / 12);
                downPaymentPercent = data.mp.downPayment / data.mp.loanAmount;
            } while (PMI < getPMIPercent(downPaymentPercent));

            if (downPaymentPercent > 0.99) {
                data.mp.downPaymentType = 'percent';
                downPaymentPercent = 0.99;
                PMI = getPMIPercent(downPaymentPercent);
                data.mp.loanAmount = homePriceFromMonthlyPayment(monthlyPayment, monthlyInterestRate, data.mp.loanTermInMonth, monthlyPropertyTax, downPaymentPercent, PMI / 12);
            }
        }

        var monthlyPropertyTaxPayment = data.mp.loanAmount * monthlyPropertyTax,
            principalAmount = data.mp.loanAmount * (1 - downPaymentPercent),
            pmiPayment = principalAmount * PMI / 12;
        data.mp.principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.mp.loanTermInMonth, principalAmount);
        data.mp.downPaymentPercent = downPaymentPercent * 100;
        var afford_summa = pmiPayment + monthlyPropertyTaxPayment + monthlyHomeInsurance + data.mp.principalAndInterest + data.mp.hoa;
        $('#mp-down-payment-amount').val(numberToCurrency(data.mp.downPayment));
        $('#mp-down-payment-percent').val(numberToPercent(data.mp.downPaymentPercent, 2));
        $('#mp-output-home-price').html(numberToCurrency(data.mp.loanAmount));
        $('#mp-down-payment-amount').attr('max', parseInt(data.mp.loanAmount));
        $('#mp-ot-monthly-payment').attr('max', parseInt(data.mp.loanAmount));
        $('#mp-eyp-monthly-payment').attr('max', parseInt(data.mp.loanAmount / (data.mp.loanTermInMonth / 12)));
        $('#mp-ty-monthly-payment').attr('max', parseInt(data.mp.loanAmount - data.mp.monthlyPayment));
        $('#mp-output-monthly-payment').html('$' + numberToCurrency(afford_summa));
        $('#bmppb-principal_and_interest').html('' + numberToCurrency(data.mp.principalAndInterest));
        $('#bmppb-private_mortgage_insurance').html('' + numberToCurrency(pmiPayment));
        $('#bmppb-property_tax').html(numberToCurrency(monthlyPropertyTaxPayment));
        $('#bmppb-homeowners_insurance').val(numberToPercentInt(monthlyHomeInsurance));
        $('#bmppb-hoa_other').val(numberToPercentInt(data.mp.hoa));
        $('#l-bmp-pb-principal_and_interest .line b').css('width', parseInt(data.mp.principalAndInterest / afford_summa * 100) + '%');
        $('#l-bmp-pb-private_mortgage_insurance .line b').css('width', parseInt(pmiPayment / afford_summa * 100) + '%');
        $('#l-bmp-pb-property_tax .line b').css('width', parseInt(monthlyPropertyTaxPayment / afford_summa * 100) + '%');
        $('#l-bmp-pb-homeowners_insurance .line b').css('width', parseInt(monthlyHomeInsurance / afford_summa * 100) + '%');
        $('#l-bmp-pb-hoa_other .line b').css('width', parseInt(data.mp.hoa / afford_summa * 100) + '%');
        data.mp.calculated = true;

        if (amortization !== false) {
            get_amortizationMp(data.mp);
        }
    }

    $('.added_extra_pay a.open_fields').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            $(this).find('b').text(page_vars.add_extra_payment_title[1]);
        } else {
            $(this).find('b').text(page_vars.add_extra_payment_title[0]);
        }
        $('.added_extra_pay_fields').slideToggle();
    });
    $('#mp-monthly-payment').on('change', function () {
        if (fieldsErrorMp()) return false;
        data.mp.monthlyPayment = inputToNumber($(this).val());
        updateRange($(this));
        $(this).val(numberToCurrency(data.mp.monthlyPayment));
        calculateByMonthlyPayment();
    });
    $('#mp-down-payment-amount').on('change', function () {
        if (fieldsErrorMp()) {
            return false;
        }
        updateRange($(this));
        data.mp.downPaymentType = 'amount';
        data.mp.downPayment = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.downPayment));
        var monthlyPayment = data.mp.monthlyPayment - data.mp.hoa - data.mp.homeInsurance / 12,
            monthlyPropertyTax = data.mp.propertyTax / 1200,
            monthlyInterestRate = data.mp.interestRate / 1200;
        var downPaymentPercent = 0.20,
            PMI,
            loanAmount;
        do {
            PMI = getPMIPercent(downPaymentPercent);
            loanAmount = homePriceFromMonthlyPaymentDownPaymentAmount(monthlyPayment, monthlyInterestRate, data.mp.loanTermInMonth, monthlyPropertyTax, data.mp.downPayment, PMI / 12);
            downPaymentPercent = data.mp.downPayment / loanAmount;
        } while (PMI < getPMIPercent(downPaymentPercent));

        data.mp.downPaymentPercent = parseFloat(downPaymentPercent * 100).toFixed(3);
        $('#mp-down-payment-percent').val(numberToPercent(data.mp.downPaymentPercent)).trigger('change');
        calculateByMonthlyPayment();
    });
    $('#mp-down-payment-percent').on('change', function () {
        if (fieldsErrorMp()) {
            return false;
        }
        data.mp.downPaymentType = 'percent';
        data.mp.downPaymentPercent = inputToNumber($(this).val());

        if (data.mp.downPaymentPercent > 99) {
            data.mp.downPaymentPercent = 99;
        }

        $(this).closest('.field').find('.ui-slider-range').css('width', data.mp.downPaymentPercent + '%');
        $(this).closest('.field').find('.ui-slider-handle').css('left', data.mp.downPaymentPercent + '%');

        $(this).val(numberToPercent(data.mp.downPaymentPercent));
        var downPaymentPercent = data.mp.downPaymentPercent / 100,
            monthlyPropertyTax = data.mp.propertyTax / 1200,
            monthlyPayment = data.mp.monthlyPayment - data.mp.hoa - data.mp.homeInsurance / 12,
            monthlyInterestRate = data.mp.interestRate / 1200,
            PMI = getPMIPercent(downPaymentPercent),
            loanAmount = homePriceFromMonthlyPayment(monthlyPayment, monthlyInterestRate, data.mp.loanTermInMonth, monthlyPropertyTax, downPaymentPercent, PMI / 12);
        data.mp.downPayment = data.mp.downPaymentPercent * loanAmount;
        $('#mp-down-payment-amount').val(numberToCurrency(data.mp.downPayment));
        calculateByMonthlyPayment();
    });

    $('#mp-state').on('change', function () {
        data.mp.userState = $(this).val();
        data.mp.propertyTax = getTaxRateByState(data.mp.userState);
        $('#mp-property-tax').val(numberToPercent(data.mp.propertyTaxPercent));
        calculateByMonthlyPayment();
    });
    $('#mp-interest-rate').on('change', function () {
        if (fieldsErrorMp()) {
            return false;
        }
        data.mp.interestRate = Math.max(Math.min(inputToNumber($(this).val()), 100), 0.001);
        data.mp.customRate = true;
        $(this).val(numberToExactPercent(data.mp.interestRate));
        calculateByMonthlyPayment();
    });

    $('#mp-property-tax').on('change', function () {
        if (fieldsErrorMp()) {
            return false;
        }
        data.mp.propertyTaxPercent = inputToNumber($(this).val());
        $(this).val(numberToPercent(data.mp.propertyTaxPercent));
        calculateByMonthlyPayment();
    });
    $('#mp-home-insurance').on('change', function () {
        data.mp.homeInsurance = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.homeInsurance));
        calculateByMonthlyPayment();
    });
    $('#mp-hoa').on('change', function () {
        data.mp.hoa = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.hoa));
        calculateByMonthlyPayment();
    });
    $('#mp-amortization-report').on('click', function (e) {
        e.preventDefault();
        var args = {
                hp: data.mp.loanAmount,
                dp: data.mp.downPayment,
                lt: data.mp.loanTermInMonth,
                tr: data.mp.propertyTax,
                yi: data.mp.homeInsurance,
                hoa: data.mp.hoa,
                ir: data.mp.interestRate,
                et: data.mp.epApply,
                tymp: data.mp.epToYourMonthlyPayment,
                aeyp: data.mp.epAsAnExtraYearlyPayment,
                oe: data.mp.epOccurringEvery,
                aotpi: data.mp.epAsOneTimePaymentIn,
                aotpm: data.mp.epAsOneTimePaymentMonth,
                aotpy: data.mp.epAsOneTimePaymentYear
            },
            url = $(this).attr('href') + '?q=' + btoa(JSON.stringify(args));
        window.open(url);
        return false;
    });

    /**
     * Bi Weekly Payment Calculator
     */

    function calculateBiWeeklyPayment(amortization) {
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment;

        if (data.bw.downPaymentType == 'percent') {
            downPaymentPercent = data.bw.downPaymentPercent;
            data.bw.downPayment = data.bw.loanAmount / 100 * downPaymentPercent;
        } else {
            downPaymentPercent = data.bw.downPayment / data.bw.loanAmount;

            do {
                principalAmount = data.bw.loanAmount - data.bw.downPayment;
                pmiPayment = principalAmount * getPMIPercent(data.bw.downPayment / data.bw.loanAmount) / 12;
            } while (pmiPayment < getPMIPercent(downPaymentPercent));

            if (downPaymentPercent > 0.99) {
                data.bw.downPaymentType = 'percent';
                downPaymentPercent = 0.99;
                data.bw.downPayment = data.bw.loanAmount * downPaymentPercent;
            }

            downPaymentPercent = downPaymentPercent * 100;
        }

        data.bw.downPaymentPercent = downPaymentPercent;
        $('#bw-down-payment-amount').val(numberToCurrency(data.bw.downPayment));
        $('#bw-down-payment-percent').val(numberToPercent(data.bw.downPaymentPercent, 2));

        if (amortization !== false) {
            var legend_display = false;
            if ($(window).width() < 991) legend_display = false;

            if (typeof data.bw.customRate == 'undefined' || data.bw.customRate == false) {
                getInterestRateByState('bw');
            }

            var monthlyInterestRate = data.bw.interestRate / 1200,
                _principalAmount = data.bw.loanAmount - data.bw.downPayment,
                principalAndInterest = monthlyPaymentFromPrincipal(monthlyInterestRate, data.bw.loanTermInMonth, _principalAmount),
                monthlyHomeInsurance = data.bw.homeInsurance / 12,
                _pmiPayment = _principalAmount * getPMIPercent(data.bw.downPayment / data.bw.loanAmount) / 12,
                data_arr_Bw = get_amortizationBw();
            var arr_lables_bw = $.map(Array.from(Array(data.bw.loanTermInMonth / 12 + 1)), function (element, index) {
                return index
            });
            var chartBwData = {
                datasets: [ {
                    label: 'Biweekly payments',
                    data: data_arr_Bw[1],
                    borderColor: '#4064E4',
                    backgroundColor: '#F0F3FF',
                    borderWidth: 1,
                    pointStyle: 'circle',
                    pointRadius: 2,
                    pointHitRadius: 15,
                    pointHoverBackgroundColor: '#4064E4',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 1,
                    pointHoverRadius: 3,
                    pointRotation: 20
                }, {
                    label: 'Monthly payments',
                    data: data_arr_Bw[0],
                    borderColor: '#673AB7',
                    backgroundColor: 'rgb(103, 58, 183, 0.5)',
                    fill: false,
                    borderWidth: 1,
                    pointRadius: 2,
                    pointStyle: 'circle',
                    pointHitRadius: 15,
                    pointHoverBackgroundColor: '#673AB7',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                    pointHoverRadius: 3,
                    pointRotation: 20,
                    usePointStyle: true
                }],
                labels: arr_lables_bw
            };
            data.bw.monthlyPayment = _pmiPayment + data.bw.propertyTax + monthlyHomeInsurance + principalAndInterest + data.bw.hoa;

            if (!data.bw.hpChart) {
                Chart.defaults.LineWithLine = Chart.defaults.line;
                Chart.controllers.LineWithLine = Chart.controllers.line.extend({
                    draw: function draw(ease) {
                        Chart.controllers.line.prototype.draw.call(this, ease);

                        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                            var activePoint = this.chart.tooltip._active[0],
                                ctx = this.chart.ctx,
                                x = activePoint.tooltipPosition().x,
                                topY = this.chart.scales['y-axis-0'].top,
                                bottomY = this.chart.scales['y-axis-0'].bottom; // draw line

                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(x, topY);
                            ctx.lineTo(x, bottomY);
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = '#8B8B8B';
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                });
                Chart.defaults.global.pointHitDetectionRadius = 1;
                var mobile_width = $(window).width() > 900;

                var customTooltipsBw = function customTooltipsBw(tooltip) {
                    // Tooltip Element
                    var tooltipEl = document.getElementById('chartjs-tooltip');

                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = "<table class='table_tooltip'></table>";

                        if (!mobile_width) {
                            document.getElementById('m_calc_out_tab-04').appendChild(tooltipEl);
                        } else {
                            document.body.appendChild(tooltipEl);
                        }
                    } // Hide if no tooltip


                    if (tooltip.opacity === 0 && mobile_width) {
                        tooltipEl.style.opacity = 0;
                        return;
                    } // Set caret Position


                    tooltipEl.classList.remove('above', 'below', 'no-transform');

                    if (tooltip.yAlign) {
                        tooltipEl.classList.add(tooltip.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    } // Set Text


                    if (tooltip.body) {
                        var titleLines = tooltip.title || [];
                        var bodyLines = tooltip.body.map(getBody); //PUT CUSTOM HTML TOOLTIP CONTENT HERE (innerHTML)

                        var innerHtml = '<thead>';
                        titleLines.forEach(function (title) {
                            innerHtml += '<tr><th>' + title + '</th></tr>';
                        });
                        innerHtml += '</thead><tbody>';
                        bodyLines.forEach(function (body, i) {
                            var colors = tooltip.labelColors[i];
                            var style = 'background:' + colors.backgroundColor;
                            style += '; border-color:' + colors.borderColor;
                            style += '; border-width: 2px';
                            var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                            innerHtml += '<tr><td>' + span + body + '</td></tr>';
                        });
                        innerHtml += '</tbody>';
                        var tableRoot = tooltipEl.querySelector('table');
                        tableRoot.innerHTML = innerHtml;
                    }

                    var position = this._chart.canvas.getBoundingClientRect(); // Display, position, and set styles for font


                    tooltipEl.style.opacity = 1;

                    var height_to_shedule = $('#bw-chart').offset().top;
                    var shedule_height = $('#bw-chart').height() / 2;
                    var tooltip_width = $(tooltipEl).width();
                    tooltipEl.style.left = position.left + tooltip.caretX - (tooltip_width + 15) + 'px';
                    var tooltip_height = $(tooltipEl).height();

                    if (tooltip.caretY > shedule_height) {
                        tooltipEl.style.top = height_to_shedule + tooltip.caretY - tooltip_height + 'px';
                    } else {
                        tooltipEl.style.top = height_to_shedule + tooltip.caretY + 'px';
                    }

                    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
                };

                data.bw.hpChart = new Chart($('#bw-chart'), {
                    type: 'LineWithLine',
                    data: chartBwData,
                    options: {
                        responsive: true,
                        usePointStyle: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Chart.js LineWithLine'
                            }
                        },
                        tooltips: {
                            enabled: false,
                            mode: 'index',
                            position: 'nearest',
                            custom: customTooltipsBw,
                            backgroundColor: '#ffffff',
                            titleFontColor: '#000000',
                            bodyFontColor: '#000000',
                            titleFont: {
                                style: 'bold',
                                size: '36'
                            },
                            bodySpacing: 4,
                            caretPadding: 8,
                            titleMarginBottom: 13,
                            padding: 100,
                            cornerRadius: 4,
                            usePointStyle: true,
                            callbacks: {
                                title: function title(tooltipItem) {
                                    return 'Year ' + tooltipItem[0].index;
                                },
                                label: function label(tooltipItem, data) {
                                    var label = data.datasets[tooltipItem.datasetIndex].label + ': ';
                                    label += '<b>$ ' + Math.round(tooltipItem.yLabel).toLocaleString('en') + '</b>';
                                    return label;
                                }
                            }
                        },
                        legend: {
                            display: legend_display,
                            position: 'bottom',
                            usePointStyle: 'true',
                            labels: {
                                boxWidth: 0,
                                boxHeight: 0,
                                padding: 30,
                                fontSize: 16,
                                pointStyle: 'circle',
                                fontColor: '#000000',
                                usePointStyle: 'true',
                                color: 'rgb(255, 99, 132)'
                            }
                        },
                        scales: {
                            xAxes: [{
                                scaleLabel: {
                                    labelString: 'Length of Loan (loan)'
                                },
                                gridLines: {
                                    drawOnChartArea: false,
                                    borderDashOffset: 3
                                },
                                ticks: {
                                    maxRotation: 0,
                                    callback: function callback(value, index) {
                                        if(($(window).width() < 767) && (arr_lables_bw.length > 20)){
                                            if (index % 3 === 0) return value;
                                        } else {
                                            if (index % 2 !== 0) return value;
                                        }
                                    },
                                    beginAtZero: true
                                }
                            }],
                            yAxes: [{
                                gridLines: {
                                    drawOnChartArea: false
                                },
                                ticks: {
                                    callback: function callback(value) {
                                        return '$' + (value > 999 ? value / 1000 + 'k' : value);
                                    },
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            } else {
                data.bw.hpChart.data = chartBwData;
                data.bw.hpChart.update();
            }

            data.bw.calculated = true;
        }
    }

    /*================*/


    $('#bw-loan-amount').on('change', function () {
        if (fieldsErrorBw()) return false;

        updateRange($(this));
        data.bw.loanAmount = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.bw.loanAmount));
        $('#bw-down-payment-amount').attr('max', data.bw.loanAmount * 0.99)

        var monthlyInterestRate = data.bw.interestRate / 1200;
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment;

        if (data.bw.downPaymentType == 'percent') {
            downPaymentPercent = data.bw.downPaymentPercent;
            data.bw.downPayment = data.bw.loanAmount / downPaymentPercent;
        } else {
            do {
                principalAmount = data.bw.loanAmount - data.bw.downPayment;
                pmiPayment = principalAmount * getPMIPercent(data.bw.downPayment / data.bw.loanAmount) / 12;
                downPaymentPercent = data.bw.downPayment / data.bw.loanAmount * 100;
            } while (pmiPayment < getPMIPercent(downPaymentPercent));

            if (downPaymentPercent > 0.99) {
                data.bw.downPaymentType = 'percent';
                downPaymentPercent = 0.99;
                data.bw.downPayment = data.bw.loanAmount * downPaymentPercent;
            }
        }

        $('#bw-down-payment-amount').val(numberToCurrency(data.bw.downPayment));
        $('#bw-down-payment-percent').val(numberToPercent(data.bw.downPaymentPercent, 2));

        if (!data.bw.propertyTaxManual) {
            data.bw.propertyTax = data.bw.loanAmount * getTaxRateByState(data.bw.userState) / 1200;
            $('#bw-property-tax').val(numberToCurrency(data.bw.propertyTax));
        }

        calculateBiWeeklyPayment();
    });
    $('#bw-down-payment-amount').on('change', function () {
        if (fieldsErrorBw()) return false;
        data.bw.downPaymentType = 'amount';
        data.bw.downPayment = inputToNumber($(this).val());

        var monthlyInterestRate = data.bw.interestRate / 1200;
        var downPaymentPercent = 0,
            principalAmount = 0,
            pmiPayment;

        do {
            principalAmount = data.bw.loanAmount - data.bw.downPayment;
            pmiPayment = principalAmount * getPMIPercent(data.bw.downPayment / data.bw.loanAmount) / 12;
            downPaymentPercent = data.bw.downPayment / data.bw.loanAmount * 100;
        } while (pmiPayment < getPMIPercent(downPaymentPercent));

        data.bw.downPaymentPercent = downPaymentPercent;
        $(this).val(numberToCurrency(data.bw.downPayment));
        $("#bw-down-payment-percent").val(numberToPercent(data.bw.downPaymentPercent, 2)).trigger('change');
        calculateBiWeeklyPayment();
    });
    $('#bw-down-payment-percent').on('change', function () {
        if (fieldsErrorBw()) {
            return false;
        }
        data.bw.downPaymentType = 'percent';
        data.bw.downPaymentPercent = inputToNumber($(this).val());
        var downPaymentPercent = 0;

        if (data.bw.downPaymentPercent > 100) {
            data.bw.downPaymentPercent = 99;
        }

        $(this).closest('.field').find('.ui-slider-range').css('width', data.bw.downPaymentPercent + '%');
        $(this).closest('.field').find('.ui-slider-handle').css('left', data.bw.downPaymentPercent + '%');


        downPaymentPercent = data.bw.downPaymentPercent / 100;
        data.bw.downPayment = downPaymentPercent * data.bw.loanAmount;
        $(this).val(numberToPercent(data.bw.downPaymentPercent));
        data.bw.downPayment = data.bw.downPaymentPercent * data.bw.loanAmount / 100;
        $("#bw-down-payment-amount").val(numberToCurrency(data.bw.downPayment));
        $('#bw-down-payment-percent').val(numberToPercent(downPaymentPercent, 2));
        calculateBiWeeklyPayment();
    });
    $('#bw-state').on('change', function () {
        data.bw.userState = $(this).val();
        data.bw.propertyTaxManual = false;
        data.bw.propertyTax = data.bw.loanAmount * getTaxRateByState(data.bw.userState) / 1200;
        $('#bw-property-tax').val(numberToCurrency(data.bw.propertyTax));
        calculateBiWeeklyPayment();
    });
    $('#bw-interest-rate').on('change', function () {
        if (fieldsErrorBw()) {
            return false;
        }
        data.bw.interestRate = Math.max(Math.min(inputToNumber($(this).val()), 100), 0.001);
        data.bw.customRate = true;
        $(this).val(numberToExactPercent(data.bw.interestRate));
        calculateBiWeeklyPayment();
    });

    $('#bw-property-tax').on('change input', function () {
        data.bw.propertyTaxManual = true;
        data.bw.propertyTax = inputToNumber($(this).val());
        if (data.bw.propertyTax > 99) {
            data.bw.propertyTax = 99;
        }
        $(this).val(numberToCurrency(data.bw.propertyTax));
        calculateBiWeeklyPayment();
    });
    $('#bw-home-insurance').on('change input', function () {
        data.bw.homeInsurance = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.bw.homeInsurance));
        calculateBiWeeklyPayment();
    });
    $('#bw-homeowners_insurance').on('change input', function () {
        data.bw.homeInsurance = 12 * inputToNumber($(this).val());
        $('#bw-home-insurance').val(numberToCurrency(data.bw.homeInsurance));
        calculateBiWeeklyPayment();
    });
    $('#bw-hoa').on('change input', function () {
        data.bw.hoa = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.bw.hoa));
        calculateBiWeeklyPayment();
    });
    $('#bw-hoa_other').on('change input', function () {
        data.bw.hoa = inputToNumber($(this).val());
        $('#bw-hoa').val(numberToCurrency(data.bw.hoa));
        calculateBiWeeklyPayment();
    });
    /*================*/

    $('#bw-amortization-report').on('click contextmenu', function (e) {
        e.preventDefault();
        var args = {
                hp: Math.round(data.bw.loanAmount),
                dp: Math.round(data.bw.downPayment),
                lt: data.bw.loanTermInMonth,
                tr: data.bw.propertyTax,
                yi: data.bw.homeInsurance,
                hoa: data.bw.hoa,
                ir: data.bw.interestRate
            },
            url = $(this).attr('href') + '?' + $.param(args);
        window.open(url);
        return false;
    });
    /* 1------------------------------------ */

    /**
     * Tooltips
     */

    $('.tooltip').hide();
    $('.tooltip-trigger').hover(function () {
        $(this).next('.tooltip').fadeIn(250);
    }, function () {
        $(this).next('.tooltip').fadeOut(250);
    });

    // custom scroll for

    jQuery('#m_calc_out_tab-04').on('input', '.cus_scroll', function () {
        var table_parent = jQuery(this).closest('.outer');
        var inner_width = table_parent.find('.inner').width();
        var table_width = table_parent.find('table').width();
        var cus_scroll = (table_width - inner_width) / 100;
        table_parent.find('.inner').scrollLeft(jQuery(this).val() * cus_scroll);
    });
    var cus_scroll = $(this).scrollLeft();
    $('#m_calc_out_tab-04').on('touchmove', '.inner', function () {
        var table_parent = jQuery(this).closest('.outer');
        var table_width = table_parent.find('table').width();
        var inner_width = $('.cus_scroll').width();
        var cus_scroll = (inner_width - 214) / inner_width;
        table_parent.find('.cus_scroll').val($(this).scrollLeft() * cus_scroll);
    });
    /* annual-content mobile scroll */

    $('#annual-content').on('touchmove', '.inner', function () {
        var table_parent = jQuery(this).closest('.outer');
        var table_width = table_parent.find('table').width();
        var inner_width = table_parent.find('.cus_scroll').width();
        var cus_scroll = (inner_width - 214) / inner_width;
        var koff = parseInt($(this).scrollLeft() * cus_scroll);
        $('#annual-content').find('#ann_scroll').val(koff);
    });
    jQuery('#annual-content').on('input', '#ann_scroll', function () {
        var table_parent = jQuery(this).closest('.outer');
        var inner_width = table_parent.find('.inner').width();
        var table_width = 650;
        var cus_scroll = (table_width - inner_width) / 100;
        table_parent.find('.inner').scrollLeft(jQuery(this).val() * cus_scroll);
    });
    $('#mp-ty-monthly-payment').on('change', function () {
        data.mp.epToYourMonthlyPayment = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.epToYourMonthlyPayment));
    });
    $('#mp-eyp-monthly-payment').on('change', function () {
        data.mp.epAsAnExtraYearlyPayment = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.epAsAnExtraYearlyPayment));
    });
    $('#mp-ot-monthly-payment').on('change', function () {
        data.mp.epAsOneTimePaymentIn = inputToNumber($(this).val());
        $(this).val(numberToCurrency(data.mp.epAsOneTimePaymentIn));
    });
    $('#mp-axp-calc').on('click', function (e) {
        e.preventDefault();
        data.mp.epApply = true;
        data.mp.epOccurringEvery = inputToNumber($('select[name="mp-occuring-every"]').val());
        data.mp.epAsOneTimePaymentMonth = inputToNumber($('select[name="mp-one-time-month"]').val());
        data.mp.epAsOneTimePaymentYear = inputToNumber($('select[name="mp-one-time-year"]').val()); // call calculate

        updateEstimateYears(data.mp.loanTermInMonth / 12, 'mp-est');
        calculateByMonthlyPayment();
    });
    /* ahp  form_hp*/

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 9) {
            $('body').addClass('input-focus-outlines');
        }
    });
    document.addEventListener('click', function (e) {
        $('body').removeClass('input-focus-outlines');
    });

    /* location hash link */
    $('a.current-menu-item').removeClass('current-menu-item');
    if (window.location.hash) {
        var hash_arr = ['#by-income', '#by-monthly-payment', '#bi-weekly-payment'];
        var tabname = window.location.hash;
        if (hash_arr.includes(tabname)) {
            tabname = tabname.replace('#', '');
            switchToTab(tabname);
            setTimeout(function () {
                $('html, body').animate({scrollTop: 0}, 300);
                return false;
            }, 0);
        }
    }
    $('a[href="' + window.location.href + '"]').addClass('current-menu-item');

    $('a.tab_current').on('click', function (e) {
        e.preventDefault();
        $('a.current-menu-item').removeClass('current-menu-item');
        var a_href = $(this).addClass('current-menu-item').attr('href');
        var from = a_href.search('#');
        var to = a_href.length;
        a_href = a_href.substring(from + 1, to);
        switchToTab(a_href);
        $(this).closest('li.menu-item-has-children').trigger('click');
        setTimeout(function () {
            $('html, body').animate({scrollTop: 0}, 300);
            return false;
        }, 0);
    });

    function rebase_active_menu(el_href) {
        $('a.current-menu-item').removeClass('current-menu-item');
        var a_curr_text = window.location.origin + '/mortgage-calculator/#' + el_href;
        var a_cur_obj = $('a[href="' + a_curr_text + '"]');
        if (a_cur_obj.length != 0) {
            a_cur_obj.addClass('current-menu-item');
        } else {
            $('a[href="' + window.location.origin + '/mortgage-calculator/"]').addClass('current-menu-item');
        }
        if ($(window).width() < 1055) {
            if ($('#navbar-mobile-trigger').hasClass('is-open')) {
                $('#navbar-mobile-trigger').trigger('click');
            }
        }
    }

    /* location hash link - END*/

    /* validation values functions */

    /* fileds */
    /* fields hp*/
    $('#hp-loan-amount').on('input change', function () {
        validateField($(this), '$');
    });

    $('#hp-down-payment-amount').on('input change', function () {
        validateField($(this), '$');
    });
    $('#hp-down-payment-percent').on('input change', function () {
        validateField($(this), '%');
    });

    $('#hp-interest-rate').on('input change', function () {
        validateField($(this), '%');
    });

    $('#hp-property-tax').on('input change', function () {
        validateField($(this), '%');
    });

    $('#hp-home-insurance').on('input change', function () {
        validateField($(this), '$');
    });

    $('#hp-hoa').on('input change', function () {
        validateField($(this), '$');
    });

    /* end fields hp*/

    /* fields in */

    $('#i-income').on('input change', function () {
        validateField($(this), '$');

    });

    $('#i-down-payment-amount').on('input', function () {
        validateField($(this), '$');
    });

    $('#i-monthly-debts').on('input', function () {
        validateField($(this), '$');
    });

    $('#i-debt-to-income').on('input change', function () {
        validateField($(this), '%');
    });

    $('#i-interest-rate').on('input change', function () {
        validateField($(this), '%');
    });

    $('#i-property-tax').on('input change', function () {
        validateField($(this), '%');
    });

    $('#i-home-insurance').on('input change', function () {
        validateField($(this), '$');
    });

    $('#i-hoa').on('input change', function () {
        validateField($(this), '$');
    });

    /* end fields in */

    /* fields mp */
    $('#mp-monthly-payment').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-down-payment-amount').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-down-payment-percent').on('input change', function () {
        validateField($(this), '%');
    });

    $('#mp-interest-rate').on('input change', function () {
        validateField($(this), '%');
    });

    $('#mp-eyp-monthly-payment').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-property-tax').on('input change', function () {
        validateField($(this), '%');
    });

    $('#mp-home-insurance').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-hoa').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-ty-monthly-payment').on('input change', function () {
        validateField($(this), '$');
    });

    $('#mp-ot-monthly-payment').on('input change', function () {
        validateField($(this), '$');
    });

    /* end fields mp */

    /* fields bw*/
    $('#bw-loan-amount').on('input change', function () {
        validateField($(this), '$');
    });

    $('#bw-down-payment-amount').on('input change', function () {
        validateField($(this), '$');
    });

    $('#bw-down-payment-percent').on('input change', function () {
        validateField($(this), '%');
    });

    $('#bw-interest-rate').on('input change', function () {
        validateField($(this), '%');
    });

    /* end fields hp*/


    /* fileds */

    function validateField($field, num_type) {
        var val = $field.val();
        hideFieldError($field);
        if (val === '') {
            showFieldError($field, 'required');
            return false;
        }
        val = inputToNumber(val);
        if (val < $field.attr('min')) {
            showFieldError($field, 'min', num_type);
            return false;
        } else if (val > $field.attr('max')) {
            showFieldError($field, 'max', num_type);
            return false;
        }
        return true;
    }

    function showFieldError($field, errorType, num_type) {
        var msg = page_vars.err[errorType];
        var msg_val = $field.attr(errorType);
        if (num_type == '$') {
            msg_val = numberToCurrency(msg_val);
        }
        if (num_type == '%') {
            msg_val = msg_val + '%';
        }
        if (errorType == 'min' || errorType == 'max') {
            msg = msg.replace('%value', msg_val);
        }

        msg = '<div class="field-error-msg error">' + msg + '</div>';
        $(msg).insertAfter($field);
        $field.addClass('error');
    }

    function hideFieldError($field) {
        $field.next('.field-error-msg').remove();
        $field.removeClass('error');
    }


    /* polyfill - Array.from */

    if (!Array.from) {
        Array.from = (function () {
            var symbolIterator;
            try {
                symbolIterator = Symbol.iterator
                    ? Symbol.iterator
                    : 'Symbol(Symbol.iterator)';
            } catch (e) {
                symbolIterator = 'Symbol(Symbol.iterator)';
            }

            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
                return (
                    typeof fn === 'function' ||
                    toStr.call(fn) === '[object Function]'
                );
            };
            var toInteger = function (value) {
                var number = Number(value);
                if (isNaN(number)) return 0;
                if (number === 0 || !isFinite(number)) return number;
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };

            var setGetItemHandler = function setGetItemHandler(isIterator, items) {
                var iterator = isIterator && items[symbolIterator]();
                return function getItem(k) {
                    return isIterator ? iterator.next() : items[k];
                };
            };

            var getArray = function getArray(T,
                                             A,
                                             len,
                                             getItem,
                                             isIterator,
                                             mapFn) {
                var k = 0;
                while (k < len || isIterator) {
                    var item = getItem(k);
                    var kValue = isIterator ? item.value : item;

                    if (isIterator && item.done) {
                        return A;
                    } else {
                        if (mapFn) {
                            A[k] =
                                typeof T === 'undefined'
                                    ? mapFn(kValue, k)
                                    : mapFn.call(T, kValue, k);
                        } else {
                            A[k] = kValue;
                        }
                    }
                    k += 1;
                }

                if (isIterator) {
                    throw new TypeError(
                        'Array.from: provided arrayLike or iterator has length more then 2 ** 52 - 1'
                    );
                } else {
                    A.length = len;
                }

                return A;
            };

            return function from(arrayLikeOrIterator /*, mapFn, thisArg */) {
                var C = this;
                var items = Object(arrayLikeOrIterator);
                var isIterator = isCallable(items[symbolIterator]);
                if (arrayLikeOrIterator == null && !isIterator) {
                    throw new TypeError(
                        'Array.from requires an array-like object or iterator - not null or undefined'
                    );
                }
                var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
                var T;
                if (typeof mapFn !== 'undefined') {
                    if (!isCallable(mapFn)) {
                        throw new TypeError(
                            'Array.from: when provided, the second argument must be a function'
                        );
                    }
                    if (arguments.length > 2) {
                        T = arguments[2];
                    }
                }
                var len = toLength(items.length);
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);
                return getArray(
                    T,
                    A,
                    len,
                    setGetItemHandler(isIterator, items),
                    isIterator,
                    mapFn
                );
            };
        })();
    }

    init_range_sliders();

    $(document).click(function (event) {
        if (!$(event.target).is('#mortgage-calculator-city-search-list') && !$(event.target).is('#loc_name') && !$(event.target).is('#city-search_field')) {
            $('#loc_name').removeClass('active');
            $('.mortgage-calculator-city-search').hide(0);
        }
    });

    $('#faq_section .faq-title').click(function () {
        jQuery(this).parent().toggleClass('active');
        jQuery(this).parent().find('.faq-content').slideToggle(300);

    });

    /**
     * Mobile Info Table Panel Close
     * @click
     */
    $(document).on('click', '.mortgage_report__shedule-table-info .close', function (e) {
        $(this).parent().remove();
        e.preventDefault();
    });


    /**
     * Any received location detection
     */
    $(document).on('geolocation_received', function (e, geo_data) {
        page_set_user_geo_data(geo_data);
        init_calc();
        // get interest rates
        var statecode = geo_data.state_code,
            $loan_program_field = $('#hp-loanTermInMonths'),
            $interest_rate_field = $('#hp-interest-rate'),
            $form_container = $('.form_bar'),
            loan_program = $loan_program_field.val(),
            loan_program_map = {
                360: 'Fixed30Year',
                240: 'Fixed20Year',
                180: 'Fixed15Year',
                120: 'Fixed10Year',
            },
            rates = page_vars.mortgageRatesByState.hasOwnProperty(statecode) ? page_vars.mortgageRatesByState[statecode][loan_program_map[loan_program]] : {
                apr: 0,
                rate: 0
            };

        $hpInterestRate.val(rates.rate);
        $iInterestRate.val(rates.rate);
        $mpInterestRate.val(rates.rate);
        $bwInterestRate.val(rates.rate);

        get_loc_html(geo_data.zip_code);
    });

    /**
     * Get location processing
     */
    if (sm_user_geo_loading == false) {
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

            $('#zip-code-id').val(geo_data.zip_code);
            $('#gen_state').val(geo_data.state_code);
            userState = geo_data.state_code;
        }
    }

     /**
     * HELPERS
     */


    function updateRange($obj) {
        var $obj_max = $obj.attr('max'),
            $obj_val = $obj.val();

        var range_val = ($obj_val / $obj_max) * 100;
        $obj.closest('.field').find('.ui-slider-range').css('width', range_val + '%');
        $obj.closest('.field').find('.ui-slider-handle').css('left', range_val + '%');
    }

    function fieldsErrorHp() {
        return $('#form_hp input.error').length > 0;
    }

    function fieldsErrorAff() {
        return $('#form_aff input.error').length > 0;
    }

    function fieldsErrorMp() {
        return $('#form_mp input.error').length > 0;
    }

    function fieldsErrorBw() {
        return $('#form_bw input.error').length > 0;
    }

    /*  $('input[inputmode="decimal"]').on('keydown', function (e) {
     validate_input_for_text(e);
     });
     */

    function inputFilterPercent($el) {
        $el.inputFilter(function (value) {
            return /^\d*\.?\d*%?$/.test(value);
        });
    }

    inputFilterPercent($('input.percentage'));

    function inputFilterAmount($el) {
        $el.inputFilter(function (value) {
            return /^\$?\d*\.?\d*$/.test(value.replace(',', ''));
        });
    }


    inputFilterAmount($('input.currency'));

    // disallow comma
    $(document).on('keydown', 'input.currency', function (e) {
        if (e.hasOwnProperty('keyCode') && e.keyCode == 188) {
            return false;
        }
    });

});

$(window).on('resize', function () {
    init_range_sliders();
});

$(window).on("orientationchange", function () {
    init_range_sliders();
}, false);

function init_range_sliders() {
    // init only for table & large screen
    if (window.innerWidth > 991) {
        $('.value-slider').each(function () {
            var dataMin = parseFloat($(this).attr('data-min')),
                dataMax = parseFloat($(this).attr('data-max')),
                dataStep = parseFloat($(this).attr('data-step')),
                dataVal = parseFloat($(this).attr('data-value')),
                $slider = $(this);

            $(this).slider({
                range: "min",
                min: dataMin,
                max: dataMax,
                value: dataVal,
                slide: function (event, ui) {
                    var $child_input = $(this).parents('label').find('[data-slider-target]');
                    $child_input.val(ui.value).trigger('keyup').trigger('change');
                    $(this).find('.ui-slider-handle').text('');
                },
                create: function (event, ui) {
                    var t;
                    t = setInterval(function () {
                        // remove TAB keyboard focus
                        $slider.find('.ui-slider-handle').text('').attr('tabindex', '-1');
                        clearInterval(t);
                    }, 20);
                }
            });
        });
    }
}