jQuery(document).ready(function ($) {

    var target = null,
        user_zip = '00000',
        $zipForm = $('form.leadForm'),
        $zipInput = $zipForm.find('#zip');

    let $leadForm = $('#leadForm'),
        stepDotsWrap = $('#stepDotsWrap'),
        $formBtn = $('.leadForm__btn'),
        $leadFormStep = $('.leadForm__step'),
        $stepDotsItem = $('.stepDots__item'),
        $navBackBtn = $('.leadForm__navBtn-back'),
        $navNextBtn = $('.leadForm__navBtn-next');

    // init basic script
    init();



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
                        rangeTargetVal = result < 1 ? result : formatNumber(result);
                    let $parent_currency_field = $this.parents('.leadForm__group').find('.money'),
                        currencyInputVal = cleanNum($parent_currency_field.val());

                    //if (parseInt(rangeTargetVal) < parseInt(rangeMax))

                    let isPercentage = $this.parents('.leadForm__group').hasClass('leadForm__group-percentage');

                    if (isPercentage) {
                        let prevInputVal = cleanNum($this.parents('.leadForm__step').prev().find('.money').val());

                        result = parseFloat(prevInputVal / 100 * result).toFixed(0);

                        /*if (parseFloat(currencyInputVal) <= parseFloat($parent_currency_field.attr('data-max')) ||
                            prepareResult <= parseFloat(currencyInputVal)
                        )
                        {
                            result = parseFloat(prevInputVal / 100 * result).toFixed(0);
                        }
                        else {
                            result = parseFloat(currencyInputVal);
                        }*/

                        $this.parents('.leadForm__group').find('.onlyNumbers').attr('data-max', prevInputVal);
                        $this.parents('.leadForm__group').find('.onlyNumbers').attr('data-validate', 'number');
                    }

                    // $this.parents('.leadForm__group').find('.rangeTarget').val(targetVal);

                    if (isPercentage) {
                        $this.parents('.leadForm__group').find('.rangeTarget:not(.money)').val(formatPercentDigits(rangeTargetVal));

                        let t;
                        t = setInterval(function () {
                            if (currencyInputVal > result && result >= parseFloat($parent_currency_field.attr('data-max'))) {
                                $parent_currency_field.val(formatNumber(currencyInputVal));
                            } else {
                                $parent_currency_field.val(formatNumber(result));
                            }
                            clearInterval(t);
                        }, 50);
                    } else {

                        if (result <= max || result >= min) {
                            $this.parents('.leadForm__group').find('.money').val(formatNumber(result));
                        } else {
                            $this.parents('.leadForm__group').find('.money').val(formatNumber(targetVal));
                        }

                    }

                }
            },

        });

        $this.inputSliderRange('setTo', val);
    });

    function formatNumber(num) {
        num = parseFloat(num);

        if (isNaN(num)) {
            return '';
        } else if (typeof num !== 'number') {
            num = parseFloat(num);
        }

        return num.toLocaleString('en-US');
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


    $(document.body).on('click', '.stepDots__item', function (e) {
        let $this = $(this),
            errorInputs = $('.leadForm__step-active .leadForm__input-error').length;
        if (($this.hasClass('stepDots__item-active') || $this.hasClass('stepDots__item-done'))) {
            let newStep = $this.attr('data-step');
            changeStep(newStep);
            $this.addClass('stepDots__item-active');
        }
    });


    $leadForm.trigger('reset');


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
    }


    /**
     * Location detection response
     */
    function page_set_user_geo_data(geo_data) {

        if (typeof geo_data != 'undefined' && geo_data.hasOwnProperty('zip_code')) {
            $(document).off('geolocation_received');
            user_zip = geo_data.zip_code;
            setZipLoading(false);

            $zipInput.val(user_zip).trigger('change');

            $zipInput.removeClass('leadForm__input-error').addClass('leadForm__input-success');

            // add location fields into form
            add_leadform_location(geo_data);

        }
    }


    // detect geolocation after load page
    sm_get_user_geolocation();

    $(document.body).on('click', '.stepBtn', function (e) {
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
        $('.leadForm__step-active').find('.validateInput').removeClass('leadForm__input-error leadForm__input-success');

        // validate active step fields
        if (validate == true) {
            $('.leadForm__step-active').find('.validateInput').each(function (key, val) {
                let $this = $(this);
                smInputValidation($this);
            });
        }

        if ($('.leadForm__step-active').find('.leadForm__errorText').length == 0 && $('.leadForm__step-active').find('.leadForm__input-error').length == 0)
            changeStep_after(newStep, type);
    }

    function changeStep_after(newStep, type) {

        if ($(newStep).length > 0) {
            let $activeStep = $('.leadForm__step-active'),
                userNameStep = '#user-name-step';
            $stepDotsItem.removeClass('stepDots__item-active');
            $activeStep.addClass('leadForm__step-done');


            $leadFormStep.not(newStep).removeClass('leadForm__step-active');
            $(newStep).addClass('leadForm__step-active');
            $(newStep).find('.money, .leadForm__input-percentage').trigger('keyup');


            let currentStepId = $activeStep.attr('id');
            $('.stepDots-active [data-step="#' + currentStepId + '"]').addClass('stepDots__item-done').removeClass('stepDots__item-active');
            $('.stepDots-active [data-step="' + newStep + '"]').addClass('stepDots__item-active');

            if (newStep === userNameStep && type === 'next') {
                $(userNameStep).attr('data-prev-step', '#' + $activeStep.attr('id'));
            }
            if (newStep === '#welcome') {
                stepDotsWrap.hide();
            } else {
                stepDotsWrap.show();
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

    function changeStep(newStep, type = 'next', validate = false) {
        validateStep(newStep, type, validate);
    }

    // This function formats a passed float number as percent, rounding to 2 decimals and adding '%' suffix
    function formatPercent(n) {
        if (typeof n != 'undefined')
            return n.toFixed(2);
    }

    function formatPercentDigits(n) {
        return n.toString().match(/^\d+\.?\d{0,2}/);
    }


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
            changeStep(target, btnType);
        }
    });


    $('.percentageVal').bind("change keyup input click", function (e) {
        let pattern = /^\d+(\.?)\d*$/g,
            allowedCodes = [8, 9, 27, 35, 36, 37, 38, 39, 46, 110, 188],
            value = this.value;

        // format percent input (only two digits)
        this.value = formatPercentDigits(this.value);

        // advanced format percent digits
        if (!(value.match(pattern) || allowedCodes.some(code => code === e.keyCode))) {
            this.value = value.slice(0, -1);
        }
    });

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
    }

    function setZipLoading($active) {
        let $input = $('input.checkZip'),
            $el = $input.parents('.leadForm__inputWrap');

        if ($active == true) {
            $el.addClass('loading');
        } else {
            $el.removeClass('loading');
            $input.prop('disabled', false);
            $input.removeClass('leadForm__input-loading');
            $input.attr('placeholder', $input.attr('data-placeholder'));
        }
    }


    function checkZipCode(zip, $input) {
        return $.post(sm_obj.ajaxurl, {
            'action': 'sm_zip_code_exist',
            'zip': zip
        }, function (response) {
            setZipLoading(false);

            if (response && response.hasOwnProperty('zip_code')) {
                $input.addClass('leadForm__input-success').removeClass('leadForm__input-error ');
            } else {
                $input.addClass('leadForm__input-error').removeClass('leadForm__input-success ');
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
        $('.leadForm__step-active').find('.validateInput').removeClass('leadForm__input-error leadForm__input-success');
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
        $this.removeClass('leadForm__input-error leadForm__input-success');

        if ($this.is(":invalid") || (validateType && validateType === 'number' && !isValidNumberInput($this)) || (validateType && validateType === 'fullName' && !validateFullName(value))) {
            $this[0].setCustomValidity('');
            $this.addClass('leadForm__input-error');
            $this.focus();
            //$nextBtn.prop('disabled', true);
            $("<span class='leadForm__errorText'>" + errorText + "</span>").insertAfter($this);
            // $this.removeClass('leadForm__input-process');
        } else {
            //$nextBtn.prop('disabled', false);
            $this.addClass('leadForm__input-success');
        }
    }


    $(document).on('input change focusout blur', '.validateInput', function (e) {
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


    /**
     * Submit form
     */
    $leadForm.on('submit', function (e) {
        e.preventDefault();

        $leadForm.addClass('submit');

        let $this = $(this),
            data = $this.serializeArray();

        $.post(sm_obj.ajaxurl, {
            'action': 'sm_create_new_lead',
            'data': data
        }, function (response) {
            if (response.hasOwnProperty('success')) {
                if (response.success == true) {
                    $leadForm.html(response.success_tpl);

                    let $interesedArticles = $('.interested-articles');
                    $interesedArticles.slick({
                        slidesToShow: 3,
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
                                    arrows: true,
                                    dots: false
                                }
                            }],
                    });

                    $interesedArticles.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                        fixElementHeight('.latest_post_item');
                    });

                    fixElementHeight('.latest_post_item');

                } else {
                    alert('Error submit form! Please contact administrator.');
                }
            } else {
                alert('Error submit form! Please contact administrator.');
            }

            $leadForm.removeClass('submit');

        });
    });


    function cleanNum(num) {
        let val = parseFloat(num.replace(/[^-0123456789.]/g, ''));
        if (isNaN(val)) val = 0;
        return val;
    }


    $leadForm.find('.leadForm__input-percentage').on('blur change input keyup', function (evt) {
        let $this = $(this),
            min = parseFloat($this.attr('min')),
            max = parseFloat($this.attr('max')),
            numericValue = cleanNum($this.parents('.leadForm__group').find('.money').val()),
            $range = $this.parents('.leadForm__group').find('.InputSliderRange-Input');

        if (min && this.value < min || isNaN(this.value) || !this.value) {
            this.value = min;
        }
        if (max && this.value > max) {
            this.value = max;
        }
        let prevInputVal = cleanNum($this.parents('.leadForm__step').prev().find('.money').val()),
            result = parseFloat(prevInputVal / 100 * this.value).toFixed(0);

        $range.inputSliderRange('setTo', this.value);

        // $this.parents('.leadForm__group').find('.money').val(formatNumber(result));
        if (numericValue > result) {
            $this.parents('.leadForm__group').find('.money').val(formatNumber(numericValue));
        } else {
            $this.parents('.leadForm__group').find('.money').val(formatNumber(result));
        }
    });

    let timer;


    $leadForm.find('input.percentageVal, input.checkZip').on('change focus blur input keyup', function (evt) {
        let $this = $(this);
        if (evt.type === 'focus') {
            $this.select();
        }
    });


    $leadForm.find('input.money').on('change focus blur input keyup', function (evt) {
        let $this = $(this),
            cleanVal = cleanNum(evt.target.value),
            $range = $this.parents('.leadForm__group').find('.InputSliderRange-Input'),
            validateType = $this.attr('data-validate'),
            minVal = parseFloat($this.attr('data-min')),
            maxRange = parseFloat($this.attr('data-max-range')),
            maxVal = parseFloat($this.attr('data-max'));

        if (evt.type === 'keyup') {
            // If arrow keys or not a number
            // if ([37, 39].indexOf(evt.keyCode) > -1 || isNaN(cleanNum(evt.target.value))) {
            if ($.inArray(evt.keyCode, [37, 39]) >= 0) {
                return;
            }
        }

        if (evt.type === 'blur') {
            // Clean the numbers, revert to placeholder if blank
            let input = cleanNum(evt.target.value);
            evt.target.value = isNaN(input) ? 0 : input;
        }

        if (evt.target.classList.contains('money')) {
            if (evt.type === 'focus') {
                // Remove the thousands comma
                evt.target.value = cleanNum(evt.target.value);
            } else if (evt.type === 'blur') {
                // Add the thousands comma
                evt.target.value = formatNumber(evt.target.value);
            }
        }

        if (evt.type === 'change' || evt.type === 'keyup') {
            if (!isNaN(evt.target.value)) {
                evt.target.value = cleanNum(evt.target.value);
            }

            if (validateType && validateType === 'number') {
                clearTimeout(timer);
                timer = setTimeout(function () {

                    let checkVal = isNaN(evt.target.value) ? cleanNum(evt.target.value) : parseFloat(evt.target.value);
                    if (checkVal >= minVal) {
                        if (minVal && checkVal < minVal) { // minVal && checkVal < minVal
                            // evt.target.value = minVal;
                        } else if (maxVal && checkVal > maxVal) {
                            // disable autoreplace max min value after 1 sec
                            // evt.target.value = formatNumber(maxVal);
                        }
                    }
                }, 1000);
            }

            let result = parseFloat(evt.target.value),
                isPercentage = $this.parents('.leadForm__group').hasClass('leadForm__group-percentage');

            if (isPercentage) {
                let prevInputVal = cleanNum($this.parents('.leadForm__step').prev().find('.money').val());

                // if current value "Down payment" field more pushchase price
                if (parseFloat(evt.target.value) > prevInputVal) {
                    evt.target.value = result; // prevInputVal;
                }


                if (result / 100 / 100 < 0.01) {
                    // console.log('min 0.01');
                    if (result == 0) {
                        // result = 0;
                    } else {
                        return;
                    }
                }

                result = formatPercentDigits(parseFloat(result * 100 / prevInputVal).toFixed(2));
                if (result > 100) {
                    result = maxVal;
                }
                // console.log(parseFloat(result * 100 / prevInputVal).toFixed(2));
            }

            // not validate and autoreplace input value to tange slider min/max values  && evt.target.value < maxVal
            target = evt.target;
            var timer1;

            if (evt.type == 'change') {
                clearInterval(timer1);

                timer1 = setInterval(function () {

                    if (result < minVal) {
                        $range.inputSliderRange('setTo', 0);
                    } else if (result > maxRange) {
                        $range.inputSliderRange('setTo', maxRange);
                    } else {
                        $range.inputSliderRange('setTo', result);
                    }

                    if (isPercentage) {
                        evt.target.value = target.value;
                    } else {
                        evt.target.value = formatNumber(result);
                    }

                    clearInterval(timer1);
                }, 0);
            }


            if (!isNaN(evt.target.value)) {
                // console.log(evt.target.value);
                evt.target.value = formatNumber(evt.target.value);
            }

        }
        if (evt.type === 'focus') {
            $this.select();
        }

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
