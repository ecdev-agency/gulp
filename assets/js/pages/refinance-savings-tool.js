jQuery( function( $ ) {

    /**
     * RST - Refinance Savings Tool
     * @type {{init: RST.init, install: RST.install, range_sliders: RST.range_sliders}}
     */
    var RST = {

        /**
         * Scenario
         * @type {*[]}
         */
        scenario_compare_max: 3, //Max Select
        scenario_compare: [], //Counter Selected Scenaries
        /**
         * Init
         */
        init: function () {

            /**
             * Run Install
             */
            this.install  = this.install( this );
            this.range_sliders  = this.range_sliders( this );
            this.print  = this.print( this );

            /**
             * ReInit Range Sliders
             * @resize
             * @orientationchange
             */
            $(window).on(
                'resize orientationchange',
                this.range_sliders );

            /**
             * Tabs
             * @change
             */
            $( document ).on(
                'change',
                '.rstTabs [type="radio"]',
                this.tabs );

            /**
             * Add and Remove Checkbox Compare
             * @change
             */
            $( document ).on(
                'change',
                '.rstTableCheckbox',
                this.compare );

            /**
             * Close Attention Window
             * @click
             */
            $( document ).on(
                'click',
                '.attentionClose',
                this.attention );

            /**
             * Remove Scenario
             * @click
             */
            $( document ).on(
                'click',
                '.rstRemoveScenario',
                this.remove_scenario );

            /**
             * Add Scenario
             * @click
             */
            $( document ).on(
                'click',
                '.rstItemScenario',
                this.add_scenario );

            /**
             * Clear Scenario
             * @click
             */
            $( document ).on(
                'click',
                '.rstClearScenario',
                this.clear_scenario );

            /**
             * Item Scenario Click
             * @click
             */
            $( document ).on(
                'click',
                '.rstItemScenarioItem',
                this.scenario_item );

            /**
             * Submit Form
             * @click
             */
            $( document ).on(
                'click',
                '.rstSubmit',
                this.submit );

            /**
             * Submit Form
             * @submit
             */
            $( document ).on(
                'submit',
                '.rstForm',
                this.submit );

            /**
             * Open Modal Print
             * @click
             */
            $( document ).on(
                'click',
                '.btn-print',
                this.print_modal );


        },

        /**
         * Install
         */
        install: function() {

            /**
             * Close Popover
             * @mousedown
             */
            jQuery(document).mousedown(function (e) {
                var container = $(".modal-popover"),
                    parent = $('[data-toggle="modal-popover"]');

                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    parent.removeClass('open');
                    container.fadeOut(100);

                }
            });

            /**
             * Currency
             * @change
             * @keyup
             * @keypress
             */
            $(document).on('change', 'input.currency', function (e, parent) {
                if ($(this).val().length == 1 && $(this).val() == 0)
                    $(this).val(0);

                if (typeof parent != 'undefined') {
                    formatCurrency2($(this), false);
                } else {
                    formatCurrency2($(this), true);
                }

            });
            $(document).on('keyup', 'input.currency', function (e, parent) {
                if (e.keyCode === 9) return false;

                formatCurrency2($(this), true);

            });
            $(document).on('keypress', 'input.currency', function (e, parent) {
                // only numbers
                var charCode = (e.which) ? e.which : e.keyCode;
                if (String.fromCharCode(charCode).match(/[^0-9]/g))
                    return false;

            });
            $('input.currency').trigger('change');

            /**
             * Percentage
             * @change
             * @keyup
             * @keypress
             */
            $(document).on('change', 'input.percentage', function (e, parent) {
                if (typeof parent != 'undefined' && parent == 'down_payment_amt') {
                    formatPercent($(this), e, false);
                } else {
                    formatPercent($(this), e, true);
                }
            });
            $(document).on('keypress', 'input.percentage', function (e, parent) {
                // only numbers
                var charCode = (e.which) ? e.which : e.keyCode;
                if (String.fromCharCode(charCode).match(/[^0-9.]/g))
                    return false;

            });
            $(document).on('keyup', 'input.percentage', function (e, parent) {
                if (e.keyCode === 9) return false;

                formatPercent($(this), e, true);

            });
            $('input.percentage').trigger('change');

            /**
             *
             */
            $(document).on('change keyup', 'input.currency-report', function (e, parent) {

                if ($(this).val().length == 1 && $(this).val() == 0)
                    $(this).val(0);

                $(this).val(formatNumber($(this).val().replace(',', '')));

            });
            $('input.currency-report').trigger('change');

            /**
             * Rst2And
             * @change
             */
            $(document).on('change', '.rst2andCheckbox', function() {
                const $container = $('.rst2andGroup');
                if(this.checked) {
                    $container.removeClass('hidden');
                }else{
                    $container.addClass('hidden');
                }
            });

            /**
             * Table Select Row
             * @change
             */

            $(document).on('click', '#parameters input[type="text"], #parameters input[type="number"], input.currency-report', function(e) {
                $(this).select();


            });

            $(document).on('keypress', '#parameters input[type="text"], #parameters input[type="number"], input.currency-report', function(e) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    e.preventDefault();
                }
            });

            /**
             * Share Plugins
             * @tippy
             */
            if( $('#btnShare').length ) {

                /**
                 * Template Popper
                 * @type {HTMLElement}
                 */
                const template_share = document.getElementById('contentShare');

                /**
                 * Tippy
                 */
                tippy('#btnShare', {
                    trigger             : 'click',
                    placement           : 'bottom-start',
                    content             : template_share.innerHTML,
                    allowHTML           : true,
                    interactiveDebounce : 0,
                    interactive         : true,
                    interactiveBorder   : 0,
                    appendTo            : document.getElementById('main'),
                });

            }

            /**
             * Mobile Info Table Panel Close
             * @click
             */
            $(document).on('click', '.mortgage_report__shedule-table-info .close', function (e) {

                $(this).parent().remove();

                $('.mortgage_report__shedule-table tbody').css('padding-top', '25px');

                e.preventDefault();

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
                    //cityPopupList.empty();

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

        },

        /**
         * Range Sliders
         */
        range_sliders: function() {

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

                            $('.current_payment').trigger('click');
                        }
                    });
                });
            }

            /**
             * Plan Range
             */
            const   $slider_plan    = $('.range-plan'),
                    slider_plan_min = Number($slider_plan.data('min')),
                    slider_plan_max = Number($slider_plan.data('max')),
                    slider_plan_val = Number($slider_plan.data('value'));

            var loan_term = document.getElementById("rstPlanValue");

            $slider_plan.slider({
                range: "min",
                min: slider_plan_min,
                max: slider_plan_max,
                value: slider_plan_val,
                slide: function (event, ui) {

                    var term_years = Math.floor(ui.value / 12);
                    var term_months = ui.value % 12;

                    loan_term.innerHTML = ui.value;

                    if (ui.value < 13) {
                        loan_term.innerHTML += (ui.value == 1 ? " month" : " months");
                    } else {
                        loan_term.innerHTML += " (";
                        if (term_years > 0) loan_term.innerHTML += term_years + (term_years == 1 ? " year" : " years");
                        if (term_months > 0) loan_term.innerHTML += ", " + term_months + (term_months == 1 ? " month" : " months");
                        loan_term.innerHTML += ")";
                    }

                },
                create: function (event, ui) {

                }
            });

        },

        /**
         * Tabs
         */
        tabs: function(e) {

            var $this = $(this),
                tab = $this.data('tab'),
                $container = $('.rstTabsContent');

            $container.find('.tab.active').removeClass('active');
            $container.find('[data-tab-content="' + tab + '"]').addClass('active');

            e.preventDefault();

        },

        /**
         * Compare Action
         */
        compare: function(e) {

            const   $this           = $(this),
                    $container      = $this.parent().parent().parent(),
                    id              = $this.data('id'),
                    $tab_label      = $('[data-tab-label="' + id + '"]'),
                    id_row          = $this.data('row-id'),
                    title           = $tab_label.text();

            if( $this.prop('checked') ) {

                $container.addClass('active');
                RST.scenario_compare.push(1); //Add Item Global Array

            }else{

                $container.removeClass('active');
                RST.scenario_compare.shift(); //Remove Item Global Array

            }

            /**
             * If Select Scenario
             */
            if( RST.scenario_compare.length > RST.scenario_compare_max ) {

                $this.prop('checked', false);
                $container.removeClass('active');
                RST.scenario_compare.shift();

                $('.attention').addClass('active');
                return false;
            }

            /**
             * Generate Template and Remove
             */
            if( $this.prop('checked') ) {

                var data_scenario = {
                    '%row%'           : id_row,
                    '%title%'         : title,
                    '%loan_type%'     : $('[data-scenario-loan-type="' + id + '"]').val(),
                    '%loan_amount%'   : $('[data-scenario-loan-ammount="' + id + '"]').val(),
                    '%rate%'          : $this.data('value-rate'),
                    '%apr%'           : $this.data('value-apr'),
                    '%closing_cost%'  : $this.data('value-costs'),
                    '%points%'        : $this.data('value-points'),
                    '%scenario%'      : id,
                };
                var tpl         = RST.template_scenario(data_scenario),
                    box_number  = 0, //Number Box
                    abort       = 0; //Abort each

                $('.rstItemScenario').each(function (index, value) {
                    var $this = $(this),
                        $select = $this.find('.rstItemScenarioItem');

                    if( $select.length === 0 && abort === 0 ) {
                        abort = 1;
                        box_number = $this.data('scenario')
                    }

                });

                $('[data-scenario="' + box_number + '"]').append(tpl);
                $('[data-scenario="' + box_number + '"]').find('.title strong').text(Number(box_number + 1));


            }else{

                $('.rest_calc__scenario').find('a[data-row="' + id_row + '"]').parent().parent().remove();

            }

            /**
             * Current Table Push Items
             */
            var items = [];
            $('[data-tab-table="' + id + '"] [data-row]').each(function (index, value) {
                const   $index = $(this),
                        status = $index.find('[type="checkbox"]').prop('checked');

                if( status === true ) {
                    items.push(index);
                }

            });

            /**
             *
             */
            if( items.length ) {
                $tab_label.addClass('active');
            }else{
                $tab_label.removeClass('active');
            }

            e.preventDefault();


        },

        /**
         * Attention
         * Open Popup Window
         */
        attention: function(e) {

            $('.attention').removeClass('active');

            e.preventDefault();

        },

        /**
         * Remove Scenario
         */
        remove_scenario: function(e) {

            e.stopPropagation();

            /**
             * Variables
             * @type {jQuery|HTMLElement|*}
             */
            let $this       = $(this),
                row         = $this.data('row'), //ID Row Table
                $item       = $('.rstTabsContent').find('input[data-row-id="' + row + '"]'), //Find Row in Table
                scenario    = $this.parent().parent().data('scenario-id'); //ID Scenario

            $this.parent().parent().remove(); //Remove Scenario

            /**
             * Table
             */
            $item.prop('checked', false);
            $item.parent().parent().parent().removeClass('active');
            RST.scenario_compare.shift();

            /**
             * Search in Table Selected Row
             * @type {*[]}
             */
            const items = [];
            $('[data-tab-table="' + scenario + '"] [data-row]').each(function (index, value) {

                const status = $(this).find('[type="checkbox"]').prop('checked');

                if( status === true ) {
                    items.push(index);
                }

            });



            if( items.length === 0 ) {
                $('.rstTabs [data-tab-label="' + scenario + '"]').removeClass('active');
            }

            e.preventDefault();

        },

        /**
         * Add Scenario Scroll To Table Box
         * @version 1.0
         */
        add_scenario: function(e) {

            var $container      = $('#rst_scenario_tabs'),
                top             = $container.offset().top,
                header_height   = $('#header').outerHeight(true),
                ht              = 60,
                sroll           = top - header_height - ht;

            $('body, html').animate({scrollTop: sroll}, 500);

            e.preventDefault();

        },

        /**
         * Clear All Scenario
         */
        clear_scenario: function(e) {

            /**
             * Clear Global Array
             * @type {*[]}
             */
            RST.scenario_compare = [];

            $('.rstItemScenario').each(function (index, value) {
                var $this   = $(this),
                    item    = $this.find('.rstRemoveScenario').data('row'),
                    $row    = $('.rstTabsContent').find('[data-row-id="' + item + '"]');

                $row.prop('checked', false);
                $row.parent().parent().parent().removeClass('active');
                $('.rstTabs').find('.active').removeClass('active');

                $this.find('.rest_calc__scenario-row-col-select').remove();

            });

            e.preventDefault();

        },

        /**
         * Clear All Scenario
         */
        scenario_item: function(e) {

            e.stopPropagation();

        },

        /**
         * Submit Form
         */
        submit: function(e, string) {

            /**
             * Submited
             */
            if( string === undefined ) e.preventDefault();

            /**
             * Submit and Click
             */
            if( e.type === 'submit' ) {

                RST.get_rates();

            } else if ( e.type === 'click' ) {

                $('.rstForm').trigger('submit', 'return');

            }

        },

        /**
         * Submit Form Get Rates
         */
        get_rates: function(e) {

            $('.rest_calc__table').addClass('loading');

            // TODO This Hartcode. Plase remove this code

            setTimeout(function () {
                $('.rest_calc__table').removeClass('loading');
            }, 1000);

        },

        /**
         * Generate Template
         * @param data
         * @returns {*}
         */
        template_scenario: function (data) {

            let tpl = $('.rstScenarioTpl').html(),
                out;

            var i = 0;
            $.each( data, function( key, val ) {

                if( i === 0 ) {
                    out = tpl.replace(key, val);
                }else{
                    out = out.replace(key, val);
                }

                i++;
            });

            return out;

        },

        /**
         * Print
         * @param data
         * @returns {*}
         */
        print: function () {

            /**
             * RST link print
             */
            $(document).on('click', '.rstPrint', function (e) {

                $('.print_modal__content').printThis({
                    importCSS: true,
                });

                e.preventDefault();

            });

        },

        /**
         * Print Open Modal
         * @param data
         * @returns {*}
         */
        print_modal: function () {

            const $container = $('.rest_calc__table');

            /**
             * Ajax
             */
            $.ajax( {
                beforeSend  :   function(xhr){
                    $container.addClass('loading');
                },
                data        :   {
                    action  : 'fancybox_print',
                },
                dataType    :   'json',
                method      :   'POST',
                complete    :   function(){
                    $container.removeClass('loading');
                },
                success     :   function( response ){

                    if( response.success == true ) {

                        $.fancybox.close();
                        $.fancybox.open({
                            type: 'html',
                            src: response.data.html,
                            opts : {
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
                                    '<div class="fancybox-container print" role="dialog" tabindex="-1">' +
                                    '<div class="fancybox-bg"></div>' +
                                    '<div class="fancybox-inner">' +
                                    '<div class="fancybox-stage"></div>' +
                                    '</div>' +
                                    '</div>',
                                afterShow : function( instance, current ) {

                                }
                            }
                        });

                    }

                },
                url         :   sm_obj.ajaxurl
            } );

        },

    };

    RST.init();
    //RST.scenario_compare_max = 3;

});
