'use strict';

jQuery(document).ready(function ($) {
    var fields = {
            currentLoan: {
                amount: {
                    field: $('input[name=loanAmount]'),
                    type: 'amount',
                    min: 1,
                    max: 10000000,
                    required: true,
                },
                interestRate: {
                    field: $('input[name=interestRate]'),
                    type: 'percentage',
                    min: 1,
                    max: 100,
                    required: true
                },
                term: {
                    field: $('#loanTerm'),
                    type: 'term',
                    min: 1,
                    max: 30,
                    required: true
                },
                originationMonthYear: {
                    field: $('input[name=originationYear]'),
                    type: 'year',
                    min: 1980,
                    max: new Date().getFullYear(),
                    required: true
                }
            },
            newLoan: {
                interestRate: {
                    field: $('input[name=newInterestRate]'),
                    type: 'percentage',
                    min: 1,
                    max: 100,
                    required: true
                },
                term: {
                    field: $('#newLoanTerm'),
                    type: 'term',
                    min: 1,
                    max: 30,
                    required: true
                },
                cashOut: {
                    field: $('input[name=newCashOut]'),
                    type: 'amount',
                    min: 0,
                    max: 10000000,
                    required: false
                },
                closingCosts: {
                    field: $('input[name=newClosingCosts]'),
                    type: 'amount',
                    min: 0,
                    max: 10000000,
                    required: false
                }
            }
        },
        resultFields = {
            currentMonthlyPayment: {
                field: $('#currentMonthlyPayment'),
                type: 'amount',
                trigger: ['calculate']
            },
            newMonthlyPayment: {
                field: $('#newMonthlyPayment'),
                type: 'amount',
                trigger: ['calculate']
            },
            monthlySavings: {
                field: $('#monthlySavings'),
                type: 'amountS',
                trigger: ['calculate']
            },
            totalSavingsFull: {
                field: $('#totalSavingsFull'),
                type: 'totalSavingsFull',
                trigger: ['calculate', 'chart']
            },
            breakevent: {
                field: $('#breakevent'),
                type: 'breakevent',
                trigger: ['calculate']
            },
            throughYear: {
                field: $('#throughYear'),
                type: 'throughYear',
                trigger: ['calculate', 'chart']
            },
            totalSavings: {
                field: $('#totalSavings'),
                type: 'chart',
                trigger: ['calculate', 'chart']
            },
            currentTotal: {
                field: $('#currentTotal'),
                type: 'chart',
                trigger: ['calculate', 'chart'],
                hideSymbol: 1
            },
            newTotal: {
                field: $('#newTotal'),
                type: 'chart',
                trigger: ['calculate', 'chart'],
                hideSymbol: 1
            },
            cashSavings: {
                field: $('#cashSavings'),
                type: 'chart',
                trigger: ['calculate', 'chart']
            },
            currentPrincipalTotal: {
                field: $('#currentPrincipalTotal'),
                type: 'chart',
                trigger: ['calculate', 'chart'],
                hideSymbol: 1
            },
            newPrincipalTotal: {
                field: $('#newPrincipalTotal'),
                type: 'chart',
                trigger: ['calculate', 'chart'],
                hideSymbol: 1
            },
            differenceInEquity: {
                field: $('#differenceInEquity'),
                type: 'chart',
                trigger: ['calculate', 'chart']
            }
        },
        activeChartPoint = 29,
        updateChartTableTimeout = 0;

    init_range_sliders();

    /* helpers */
    function inputToNumber(input) {
        if (input === undefined) {
            return 0 ;
        }
        return Number(input.replace(/[^0-9\.]+/g, ''));
    }

    function numberToCurrency(number, digits, currency, forceSign, showSymbol) {
        // const sign = Math.sign(number);
        var sign = Math.round(number);
        number = parseFloat(parseFloat(Math.abs(number)).toFixed(digits)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        var result = showSymbol ? (sign < 0 && number ? '-' : forceSign && sign > 0 ? '+' : '') + (currency ? '$' : '') + number : (currency ? '$' : '') + number;
        return sign < 0 ? '<span class="redText">' + result + '</span>' : result;
    }

    function numberToCurrencyK(number, digits, currency) {
        var sign = Math.sign(number);
        number = Math.abs(number) > 999 ? (Math.abs(number) / 1000).toFixed(digits) + 'k' : Math.abs(number).toFixed(digits);
        return (sign == '-1' && number ? '-' : '') + (currency ? '$' : '') + number;
    }

    function numberToPercent(number, digits) {
        return parseFloat(parseFloat(number).toFixed(digits));
    }

    function formatValue(val, fieldType, sign, digits, showSymbol) {
        switch (fieldType) {
            case 'amount':
                val = numberToCurrency(val, digits, sign, false, showSymbol);
                break;

            case 'amountS':
            case 'amountK':
                val = numberToCurrency(val, digits, sign, true, showSymbol);
                break;

            case 'percentage':
                val = numberToPercent(val, digits) + (sign ? '%' : '');
        }

        return val;
    }

    function formatField($this, fieldObj) {
        if (fieldObj.type != 'year') {
            var val = $this.val();

            if (val.length) {
                $this.val(formatValue(inputToNumber(val), fieldObj.type, true, (fieldObj.type == 'percentage' ? 3 : 2), true));
            }
        }
    }

    function validateField($this, fieldObj) {
        hideFieldError($this);

        var val = $this.val();

        if (fieldObj && fieldObj.required && val === '') {
            showFieldError($this, 'required', fieldObj);
            return false;
        }

        val = inputToNumber(val);

        if (val < fieldObj.min) {
            showFieldError($this, 'min', fieldObj);
            return false;
        } else if (val > fieldObj.max) {
            showFieldError($this, 'max', fieldObj);
            return false;
        }

        return true;
    }

    function showFieldError($this, errorType, fieldObj) {
        var msg = pageVars.err[errorType];

        if (errorType === 'min' || errorType === 'max') {
            msg = msg.replace('%s', formatValue(fieldObj[errorType], fieldObj.type, true, 0, true));
        }

        msg = '<div class="field-error-msg">' + msg + '</div>';
        $(msg).insertAfter($this);
        $this.addClass('field-error');
    }

    function hideFieldError($this) {
        if ($this == undefined) {
            $this = $('.field-error-msg');
        }

        $this.siblings('.field-error-msg').remove();
        $this.removeClass('field-error');
    }

    function getFieldsValues(format) {
        var values = {};

        for (var loan in fields) {
            for (var field in fields[loan]) {
                switch (fields[loan][field].type) {
                    case 'percentage':
                        values[loan + '_' + field] = inputToNumber(fields[loan][field].field.val());
                        if (format) {
                            values[loan + '_' + field] = monthlyRate(values[loan + '_' + field]);
                        }
                        break;

                    case 'term':
                        values[loan + '_' + field] = inputToNumber(fields[loan][field].field.val());
                        if (format) {
                            values[loan + '_' + field] = termInMonth(values[loan + '_' + field]);
                        }
                        break;

                    case 'year':
                        values[loan + '_' + field] = fields[loan][field].field.val();
                        break;

                    default:
                        values[loan + '_' + field] = inputToNumber(fields[loan][field].field.val());
                }
            }
        }

        return values;
    }

    function monthlyRate(rate) {
        return rate / 12 / 100;
    }

    function termInMonth(term) {
        return term * 12;
    }

    /* helpers - END */

    /* filter inputs */
    /*  $('.calc__input.money').inputFilter(function(value) {
     return /^\d*\.?\d*$/.test(value.replaceAll(',', ''));
     }); */

    /* $('.field .percentageVal').inputFilter(function(value) {
     return /^\d*\.?\d*$/.test(value);
     });

    /* filter inputs - END */

    // listen field change event

    function listenChangeEvent() {
        var map = {}
        for (var loan in fields) {
            for (var field in fields[loan]) {
                map[fields[loan][field]['field'].attr('name')] = {
                    loan: loan,
                    field: field
                }
                fields[loan][field]['field'].on('change', function () {
                    formatField($(this), fields[map[$(this).attr('name')].loan][map[$(this).attr('name')].field]);

                    if (validateField($(this), fields[map[$(this).attr('name')].loan][map[$(this).attr('name')].field])) {
                        calculate();
                    }
                });
            }
        }
    }

    listenChangeEvent();

    // make calculations and show results
    function calculate() {
        var values = getFieldsValues(true),
            results = {
                chart: new Array(),
                breakevent: false
            };

        results.currentMonthlyPayment = monthlyPayment(values.currentLoan_amount, values.currentLoan_interestRate, values.currentLoan_term);
        values.remainingTerm = remaininigLoanTermMonth(values.currentLoan_term, values.currentLoan_originationMonthYear);
        values.newLoan_amount = remaininigLoanAmount(results.currentMonthlyPayment, values.currentLoan_interestRate, values.remainingTerm) + values.newLoan_cashOut + values.newLoan_closingCosts;
        results.newMonthlyPayment = monthlyPayment(values.newLoan_amount, values.newLoan_interestRate, values.newLoan_term);
        results.monthlySavings = results.currentMonthlyPayment - results.newMonthlyPayment;
        var monthObj = {
            currentPrincipalRemaining: values.newLoan_amount - values.newLoan_cashOut - values.newLoan_closingCosts,
            currentPrincipalTotal: 0,
            currentInterestTotal: 0,
            currentTotal: 0,
            newPrincipalRemaining: values.newLoan_amount,
            newPrincipalTotal: 0,
            newInterestTotal: 0,
            newTotal: 0,
            cashSavings: 0,
            differenceInEquity: 0,
            totalSavings: 0
        };

        for (var month = 1; month <= Math.max(values.remainingTerm, values.newLoan_term); month++) {
            if (month <= values.remainingTerm) {
                var currentInterest = monthObj.currentPrincipalRemaining * values.currentLoan_interestRate;
                monthObj.currentPrincipalTotal += results.currentMonthlyPayment - currentInterest;
                monthObj.currentInterestTotal += currentInterest;
                monthObj.currentTotal += results.currentMonthlyPayment;
                monthObj.currentPrincipalRemaining -= results.currentMonthlyPayment - currentInterest;
            }

            var newInterest = monthObj.newPrincipalRemaining * values.newLoan_interestRate;
            monthObj.newPrincipalTotal += results.newMonthlyPayment - newInterest;
            monthObj.newInterestTotal += newInterest;
            monthObj.newTotal += results.newMonthlyPayment;
            monthObj.newPrincipalRemaining -= results.newMonthlyPayment - newInterest;
            monthObj.cashSavings = monthObj.currentTotal - monthObj.newTotal;
            monthObj.differenceInEquity = monthObj.currentPrincipalTotal - monthObj.newPrincipalTotal;
            monthObj.totalSavings = monthObj.cashSavings + monthObj.differenceInEquity;

            if (month % 12 == 0) {
                results.chart.push($.extend({}, monthObj));
            }

            if (results.breakevent === false && monthObj.totalSavings > 0) {
                results.breakevent = month;
            }
        }

        //results.totalSavingsFull = monthObj.totalSavings;

        if (activeChartPoint > results.chart.length) {
            activeChartPoint = results.chart.length - 1;
        }

        buildChart(results);
        showResults(results, 'calculate');
    }

     calculate();

    function monthlyPayment(amount, interestRate, term) {
        return amount * (interestRate * Math.pow(interestRate + 1, term) / (Math.pow(interestRate + 1, term) - 1));
    }

    function remaininigLoanTermMonth(term, originationMonthYear) {
        var date = new Date(),
            currentDate = new Date(date.getFullYear(), date.getMonth(), 1),
            months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

        originationMonthYear = originationMonthYear.split(' ');
        originationMonthYear[0] = Math.max(0, months.indexOf(originationMonthYear[0]));

        var originationDate = new Date(originationMonthYear[1], originationMonthYear[0]),
            diff = new Date(currentDate.getTime() - originationDate.getTime()),
            diffMonth = (diff.getUTCFullYear() - 1970) * 12 + diff.getUTCMonth();

        return term - diffMonth;
    }

    function remaininigLoanAmount(monthlyPayment, interestRate, remainingTerm) {
        return Math.max(0, monthlyPayment * (1 - Math.pow(1 + interestRate, -remainingTerm)) / interestRate);
    }

    function buildChart(data) {
        var chartData = [],
            isMobile = $(document).width() < 767;

        for (var i = 0; i < data.chart.length; i++) {
            chartData.push([(i + 1), data.chart[i].totalSavings]);
        }

        Highcharts.chart('refChart', {
            navigator: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            chart: {
                type: 'area',
                style: {
                    fontFamily: 'Poppins'
                },
                events: {// load() {
                    //     this.series[0].points[activeChartPoint].select()
                    // }
                }
            },
            rangeSelector: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            title: {
                text: ''
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            yAxis: {
                tickColor: '#000',
                tickWidth: 1.5,
                plotLines: [{
                    color: '#000',
                    zIndex: 10,
                    value: 30,
                    width: 1.5
                }],
                gridLineColor: '#fff',
                lineColor: '#000',
                lineWidth: 1.5,
                title: {
                    margin: isMobile ? 10 : 15,
                    text: pageVars.totalSavings,
                    style: {
                        color: '#222222',
                        fontSize: isMobile ? '12px' : '14px'
                    }
                },
                offset: isMobile ? -2 : -7,
                labels: {
                    // left: 0,
                    color: '#000',
                    // x: isMobile ? -20 : -30,
                    formatter: function formatter() {
                        return formatValue(this.value, 'amount', true, 0, true);
                    },
                    style: {
                        color: '#222222',
                        fontSize: isMobile ? '12px' : '14px'
                    }
                }
            },
            xAxis: {
                tickColor: '#000',
                tickWidth: 1.5,
                lineColor: '#000',
                lineWidth: 1.5,
                gridLineColor: '#fff',
                // left: isMobile ? 117 : 0,
                title: {
                    text: pageVars.year.plural,
                    style: {
                        color: '#222222',
                        fontSize: isMobile ? '12px' : '14px'
                    }
                },
                crosshair: {
                    width: 2,
                    color: '#8B8B8B',
                    zIndex: 10
                },
                //tickInterval: 60,
                labels: {
                    // left: 0,
                    align: 'center',
                    /*formatter: function formatter() {
                     return this.value;
                     },*/
                    style: {
                        color: '#000',
                        fontSize: '14px'
                    }
                }
            },
            series: [{
                allowPointSelect: false,
                lineWidth: 1.5,
                data: chartData,
                color: '#4064E4',
                negativeColor: '#FF5722',
                fillColor: '#F0F3FF',
                negativeFillColor: '#FFCDC0',
                states: {
                    hover: {
                        enabled: false,
                        lineWidth: 1.5
                    }
                }
            }],
            legend: {
                enabled: false
            },
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function formatter() {
                    activeChartPoint = this.x - 1;
                    clearTimeout(updateChartTableTimeout);
                    updateChartTableTimeout = setTimeout(function () {
                        showResults(data, 'chart');
                    }, 100);
                    return '<span class="tooltipTitle"><strong>' + this.x + '</strong> ' + (this.x > 1 ? pageVars.year.plural : pageVars.year.singular) + '</span><span class="tooltipText">' + pageVars.totalSavings + ': ' + formatValue(this.y, 'amount', true, 0, true) + '</span>';
                }
            }
        });
    }

    function formatTerm(month) {
        var year = Math.floor(month / 12),
            months = month - year * 12,
            yearLabel = year > 1 ? pageVars.year.plural : pageVars.year.singular,
            monthLabel = months > 1 ? pageVars.month.plural : pageVars.month.singular;
        return (year ? '<strong>' + year + '</strong> ' + yearLabel : '') + ' ' + (months ? '<strong>' + months + '</strong> ' + monthLabel : '');
    }

    function showResults(results, event) {
        var showSymbol = false;

        for (var k in resultFields) {
            if (resultFields[k].trigger.indexOf(event) == -1) continue;

            switch (resultFields[k].type) {
                case 'amount':
                    resultFields[k].field.html(formatValue(results[k], 'amount', true, 0, true));
                    break;

                case 'amountS':
                    showSymbol = results[k].hasOwnProperty('hideSymbol') ? 0 : 1;
                    resultFields[k].field.html(formatValue(results[k], 'amountS', true, 0, showSymbol));
                    break;

                case 'chart':
                    showSymbol = resultFields[k].hasOwnProperty('hideSymbol') ? 0 : 1;
                    resultFields[k].field.html(formatValue(results.chart[activeChartPoint][k], 'amountK', true, 0, showSymbol));
                    break;

                case 'breakevent':
                    resultFields[k].field.html(results.breakevent ? pageVars.breakevent.replace('%s', formatTerm(results.breakevent)) : '&nbsp;');
                    break;

                case 'throughYear':
                    resultFields[k].field.html(activeChartPoint + 1);
                    break;

                case 'totalSavingsFull':
                    var yearHtml = (activeChartPoint + 1) + ' ' + (activeChartPoint == 0 ? pageVars.year.singular : pageVars.year.plural);
                    resultFields[k].field.html('<span class="total-savings-full-period">(' + yearHtml + ')</span><span class="total-savings-full-value">' + formatValue(results.chart[activeChartPoint]['totalSavings'], 'amount', true, 0, true) + '</span>');
            }
        }
    }

    /* range slider */
    var $range = $('.customRange__input'),
        $rangeActiveLine = $('.customRange__active'),
        $rangeTarget = $($range.attr('data-range-target')),
        rangeMax = parseFloat($range.attr('max'));
    $range.on('change input', function (e) {
        var val = inputToNumber($(this).val());
        $rangeTarget.val(numberToCurrency(val), 0, false, false);
        setCustomRangeActiveLine(val);

        if (e.type === 'change') {
            $rangeTarget.change();
        }
    });
    $rangeTarget.on('change', function () {
        var val = inputToNumber($(this).val());
        $range.val(val);
        setCustomRangeActiveLine(val);
    });
    $rangeTarget.val(200000).trigger('change');

    function setCustomRangeActiveLine(val) {
        $rangeActiveLine.css('width', Math.min(100, Math.ceil(val / rangeMax * 100)) + '%');
    }

    /* range slider - END */

    /* origination year datepicker */
    $('input[name=originationYear]').MonthPicker({
        ShowIcon: false,
        StartYear: inputToNumber($('input[name=originationYear]').val()),
        MinMonth: new Date(fields['currentLoan']['originationMonthYear'].min, 0, 1),
        MaxMonth: new Date(fields['currentLoan']['originationMonthYear'].max, 11, 31),
        MonthFormat: 'MM yy',
        ShowAnim: 'none',
        HideAnim: 'none',
        OnAfterChooseMonth: function (selectedDate) {
            if (validateField($('input[name=originationYear]'), fields['currentLoan']['originationMonthYear'])) {
                $('input[name=originationYear]').MonthPicker({StartYear: new Date(selectedDate).getFullYear()});
                calculate();
            }
        }
    });
    /* origination year datepicker - END */

    $(document).on('keypress', '.calc__radio label', function (e) {
        $(this).click();
    });

    // full report btn
    $(document).on('click', '#full-report', function (e) {
        e.preventDefault();
        window.open($(this).attr('href') + '?report-data=' + Base64.encodeURI(JSON.stringify(getFieldsValues(false))));
        return false;
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