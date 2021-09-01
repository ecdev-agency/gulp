jQuery(document).ready(function ($) {

    var target = null,
        user_zip = '',
        $preview_form_data = [],
        $zipForm = $('form.leadForm'),
        $zipInput = $zipForm.find('#zip');

    // init basic script
    init();

    // detect geolocation after load page
    sm_get_user_geolocation();


    $(window).on('resize', function () {
        init_range_sliders();
    });


// Listen for orientation changes
    $(window).on("orientationchange", function () {
        init_range_sliders();
    }, false);


    function init_range_sliders() {
        if (window.innerWidth > 991) {

            $('.leadForm__range').each(function (i) {

                let $this = $(this),
                    min = $this.attr('data-min'),
                    max = $this.attr('data-max'),
                    val = cleanNum($this.attr('value')),
                    symbol = $this.attr('data-symbol'),
                    isPercentage = $this.parents('.leadForm__group').hasClass('leadForm__group-percentage') ? 1 : 0,
                    // step = isPercentage ? 0.01 : 1,
                    step = isPercentage ? 0.01 : 1,
                    targetVal = $this.val(),
                    rangeMax = max,
                    result = 0;

                $this.inputSliderRange({
                    "min": parseInt(min),
                    "max": parseInt(max),
                    "start": parseInt(val),
                    "step": step,
                    'grid': 1,
                    'gridCompression': 1,
                    'gridSuffix': symbol,
                    gridCompressionValues: {
                        '-9999999': {text: '', compression: 0, digits: 0},
                        // '10': {text: '+', compression: 0, digits: 0},
                        '1000': {text: 'K+', compression: 3, digits: 0},
                        '1000000': {text: 'M+', value: 3, compression: 0, digits: 1},
                        '1000000000': {text: 'B+', compression: 9, digits: 1}
                    },

                    onChanged: function (data) {

                        if (data.hasOwnProperty('detail')) {
                            let result = data.detail.current,
                                max = parseInt($this.attr('data-max')),
                                rangeTargetVal = result;
                            let $parent_currency_field = $this.parents('.leadForm__group').find('.money'),
                                currencyInputVal = cleanNum($parent_currency_field.val());

                            let isPercentage = $this.parents('.leadForm__group').hasClass('leadForm__group-percentage');

                            if (isPercentage) {
                                $this.parents('.leadForm__group').find('.rangeTarget:not(.money)').val(rangeTargetVal).trigger('keyup', 'slider_change');
                            } else {

                                $this.parents('.leadForm__group').find('.money').val(result).trigger('keyup', 'slider_change');
                            }
                            $(document).off('set_slider_value_by_input');

                        }
                    },

                });

                $this.inputSliderRange('setTo', val);
            });
        }
    }


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


    function formatNumber(num) {
        num = parseFloat(cleanNum(num.toString()));

        if (isNaN(num)) {
            return '';
        } else if (typeof num !== 'number') {
            num = parseFloat(num);
        }

        return '$' + num.toLocaleString('en-US');
        /*
                if (num.toString().length > 1)
                {
                    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                else {
                    return num;
                }
        */
    }


    let $leadForm = $('#leadForm'),
        stepDotsWrap = $('#stepDotsWrap'),
        $formBtn = $('.leadForm__btn'),
        $leadFormStep = $('.leadForm__step'),
        $stepDotsItem = $('.stepDots__item'),
        $navBackBtn = $('.leadForm__navBtn-back'),
        $navNextBtn = $('.leadForm__navBtn-next');

    /**
     * Change step by dots click
     */
    $(document.body).on('click', '.stepDots__item', function (e) {
        let $this = $(this),
            errorInputs = $('.leadForm__step-active .leadForm__input-error').length;
        if (($this.hasClass('stepDots__item-active') || $this.hasClass('stepDots__item-done'))) {
            let newStep = $this.attr('data-step');

            if (changeStep(newStep, 'next', true) != false) {
                $this.addClass('stepDots__item-active');
            }
        }

    });


    $leadForm.trigger('reset');

    $(document.body).on('click change', '.stepBtn', function (e) {
        let $this = $(this),
            target = $this.attr('data-next-step'),
            $target = $(target),
            $activeStep = $('.leadForm__step-active'),
            loanType = $this.attr('data-loan-type');

        $activeStep.find('.leadForm__input').trigger('change');

        if (loanType) {
            $activeStep.attr('data-next-step', target);
            $('.stepDots').removeClass('stepDots-active');
            $('.stepDots[data-loan-type="' + loanType + '"]').addClass('stepDots-active');
            $('.leadForm__loanCol').removeClass('leadForm__loanCol-active');
            $this.parents('.leadForm__loanCol').addClass('leadForm__loanCol-active');
        }

        if ($target.length > 0 && $activeStep.find('.leadForm__input-error').length === 0) {
            $activeStep.find('.leadForm__btn').removeClass('leadForm__btn-active');
            if ($this.hasClass('leadForm__btn')) {
                $this.toggleClass('leadForm__btn-active');
            }
            $target.find('.leadForm__input:not([type=tel])').prop('required', true);
            setTimeout(function () {
                changeStep(target, 'next', true);
            }, 500);

        }
    });


    function validateStep(newStep, type, validate) {
        $('.leadForm__step-active').find('.leadForm__errorText').remove();
        $('.leadForm__step-active').find('.validateInput').removeClass('error success');

        // validate active step fields
        if (validate == true) {
            $('.leadForm__step-active').find('.validateInput').each(function (key, val) {
                let $this = $(this);
                smInputValidation($this);
            });
        }

        if ($('.leadForm__step-active').find('.leadForm__errorText').length == 0 && $('.leadForm__step-active').find('.leadForm__input-error').length == 0) {
            changeStep_after(newStep, type);
        } else {
            return false;
        }
    }

    function set_step(newStep, type) {

        if ($(newStep) != null && $(newStep).length > 0) {
            let $activeStep = $('.leadForm__step-active'),
                userNameStep = '#user-name-step';

            $leadFormStep.not(newStep).removeClass('leadForm__step-active');
            $(newStep).addClass('leadForm__step-active');
            $(newStep).find('.money, .leadForm__input-percentage').trigger('keyup', 'not_self');

            $stepDotsItem.removeClass('stepDots__item-active');

            let currentStepId = $activeStep.attr('id');
            $('.stepDots-active [data-step="#' + currentStepId + '"]').addClass('stepDots__item-done').removeClass('stepDots__item-active');
            $('.stepDots-active [data-step="' + newStep + '"]').addClass('stepDots__item-active');

            if (newStep === userNameStep && type === 'next') {
                $(userNameStep).attr('data-prev-step', '#' + $activeStep.attr('id'));
            }


            if (!$(newStep).hasClass('editable')) {
                $activeStep.addClass('leadForm__step-done');
                if (newStep === '#welcome') {
                    stepDotsWrap.hide();
                } else {
                    stepDotsWrap.show();
                }
            } else {
                stepDotsWrap.hide();
            }

            if ($(newStep).next().hasClass('leadForm__step-done')) {
                $navNextBtn.removeClass('leadForm__navBtn-disabled');
            } else {
                $navNextBtn.addClass('leadForm__navBtn-disabled');
            }

            // scrolltop in mobile
            if (window.innerWidth <= 820) {
                $(window).scrollTop(0);
            }
        }
    }


    function changeStep_after(newStep, type) {
        let $activeStep = $('.leadForm__step-active');

        // exception for first welcome slide reviews section switch to show/hide
        if (newStep != '#welcome') {
            $('.reviewsWrap').hide();
        } else {
            $('.reviewsWrap').show();
        }


        // exception for last step preview all form data
        if (newStep == '#form-preview-step' || $activeStep.hasClass('editable')) {
            set_step(newStep, type);
            set_step('#' + $activeStep.attr('id'), type);
            return get_preview_form();
        }

        set_step(newStep, type);
    }

    jQuery.extend({
        compare: function (arrayA, arrayB) {
            if (arrayA.length != arrayB.length) {
                return false;
            }
            // sort modifies original array
            // (which are passed by reference to our method!)
            // so clone the arrays before sorting
            var a = jQuery.extend(true, [], arrayA);
            var b = jQuery.extend(true, [], arrayB);
            a.sort();
            b.sort();
            for (var i = 0, l = a.length; i < l; i++) {
                if (a[i].value !== b[i].value) {
                    return false;
                }
            }
            return true;
        }
    });


    function get_preview_form() {
        if (jQuery.compare($preview_form_data, $leadForm.serializeArray())) {
            $('.leadForm__step').removeClass('leadForm__step-active');
            $('#form-preview-step').addClass('leadForm__step-active');
        } else {
            $leadForm.find('[data-selected-form-options]').html('');
            $leadForm.addClass('submit');
            $preview_form_data = $leadForm.serializeArray();

            setTimeout(function () {
                $.post(sm_obj.ajaxurl, {
                    'action': 'sm_preview_lead_form',
                    'data': $preview_form_data,
                }, function (response) {
                    if (response.hasOwnProperty('html')) {
                        set_step('#form-preview-step', 'next');
                        $('#stepDotsWrap').hide();
                        $('#form-preview-step [data-selected-form-options]').html(response.html);
                        sm_tooltip();
                    }

                    $leadForm.removeClass('submit');

                    clearInterval($(this));
                });

            }, 100);
        }


    }


    function changeStep(newStep, type = 'next', validate = false) {
        return validateStep(newStep, type, validate);
    }


    // close editable step
    $(document).on('click', '.editable-header .btn-back', function () {
        changeStep('#form-preview-step', 'next', true);
    });


    function editStep(newStep, type = 'next') {
        let $newStep = $(newStep),
            $nav_tpl = '<div class="editable-header"><button class="btn-back" type="button">Back to Results</button></div>';

        $(window).scrollTop(0);

        $('.leadForm__step').removeClass('editable').find('.editable-header').remove();
        $newStep.addClass('editable');
        $newStep.prepend($nav_tpl);

        $.when(set_step(newStep, type)).then(function () {

        });
    }


// This function formats a passed float number as percent, rounding to 2 decimals and adding '%'
// suffix
    function formatPercent(n) {
        if (typeof n != 'undefined')
            return n.toFixed(2);
    }

    // This function formats a passed float number as percent, rounding to 2 decimals and adding '%' suffix
    function formatPercent2(input, e, pos) {
        let val = input.val(),
            allowedCodes = [8, 9, 27, 35, 36, 37, 38, 39, 46, 110, 188],
            max = parseFloat(input.attr('max')),
            prefix = '';

        // format percent input (only two digits)
        val = formatPercentDigits2(val);

        // only real numbers press
        if (!(allowedCodes.some(code => code === e.keyCode))) {
            // if value more max
            if (val > max) {
                val = val.toString().slice(0, -1);
            }
        }

        if (e.type == 'change') {
            val = parseFloat(val).toFixed(2);
        }

        if (!val) return;

        if (!(allowedCodes.some(code => code === e.keyCode))) {
            prefix = '%';
        }

        if (val > 100) {
            val = 100;
        }

        input.val(val + prefix);

        if (pos == true)
            input[0].setSelectionRange(input.val().length - 1, input.val().length);
    }

    function formatPercentDigits(n) {
        n = cleanNum(n.toString());
        return n.toString().match(/^\d+\.?\d{0,2}/) + '%';
    }

    function formatPercentDigits2(n) {
        return n.toString().match(/^\d+\.?\d{0,2}/);
    }

    /**
     * Change step click on nav. buttons (prev, next)
     */
    $(document.body).on('click', '.leadForm__navBtn', function (e) {
        e.preventDefault();
        let $this = $(this),
            $activeStep = $('.leadForm__step-active'),
            errorInputs = $activeStep.find('.leadForm__input-error').length,
            target = $activeStep.attr('data-prev-step'),
            btnType = $this.attr('data-slide');

        if (btnType === 'next' && $activeStep.next().hasClass('leadForm__step-done')) {
            target = $activeStep.attr('data-next-step');
        }

        if (target && errorInputs === 0) {
            if (changeStep(target, btnType, true) != false) {
                // any actions ..
            }
        }
    });


    function removeCurrencyDots(str) {
        str = parseFloat(str).toFixed(0);
        let val = str.toString().replace(/\......[\s\S]*/g, '');
        return cleanNum(val);
    }


    /**
     * Percentage field event
     */
    $('.percentageVal').bind("keyup", function (e) {
        if (e.keyCode === 9) return false;

        formatPercent2($(this), e, true);

        // convert % to currency value
        if ($(this).hasClass('leadForm__input-percentage')) {
            let curVal = cleanNum($(this).val()),
                prevInput = $(this).parents('.leadForm__step').prev().find('.money'),
                prevInputVal = cleanNum(prevInput.val()),
                result = parseFloat(prevInputVal / 100 * curVal).toFixed(0);

            $(this).parents('.leadForm__group').find('.field-group').not($(this)).val(result).trigger('keyup', 'not_self');
        }
    });


    $(document).on('keypress', 'input.percentageVal', function (e) {
        // only digits
        var charCode = (e.which) ? e.which : e.keyCode;
        if (String.fromCharCode(charCode).match(/[^0-9.]/g))
            return false;
    });


    $(document).on('update', 'input.percentageVal', function (e, parent) {
        if (parent == 'not_self') {
            formatPercent2($(this), e, false);
        }
    });


    function formatCurrency2(input, pos) {
        // appends $ to value, validates decimal side
        // and puts cursor back in right position.

        // get input value
        var input_val = input.val();

        // don't validate empty input
        if (input_val === "") {
            return;
        }

        // original length
        var original_len = input_val.length;

        // initial caret position
        var caret_pos = input.prop("selectionStart");

        input_val = formatNumber2(input_val);
        input_val = "$" + input_val;
        input.val(input_val);

        // put caret back in the right position
        // specific disable if press not parent input
        if (pos == true) {
            var updated_len = input_val.length;
            caret_pos = updated_len - original_len + caret_pos;
            input[0].setSelectionRange(caret_pos, caret_pos);
        }

        jQuery(document).trigger('input-value-formatted-end');
    }

    /**
     * Edit selected form options
     */
    $(document).on('click', '[data-editable]', function (e) {
        e.preventDefault();

        let target = (typeof $(this).attr('data-step-target') != 'undefined' && $(this).attr('data-step-target') != null) ? $(this).attr('data-step-target') : false;

        if (target) {
            $.when(editStep(target, 'next', false)).then(function () {

            });
        } else {
            alert('Parent fields of this step not found!');
        }
    });


    function formatNumber2(n) {
        // format number 1000000 to 1,234,567
        return n.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }


    /**
     * Formatting numbers mask
     */
    $('.onlyNumbers').bind("change keyup input click", function (e) {
        if (this.value.match(/[^0-9+]/g)) {
            this.value = this.value.replace(/[^0-9+]/g, '');
        }
    });


    $(document).on('keypress', '.checkZip', function (e) {
        let $this = $(this);
        $this.attr('data-user-change', true);
    });


    function init() {
        setZipLoading(true);

        $('.phone-mask').mask('(999) 999-9999', {
            showMaskOnFocus: true,
            showMaskOnHover: false,
            autoUnmask: true,
            clearMaskOnLostFocus: true
        });

        init_range_sliders();
    }

    function setZipLoading($active) {
        let $input = $('input.checkZip'),
            $el = $input.parents('.leadForm__inputWrap'),
            $input_placeholder = $input.parents('label').find('span');

        if ($active == true) {
            $el.addClass('loading');
        } else {
            $el.removeClass('loading');
            $input.prop('disabled', false);
            $input.removeClass('leadForm__input-loading');
            $input_placeholder.addClass('active');
        }
    }


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
        setZipLoading(true);

        if (getCookie('geolocation')) {
            page_set_user_geo_data(sm_get_user_geolocation());
        }
    }


    /**
     * Location detection response
     */
    function page_set_user_geo_data(geo_data) {

        if (geo_data.hasOwnProperty('zip_code')) {
            $(document).off('geolocation_received');
            user_zip = geo_data.zip_code;
            $zipInput.val(user_zip).trigger('change');
            setZipLoading(false);
            $zipInput.removeClass('error').addClass('success');

            // add location fields into form
            add_leadform_location(geo_data);
        }
    }


    function checkZipCode(zip, $input) {
        return $.post(sm_obj.ajaxurl, {
            'action': 'sm_zip_code_exist',
            'zip': zip
        }, function (response) {
            setZipLoading(false);

            if (response && response.hasOwnProperty('zip_code')) {
                $input.addClass('success').removeClass('error');
            } else {
                $input.addClass('error').removeClass('success');
            }
        });
    }


    function validateFullName(name) {
        // Name and lastname required let regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
        let regName = /^[a-zA-Z ]+$/;

        if (!regName.test(name)) {
            // console.log('Please enter your full name (first & last name).');
            return false;
        } else {
            // console.log('Valid name given.');
            return true;
        }
    }


    function isValidNumberInput($this) {
        let val = cleanNum($this.val()),
            minVal = cleanNum($this.attr('data-min')),
            maxVal = cleanNum($this.attr('data-max'));
        // console.log('Val: ' + val + ', min: ' + minVal + ', max: ' + maxVal);
        if (val < minVal || val > maxVal) {
            return false;
        }

        return true;
    }

    function smInputValidation_clean() {
        $('.leadForm__step-active').find('.leadForm__errorText').remove();
        $('.leadForm__step-active').find('.validateInput').removeClass('error success');
    }

    function smInputValidation($this) {
        let inputType = $this.attr('type'),
            errorText = 'This is required field',
            validateType = $this.attr('data-validate'),
            value = $this.val(),
            $nextBtn = $this.parents('.leadForm__step').find('.stepBtn');

        // $this.addClass('leadForm__input-process');

        switch (inputType) {
            case 'email':
                errorText = 'Please enter a valid email';
                break;
            case 'tel':
                errorText = 'Please enter valid phone number';
                break;
            case 'number' :
                let val = cleanNum($this.val()),
                    minVal = cleanNum($this.attr('data-min')),
                    maxVal = cleanNum($this.attr('data-max'));

                if (val < minVal) {
                    errorText = 'This value must be min ' + formatNumber(parseInt(minVal));
                } else if (val > maxVal) {
                    errorText = 'This value must be max ' + formatNumber(parseInt(maxVal));
                } else {
                    errorText = 'This value is not a number';
                }
                break;

            case 'text' :
                if (validateType == 'number') {
                    let val = cleanNum($this.val()),
                        minVal = cleanNum($this.attr('data-min')),
                        maxVal = cleanNum($this.attr('data-max'));

                    if (val < minVal) {
                        errorText = 'This value must be min ' + formatNumber(parseInt(minVal));
                    } else if (val > maxVal) {
                        errorText = 'This value must be max ' + formatNumber(parseInt(maxVal));
                    } else {
                        errorText = 'This value is not a number';
                    }
                    break;
                } else if (validateType == 'zip') {
                    if ($this.attr('data-user-change') != null && $this.attr('data-user-change') == 'true') {

                        $.ajaxSetup({async: false});

                        checkZipCode(value, $this).done(function (data) {
                            if (data == null || !data.hasOwnProperty('zip_code')) {
                                errorText = 'This zip code does not exist (only ' + geolocation_vars.location_config.available_states.join(', ') + ')';
                                $this[0].setCustomValidity(errorText);
                            }
                        });
                    } else {

                    }

                    break;
                }
        }

        $this.parent().find('.leadForm__errorText').remove();
        $this.removeClass('error success');

        if ($this.is(":invalid") || (validateType && validateType === 'number' && !isValidNumberInput($this)) || (validateType && validateType === 'fullName' && !validateFullName(value))) {
            $this[0].setCustomValidity('');
            $this.addClass('error');
            $this.focus();
            //$nextBtn.prop('disabled', true);
            $("<span class='leadForm__errorText'>" + errorText + "</span>").insertAfter($this);
            // $this.removeClass('leadForm__input-process');
        } else {
            //$nextBtn.prop('disabled', false);
            $this.addClass('success');
        }
    }


    $(document).on('input change focusout', '.validateInput', function (e) {
        let $this = $(this);
        smInputValidation_clean();
    });


    /**
     * clean another tab (refinance, purchase)
     */
    $(document).on('input change click', 'input[name=loan_type]', function (e) {
        let $this = $(this);
        $('input[name="loan_type"]').prop('checked', false);
        $this.prop('checked', true);
    });


    /**
     * select loan type click in icon
     */
    $(document).on('input change click', '[data-loan-type]', function (e) {
        let thisVal = $(this).attr('data-loan-type');
        $('input[value="' + thisVal + '"]').prop('checked', true);
    });


    $leadForm.on('submit', function (e) {
        e.preventDefault();
        $(window).scrollTop(0);
        $leadForm.addClass('submit');

        let $this = $(this),
            data = $this.serializeArray();

        setTimeout(function () {
            $.post(sm_obj.ajaxurl, {
                'action': 'sm_create_new_lead',
                'data': data
            }, function (response) {
                if (response.hasOwnProperty('success')) {
                    if (response.success == true) {
                        $('.leadPage').html(response.success_tpl);
                    } else {
                        alert('Error submit form! Please contact administrator.');
                    }
                } else {
                    alert('Error submit form! Please contact administrator.');
                }

                $leadForm.removeClass('submit');

            });
        }, 400);
    });


    function cleanNum(num) {
        let val = parseFloat(num.replace(/[^-0123456789.]/g, ''));
        if (isNaN(val)) val = 0;
        return val;
    }


    /**
     * Autoselect field value on click
     */
    $leadForm.find('input.percentageVal, input.checkZip').on('click', function (evt) {
        let $this = $(this);
        $this.select();
    });


    /**
     * Formatting currency fields
     */
    $(document).on('keypress', 'input.currency, input.percentageVal', function (e, parent) {
        // only numbers
        var charCode = (e.which) ? e.which : e.keyCode;
        if (String.fromCharCode(charCode).match(/[^0-9]/g))
            return false;

    });


    /**
     * Formatting currency mask
     */
    $(document).on('keyup', 'input.currency', function (e, parent) {
        let trigger_action = (typeof parent == 'undefined' || parent == null) ? 'self' : parent;

        // keyboard tab key
        if (e.keyCode === 9) return false;

        let $this = $(this),
            cleanVal = cleanNum(e.target.value),
            $range = $this.parents('.leadForm__group').find('.InputSliderRange-Input'),
            validateType = $this.attr('data-validate'),
            minVal = parseFloat($this.attr('data-min')),
            maxRange = parseFloat($this.attr('data-max-range')),
            maxVal = parseFloat($this.attr('data-max'));

        if ($(this).hasClass('percent-formatting')) {
            formatPercent2($this, e, true);
        } else {
            if (parent != 'self') {
                // not select position
                formatCurrency2($this, false);
            } else {
                // select position
                formatCurrency2($this, true);
            }

        }


        let percentageValue = parseFloat(e.target.value),
            isPercentage = $this.parents('.leadForm__group').hasClass('leadForm__group-percentage');

        if (isPercentage) {
            let prevInputVal = cleanNum($this.parents('.leadForm__step').prev().find('.money').val()),
                percentageVal = cleanNum(formatPercentDigits(parseFloat(cleanVal * 100 / prevInputVal).toFixed(2)));

            if (percentageVal > 100) {
                cleanVal = maxVal;
            } else {
                cleanVal = percentageVal;
            }
        }


        // convert $ to percentage value
        if (isPercentage) {
            if (!$(this).hasClass('leadForm__group-percentage')) {
                let ta = (trigger_action == 'self') ? 'not_self' : '';
                if (ta == 'not_self')
                    $(this).parents('.leadForm__group').find('.leadForm__input-percentage').val(cleanVal).trigger('update', ta);
            }
        }


        if (trigger_action != 'slider_change') {
            if (cleanVal < minVal) {
                $range.inputSliderRange('setTo', 0, false, false);
            } else if (cleanVal > maxRange) {
                $range.inputSliderRange('setTo', maxRange, false, false);
            } else {
                $range.inputSliderRange('setTo', cleanVal, false, false);
            }
        }

    });


    $('.currency').bind("click", function (e) {
        $(this).select();
    });


    /**
     * Append GeoLocation data into form
     */
    function add_leadform_location(data) {
        $leadForm.append('<input type="hidden" readonly="true" name="city" value="' + data.city + '">');
        $leadForm.append('<input type="hidden" readonly="true" name="county" value="' + data.county_name + '">');
        $leadForm.append('<input type="hidden" readonly="true" name="state" value="' + data.state + '">');
        $leadForm.append('<input type="hidden" readonly="true" name="country" value="' + data.country + '">');
    }


    $leadForm.bind("keypress keyup keypress keydown", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            return false;
        }
    });


    let $reviewsSlider = $('#reviewsSlider');
    $reviewsSlider.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        prevArrow: '<button type="button" class="slick-prev"></button>',
        nextArrow: '<button type="button" class="slick-next"></button>',
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: false, /* set centerMode to false to show complete slide instead of 3 */
                    slidesToScroll: 1,
                    arrows: false,
                    dots: false
                }
            }],
    });

    $reviewsSlider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
        fixElementHeight('.reviews__text');

    });

    fixElementHeight('.reviews__text');
});
