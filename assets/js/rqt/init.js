var form_submited = 0,
    cities = null,
    default_cities_list = '',
    $calc_wrapper = $('#calc-content');


function getRates() {
    if (!$('#parametersForm').hasClass('cached')) {
        form_submited = form_submited + 1;
        $('#parametersForm').submit();
    } else {
        form_submited = form_submited + 1;
    }

    if (cities != null) {
        set_cities({cities: cities});
    }
}


function animate_rates_scroll() {
    let wp_topbar_offset = ($('body').hasClass('logged-in')) ? 32 : 0;
    if (window.innerWidth <= 991) {
        $("html, body").animate({scrollTop: $('.rates-wrapper').offset().top - $('header').outerHeight() - $('#chkbox-options').outerHeight() - wp_topbar_offset}, 700);
    } else if (window.innerWidth >= 820 && window.innerWidth <= 1200) {

        if (typeof data != 'undefined' && data.get('submit_form') == 'true') {
            $("html, body").animate({scrollTop: $('.rates-wrapper').offset().top - $('header').outerHeight() - $('#chkbox-options').outerHeight() - wp_topbar_offset}, 700);
        }
    }
}


/**
 * Save RQT form to visitor browser
 */
function saveRQTForm_ls() {
    let formData = [];
    $('#parameters input[type=text], #parameters select, #chkbox-options input').each(function () {
        let value = '';
        if ($(this).attr('type') == 'checkbox') {
            value = ($(this).prop('checked') == true) ? true : false;

            if (!$(this).parents('.extra-options').hasClass('hidden')) {
                formData.push({name: $(this).attr('name'), 'type': 'checkbox', value: value});
            }

        } else {
            value = $(this).val();
            formData.push({
                name: $(this).attr('name'),
                'disabled': ($(this).is('[disabled]') ? true : false),
                'type': 'field',
                value: value
            });
        }

    });
    formData.push({name: 'url', 'type': 'url', 'value': window.location.href});
    formData.push({name: 'rates', 'type': 'html', 'container': '#rates-wrapper', 'value': $('#rates-wrapper').html()});
    formData.push({
        name: 'loc_header',
        'type': 'html',
        'container': '.city-zip-header',
        'value': $('.city-zip-header').html()
    });

    localStorage.setItem('rqtForm', JSON.stringify(formData));
}


/**
 * Get RQT form values from visitor browser
 */
function getRQTForm_ls() {

    if (getCookie('js_session') == 1) {
        $calc_wrapper.addClass('preload-values');

        var rqtcv = localStorage.getItem('rqtForm');

        if (typeof rqtcv != 'undefined' && rqtcv != null && rqtcv != '') {
            let RQTForm = JSON.parse(rqtcv);

            $.each(RQTForm, function (key, val) {

                if (val.type == 'field') {
                    $('[name="' + val.name + '"]').val(val.value);

                    if (val.disabled != null && val.disabled == true) {
                        $('[name="' + val.name + '"]').prop("disabled", true);
                    } else {
                        $('[name="' + val.name + '"]').prop("disabled", false);
                    }
                }


                if (val.type == 'html')
                    $(val.container).html(val.value);


                if (val.type == 'checkbox') {
                    $('[name="' + val.name + '"]').prop('checked', val.value);

                    $('[name="' + val.name + '"]').parents('.extra-options').removeClass('hidden');
                }
            });

            if ($('.field.down_payment input').is('[disabled]'))
                $('.field.down_payment .fld-input').addClass('not-preload');

            // Smooth loading preload fields animation switch
            let t;
            t = setInterval(function () {
                $calc_wrapper.removeClass('preload-values');
                clearInterval(t);
            }, 100);
        }
    }

    update_view();
}


/**
 * Reset visitor browser form data
 */
function jsRatesDefault() {

    localStorage.removeItem('rqtForm');
    delCookie('mortgage_l_r');
    delCookie('js_session');
    getRQTForm_ls();
}


function init_range_slider($_slider) {
    let dataMin = parseFloat($_slider.attr('data-min')),
        dataMax = parseFloat($_slider.attr('data-max')),
        dataStep = parseFloat($_slider.attr('data-step')),
        dataVal = parseFloat($_slider.attr('data-value')),
        $slider = $_slider;

    $slider.slider({
        range: "min",
        min: dataMin,
        max: dataMax,
        value: dataVal,
        slide: function (event, ui) {
            let $child_input = $(this).parents('label').find('[data-slider-target]');
            $child_input.val(ui.value).trigger('keyup').trigger('change');
            $(this).find('.ui-slider-handle').text('');
        },
        create: function (event, ui) {
            $slider.find('.ui-slider-handle').text('').attr('tabindex', '-1');
        }
    });
}


function init_range_sliders() {
    if (window.innerWidth > 991) {
        $('.value-slider').each(function () {
            let dataMin = parseFloat($(this).attr('data-min')),
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
                    let $child_input = $(this).parents('label').find('[data-slider-target]');
                    $child_input.val(ui.value).trigger('keyup').trigger('change');
                    $(this).find('.ui-slider-handle').text('');
                },
                create: function (event, ui) {
                    let t;
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


/**
 * Detect RQT visitor location
 */
function getJSRates() {
    var rqt_city = localStorage.getItem('rqtForm'),
        pathname = window.location.pathname,
        url = window.location.href,
        origin = window.location.origin;

    if (rqt_city != null && typeof rqt_city != 'undefined' && rqt_city != '') {
        var RQTForm = JSON.parse(rqt_city),
            cityUrl = '';

        $.each(RQTForm, function (key, val) {
            if (val.name == 'url') cityUrl = val.value;
        });
    }

    if ((url != cityUrl)) {
        // reset saved local data
        jsRatesDefault();
    }

    // if selected another RQT city page (refresh rates and location, and start
    // new JS session again)
    if (getCookie('js_session') != 1 || (url != cityUrl)) {

        $calc_wrapper.addClass('preload-values');

        $.get("https://ipinfo.io", function (response) {
            get_location(response.country);
        }, "json");
    } else {
        getRQTForm_ls();  // load form values from visitor browser
    }
}


/**
 * Detect visitor location
 * - if visitor not USA resident return default location, if visitor USA resident detect location by Google Geo API
 */
function get_location(country) {
    var expires,
        url = window.location.href,
        geolocation = {};

    // if visitor not USA resident (load default location)
    if (country != 'US') {
        geolocation = geolocation_vars.geoLocation;
        createCookieHours('js_session', 1, 1);
        createCookieHours('geolocation', JSON.stringify(geolocation), 1); // for 1 hour
        sm_user_geo_loading = false;

        $calc_wrapper.removeClass('preload-values');
    } else {
        geolocation = getCookie('geolocation');

        // if isset previously detected location
        if (geolocation) {
            try {
                geolocation = JSON.parse(geolocation);
                if (!geolocation.hasOwnProperty('country') || !geolocation.hasOwnProperty('zip_code') || !geolocation.hasOwnProperty('state')) {
                    throw 'geolocation error';
                }
            } catch (e) {
                geolocation = false;
            }
        }

        if (!geolocation || geolocation == false) {
            // get location detect
            jQuery.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + geolocation_vars.geoApiKey + "&v=3").done(function (location) {
                // decode google location
                let xhr = new XMLHttpRequest();
                xhr.open('GET', rqt_vars._rqt_router + '?action=custom_action&referrer=wp&value=getLocation&url=' + url + '&location=' + JSON.stringify(location) + '&rqt_message=' + rqt_vars._rqt_message + '&rqt_config=' + $.base64.encode(rqt_vars._rqt_default_form));
                xhr.responseType = 'json';
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.send();
                xhr.onload = function () {
                    let response = xhr.response;
                    let geolocation = {
                        country: response.geolocation.country,
                        zip_code: response.geolocation.zip_code,
                        state_code: response.geolocation.statecode,
                        state: response.geolocation.state,
                        city: response.geolocation.city,
                        county_name: response.geolocation.county_name,
                    }


                    form_submited = form_submited + 1;

                    // render ajax parts result
                    $calc_wrapper.html($.base64.decode(response.view));

                    // Save location detection activity to one hour
                    createCookieHours('js_session', 1, 1);
                    createCookieHours('geolocation', JSON.stringify(geolocation), 1);

                    $calc_wrapper.removeClass('preload-values');

                    sm_user_geo_loading = false;

                    // events after loading rates
                    after_submit(null, response);
                };
            });
        } else {
            geolocation = geolocation_vars.geoLocation;
            createCookieHours('js_session', 1, 1);
            createCookieHours('geolocation', JSON.stringify(geolocation), 1); // for 1 hour
            sm_user_geo_loading = false;

            $calc_wrapper.removeClass('preload-values');
        }

    }
}

$(window).on('resize', function () {
    init_range_sliders();
});


// Listen for orientation changes
$(window).on("orientationchange", function () {
    init_range_sliders();
}, false);


$(document).ready(function () {
    // input values slider changer
    init_range_sliders();

    // detect location (only for first session condition: cached page WP rocket)
    getJSRates();

    // styling select
    init_selectbox();

    // update calculator activity
    update_view();

    // Jquery vaidation
    init_form_validation();

    // init formatting values currency
    init_form_formatting();

    // preload cities and zip codes
    let rqtcv = localStorage.getItem('qrt_cities');
    if (rqtcv == null || typeof rqtcv == 'undefined' || rqtcv == '') {
        localStorage.setItem('qrt_cities', citiesJSON);
        cities = JSON.parse(citiesJSON);
        // console.log('cities loaded first time...');
    } else {
        // console.log('cities from cache');
        cities = JSON.parse(rqtcv);
    }


    $(document).on('submit', '#parametersForm', function (e) {
        e.preventDefault();

        let formData = new FormData($(this)[0]),
            url = rqt_vars._rqt_router,
            $rates_content = $calc_wrapper.find('#rates-wrapper');

        // processing animation
        $rates_content.addClass('loading');
        $calc_wrapper.addClass('loading');

        // if form submitted by real user click on browser
        if (form_submited > 0) {
            formData.append('submit_form', true);
        }

        // if cities list loaded
        if (cities) {
            formData.append('cities_loaded', true);
        }

        if (typeof rqt_vars._rqt_default_form != 'undefined' && rqt_vars._rqt_default_form != null) {
            formData.append('rqt_config', JSON.stringify(rqt_vars._rqt_default_form));
        }

        // add special calculator caller name
        formData.append('referrer', 'wp');
        formData.append('cached', false);

        let data = new URLSearchParams(formData);

        // events before submit RQT form
        before_submit(formData, data);

        fetch(url, {
            method: 'post',
            // referrerPolicy: 'no-referrer',
            headers: {
                'Content-Encoding': 'gzip',
                "X-Requested-With": "XMLHttpRequest",
                'Accept-Encoding': 'gzip',
            },
            body: data,
        }).then(function (response) {
            // save current form params on client side
            saveRQTForm_ls();

            response.json().then(function (data) {
                form_submited = form_submited + 1;

                $calc_wrapper.html($.base64.decode(data.view));

                // events after submit
                after_submit(formData, data);

                $( document.body ).trigger( 'updated_rates', [ data ] );
            });

        }).finally(function (response) {


        }).catch(error => console.error('error:', error));


    });


    return getRates();
});


function set_cities(data) {
    if (!default_cities_list && typeof data != 'undefined') {
        cities = data.cities;
        let output_cities = cities.list;

        output_cities = output_cities.slice(0, 15);

        $('.modal-popover .data-list').empty();

        $.each(output_cities, function (key, value) {
            let hasChilds = (typeof value.zip_childs != 'undefined' && value.zip_childs == true) ? 'true' : 'false';
            let item = '<li data-type="city"  data-county="' + value.county + '" data-state="' + value.state + '"  data-childs="' + hasChilds + '" data-city="' + value.city + '" data-zip="' + value.zip + '"><a href="#">' + value.city + '<span class="advanced-title"><span class="item-state">' + value.state + '</span> <span class="item-county">(' + value.county + ')</span></span></a></li>';
            $('.modal-popover .data-list').append(item);
            default_cities_list += item;
        });

        // save to local storage
        let rqtcv = localStorage.getItem('qrt_cities');
        if (rqtcv == null || typeof rqtcv == 'undefined' || rqtcv == '') {
            localStorage.setItem('qrt_cities', JSON.stringify(cities));
            createCookie('cities_loaded', 1, 180);
        }
    } else {
        $('.modal-popover .data-list').empty();
        $('.modal-popover .data-list').html(default_cities_list);
    }

    afterCitiesInsert();
}


function afterCitiesInsert() {
    let limit_items = 15;
    var c = cities.list.slice(0, limit_items),
        cityPopupList = $('.modal-popover .data-list');


    $(".modal-popover .filter-input").bind('keyup paste', function () {

        var userInput = $(this).val();
        cityPopupList.html('');
        let inserted = 0;
        let parts = userInput.split(' ');
        parts = parts.filter(function (v) {
            return v !== ''
        });

        if (userInput != '') {
            /*
            if (templates.length > 1 && $.isNumeric(templates.pop()))
            {
                console.log('Search selected city ZIP');
            } else
                */
            if ($.isNumeric(userInput)) {
                // console.log('This is numeric ZIP code must search in another DB');

                inserted = 0;
                let zipList = (typeof cityPopupList.attr('data-selected-city') != 'undefined') ? cities.zip[cityPopupList.attr('data-selected-city')].list : cities.zip_index;
                cityPopupList.empty();

                $.map(zipList, function (value, index) {

                    // specific input search only in zip group in selected city
                    if (typeof cityPopupList.attr('data-selected-city') != 'undefined') {
                        if (value.indexOf(userInput) >= 0) {
                            if (inserted > limit_items) return;

                            let item = '<li data-type="zip"  data-county="' + cities.zip[cityPopupList.attr('data-selected-city')].info.county + '" data-state="' + cities.zip[cityPopupList.attr('data-selected-city')].info.state + '" data-city="' + cities.zip[cityPopupList.attr('data-selected-city')].info.city + '" data-zip="' + value + '"><a href="#">' + value + '</a></li>';
                            cityPopupList.append(item);

                            inserted = inserted + 1;
                        }
                    } else {
                        // default input search by ZIP
                        if (index.indexOf(userInput) >= 0) {
                            if (inserted > limit_items) return;

                            let item = '<li data-type="zip"  data-county="' + value.county + '" data-state="' + value.state + '" data-city="' + value.city + '" data-zip="' + index + '"><a href="#">' + index + '<span class="advanced-title"><span class="item-state">' + value.state + '</span> <span class="item-county">(' + value.county + ')</span></span></a></li>';
                            cityPopupList.append(item);

                            inserted = inserted + 1;
                        }
                    }
                });

            } else {

                // if current RQT page is specific city page, not allow search any city. Only current city!
                if (typeof cityPopupList.attr('data-selected-city') != 'undefined') {
                    cityPopupList.empty();
                    return;
                }

                cities.list.map(function (value, index) {
                    if (userInput == value.city) {
                        // get ZIP of selected city
                        cityPopupList.empty();
                        let zipinfo = cities.zip[userInput];
                        zipinfo.list.map(function (ZIP, index) {
                            let item = '<li data-type="zip"  data-county="' + zipinfo.info.county + '" data-state="' + zipinfo.info.state + '" data-city="' + userInput + '" data-zip="' + ZIP + '"><a href="#">' + ZIP + '</a></li>';
                            cityPopupList.append(item);
                        });
                        return;
                    } else if (value.city.toLowerCase().indexOf(userInput) >= 0 || value.city.indexOf(userInput) >= 0) {
                        // Search city
                        if (inserted > limit_items) return;
                        let hasChilds = (typeof value.zip_childs != 'undefined' && value.zip_childs == true) ? 'true' : 'false';
                        let item = '<li data-type="city"  data-county="' + value.county + '" data-state="' + value.state + '"  data-type="city"  data-county="' + value.county + '" data-state="' + value.state + '" data-childs="' + hasChilds + '" data-city="' + value.city + '" data-zip="' + value.zip + '"><a href="#">' + value.city + '<span class="advanced-title"><span class="item-state">' + value.state + '</span> <span class="item-county">(' + value.county + ')</span></span></a></li>';
                        cityPopupList.append(item);
                        inserted = inserted + 1;
                    }
                });
            }

        } else {

            if (typeof cityPopupList.attr('data-selected-city') != 'undefined') {
                // show all zip codes group in specific selected city
                $('.modal-popover .data-list').html(rqt_get_ziplist_by_city(rqt_vars._rqt_city));
            } else {
                // show all cities (default)
                $('.modal-popover .data-list').html(default_cities_list);
            }

        }

        init_ZIPmodal_popup();
    });

}


function rqt_get_ziplist_by_city(city) {
    $.map(cities.zip[city].list, function (ZIP, index) {
        let item = '<li data-type="zip"  data-county="' + cities.zip[city].info.county + '" data-state="' + cities.zip[city].info.state + '" data-city="' + city + '" data-zip="' + ZIP + '"><a href="#">' + ZIP + '</a></li>';
        $('.modal-popover .data-list').append(item);
    });
}


function init_selectbox() {

    // Styling select only for table and large screen
    if (window.innerWidth > 820) {
        $('form#parametersForm select:not(.no-js-styling)').select2({
            minimumResultsForSearch: -1,
        });
    }
}

/*
$.validator.methods.number = function (value, element) {
    let globalizedValue = value.replace(/,/g, "");
    globalizedValue = globalizedValue.replace(/$/g, "");
    globalizedValue = globalizedValue.replace(/%/g, "");
    globalizedValue = globalizedValue.replace(/.00/g, "");

    return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(globalizedValue);
}*/


$.validator.methods.min = function (value, element, param) {
    let globalizedValue = cleanNum_validate(value);
    return this.optional(element) || globalizedValue >= param;
}

$.validator.methods.max = function (value, element, param) {
    let globalizedValue = cleanNum_validate(value);
    return this.optional(element) || globalizedValue <= param;
}

$.validator.methods.range = function (value, element, param) {
    let globalizedValue = cleanNum_validate(value);
    return this.optional(element) || (globalizedValue >= param[0] && globalizedValue <= param);
}


$.validator.methods.equalTo = function (value, element, param) {
    let globalizedValue = cleanNum_validate(value);
    return this.optional(element) || (globalizedValue === param);
}

jQuery.validator.defaults.onkeyup = function (element, event) {
    if (event.which === 9 && this.elementValue(element) === "") {
        return;
    } else if (element.name in this.submitted || element === this.lastElement) {
        this.element(element);
    }
}

jQuery.validator.defaults.onfocusout = function (element, event) {

    if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
        this.element(element);
    }
}

/**
 * Formatting fields currency/percentage
 */
function init_form_formatting() {
    $('input.currency').trigger('keyup');
    // $('input.percentage').trigger('keyup');
}


/**
 * Validate calculator form
 */
function init_form_validation() {
    jQuery('.form-validate').validate({
        errorElement: "div",
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        onsubmit: true,
        errorPlacement: function (error, element) {
            error.appendTo(element.parents("label"));

            if (element.parents('.fields-group').length > 0) {
                element.parents('.fields-group').addClass('group-error');
            }
        },
        onkeyup: function (element) {
            $(element).parents('.fields-group').removeClass('group-error');
            $(element).valid();
        }

    });
}

/**
 * Event after submit RQT form
 */
function after_submit(data, result) {
    // input values slider changer
    init_range_sliders();

    // styling select
    init_selectbox();

    // save cities
    set_cities(result);

    // save form activity browser data
    saveRQTForm_ls();

    // update calculator activity
    update_view();

    // Jquery vaidation
    init_form_validation();

    // init formatting values currency
    init_form_formatting();

    animate_rates_scroll();

    // remove loading animation
    $calc_wrapper.find('#rates-wrapper').removeClass('loading');
    $calc_wrapper.removeClass('loading');
}
