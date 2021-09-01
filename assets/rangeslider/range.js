/**
 * Created by Neiasut on 31.10.2017.
 * Version: 1.0
 */

/* Require jquery#1.12.4 */

'use strict';

(function ($) {

    if (typeof $ !== 'undefined') {
        window.inputSliderRange = {
            active: false,
            themes: {},
            addTheme: function (name, objectSettings) {
                this.themes[name] = objectSettings;
            },
            getTheme: function (name) {
                return this.themes[name] !== undefined ? this.themes[name] : {};
            }
        };
    }

    let isMobile = is_touch_device(),
        events = {
            move: isMobile ? 'touchmove' : 'mousemove',
            end: isMobile ? 'touchend' : 'mouseup',
            start: isMobile ? 'touchstart' : 'mousedown'
        };

    function changePositionByDragMouse(event, endDrag = false) {

        let config = window.inputSliderRange.active,
            leftMouse = isMobile
                ? endDrag ? event.originalEvent.changedTouches[0].pageX : event.originalEvent.touches[0].pageX
                : event.pageX,
            rectangle = config.self[0].getBoundingClientRect(),
            leftBool = rectangle.left <= leftMouse,
            rightBool = rectangle.right > leftMouse;

        if (leftBool && rightBool) {
            let left = Math.round(leftMouse - rectangle.left);
            setTo(config.self, left / (rectangle.width / 100), true, false, endDrag, true, 1);
        } else {
            setTo(config.self, (!leftBool) ? 0 : 100, true, false, endDrag, true, 1);
        }
    }

    $(document).on(events.move, function (event) {
        if (window.inputSliderRange.active && typeof window.inputSliderRange.active === 'object') {
            //alert('touch start');
            changePositionByDragMouse(event);
        }
    }).on(events.end, function (event) {
        if (window.inputSliderRange.active && typeof window.inputSliderRange.active === 'object') {
            changePositionByDragMouse(event, true);
            window.inputSliderRange.active.elements.parent.removeClass('dragged');
            window.inputSliderRange.active.follow = false;
            window.inputSliderRange.active = false;
        }
    });

    function getBaseConfig() {
        return {
            min: 0,
            max: 100,
            start: 50,
            step: 1,
            delay: 0,
            onInitialize: false,
            onInitialized: false,
            onChange: false,
            onChanged: false,
            grid: false,
            gridSuffix: '',
            gridCompression: false,
            gridCompressionPercent: 10,
            gridCompressionValues: {
                '-9999999': {text: '', compression: 0, digits: 0},
                '1000': {text: 'Thousand', compression: 3, digits: 0},
                '1000000': {text: 'Million', compression: 6, digits: 1},
                '1000000000': {text: 'Billion', compression: 9, digits: 1}
            },
            gridInwardly: false,
            thumb: false,
            startCheckValueInput: true,
            classes: {
                parent: [],
                input: []
            },
            theme: false,
            disabled: false,
            stepRoundOnInput: true,
            startNumbStepping: false
        }
    }

    let methods = {

        init: function (options) {

            return this.each(function () {

                let $this = $(this),
                    data = $this.data('inputSliderRange'),
                    val = $this.val(),
                    attrConfig = getConfigFromAttr($this),
                    theme = typeof attrConfig.theme !== 'undefined' ? attrConfig.theme : options.theme,
                    themeConfig = window.inputSliderRange.getTheme(theme);

                let settings = $.extend(
                    true,
                    {},
                    getBaseConfig(),
                    themeConfig,
                    options,
                    attrConfig
                );

                if (typeof data === 'undefined') {

                    callCallbackConfig(settings.onInitialize, {});
                    generateEvents(
                        $this[0],
                        'inputSliderRange_initialize'
                    );

                    if (settings.startCheckValueInput && validateInput(val)) {
                        settings.start = removeReplace(val);
                    }

                    let current = calculateCurrentValue(settings.start, settings.min, settings.max);

                    $this.data('inputSliderRange', {
                        self: $this,
                        follow: false,
                        settings: settings,
                        current: current,
                        currentOld: false,
                        lastInput: current,
                        timer: false,
                        elements: {}
                    });

                    let config = getConfig($this);
                    $this.val(config.current);

                    constructor($this, config);

                    $this
                        .on('keydown', function (e) {
                            let k = e.which || e.button;
                            if (e.ctrlKey && (k === 86 || k === 88)) return false;
                        })
                        .on('input', function () {

                            let value = $(this).val();

                            if (!validateInput(value) && value !== '') {
                                $(this).val(config.lastInput);
                                return false;
                            } else {
                                if (value !== '') {
                                    config.lastInput = value;
                                }
                            }

                        }).on('focus', function () {
                        $this.val(removeReplace(config.current));
                    }).on('blur', function () {
                        setTo($(this), $(this).val(), false, true, true, true, 2);
                    });

                    config.elements.handler
                        .on(events.start, function () {
                            config.follow = true;
                            config.elements.parent.addClass('dragged');
                            window.inputSliderRange.active = config;
                        });

                    config.elements.scale
                        .on(events.start, function () {
                            config.follow = true;
                            config.elements.parent.addClass('dragged');
                            window.inputSliderRange.active = config;
                        });

                    config.elements.goto.on('mousedown touch', function (event) {
                        let percent = event.offsetX / (this.getBoundingClientRect().width / 100);

                        setTo($this, percent, true, false, true, true, 0);
                    });

                    setTo($this, config.current, false, true, true, true, 2);
                    toggleGridInwardly(config);

                    callCallbackConfig('onInitialized', config);
                    generateEvents(
                        config.self[0],
                        'inputSliderRange_initialized',
                        generateOutputInfoToEvent(config)
                    );

                    checkDisabledConfigAndSet($this, settings);
                }
            });
        },
        setTo: function (toCount, percentage = false, runEvents = true) {
            return this.each(function () {
                setTo($(this), toCount, percentage, true, true, runEvents, 2);
            })
        },
        update: function (options, runEvents = true) {
            return this.each(function () {
                let config = getConfig($(this)),
                    settings = jQuery.extend(
                        true,
                        getBaseConfig(),
                        window.inputSliderRange.getTheme(options.theme),
                        config.settings,
                        options
                    );
                config.settings = settings;
                config.settings.current = calculateCurrentValue(settings.start, settings.min, settings.max);

                grid(config);
                thumb(config);
                toggleGridInwardly(config);
                checkDisabledConfigAndSet($(this), settings);

                methods.setTo.call(config.self, config.settings.current, false, runEvents);
            });
        }
    };

    /**
     *
     * @param $element - инпут
     * @param toCount - передаваемое первоначальное значение, куда тыкать
     * @param percentage - проценты
     * @param important - запустить в любом случае
     * @param viewChangeOnEnd - закончено ли действи
     * @param runEvents - запускать событие?
     * @param inputTypeScroll - тип действия. 0 - click, 1 - scroll, 2 - changeValue
     * @returns {boolean}
     */
    function setTo($element, toCount, percentage = false, important = false, viewChangeOnEnd = true,
                   runEvents = true, inputTypeScroll = 0) {

        let config = getConfig($element);

        if ($element.val() === '' || toCount === '') {
            toCount = config.lastInput;
        }

        if (!validateInput(toCount) && $element.val() !== '') {
            $element.val(config.current);
            return false;
        }

        let toCountTransform = getTransformValue(
            toCount,
            percentage,
            config.settings.min,
            config.settings.max,
            config.settings.startNumbStepping,
            config.settings.step,
            config.settings.stepRoundOnInput,
            inputTypeScroll
        );

        if (toCountTransform.value === config.current) {
            runEvents = false;
        }

        if (runEvents) {
            callCallbackConfig('onChange', config);
            generateEvents(
                config.self[0],
                'inputSliderRange_change',
                generateOutputInfoToEvent(config)
            );
        }

        if (!viewChangeOnEnd) {
            viewChangePosition(config, toCount);
        } else {
            important = true;
        }

        if ((config.currentOld !== toCountTransform.valueRaw) || important) {

            doProcess();

            if (runEvents) {
                if (config.settings.delay < 50) {
                    runOnChanged(config);
                } else {
                    clearTimeout(config.timer);
                    config.timer = setTimeout(() => {
                        runOnChanged(config);
                    }, config.settings.delay);
                }
            }
        }

        function runOnChanged(config) {
            callCallbackConfig('onChanged', config);
            generateEvents(
                config.self[0],
                'inputSliderRange_changed',
                generateOutputInfoToEvent(config)
            );
        }

        function doProcess() {

            config.currentPercentage = toCountTransform.percent;
            config.currentOld = config.current;
            config.current = toCountTransform.value;
            config.lastInput = config.current;

            if (viewChangeOnEnd) {
                changePosition(config);
            }

            config.self.val(thousandSeparator(config.current));
        }
    }

    function getTransformValue(toCount, percentage, min, max, startNumbStepping, step, stepRoundOnInput, inputTypeScroll) {
        if (typeof step === 'object') {
            return transformValueWithProportionSteps(...arguments)
        }

        let stepNew = {};
        stepNew[min] = step;

        return transformValueWithProportionSteps(toCount, percentage, min, max, startNumbStepping, stepNew, stepRoundOnInput, inputTypeScroll);
    }

    function transformValueWithProportionSteps(toCount, percentage, min, max, startNumbStepping, step,
                                               stepRoundOnInput, inputTypeScroll, roundSize = 10) {
        step = getValidSteps(step, min, max);

        const outputPackage = (percentRaw, valueRaw, percent, value) => ({
            percentRaw,
            valueRaw,
            percent,
            value
        });

        toCount = parseFloat(toCount);

        let rawValue,
            percent;

        if (percentage) {
            percent = validatePercent(toCount);
            rawValue = findRawValueByPercentInLineSegment(percent, min, max, step);
        } else {
            rawValue = parseFloat(validateValue(toCount, min, max));
        }

        rawValue = parseFloat(rawValue.toFixed(roundSize));


        if (inputTypeScroll === 1 || inputTypeScroll === 0) {
            stepRoundOnInput = true;
        }

        let rawPercent = getPercentByValueInLineSegment(rawValue, step, min, max);

        if (stepRoundOnInput) {
            let mostAppropriateValue = findMostAppropriateValueWithStepsInLineSegment(
                rawValue, step, min, max, startNumbStepping
                ),
                mostAppropriatePercent = getPercentByValueInLineSegment(mostAppropriateValue, step, min, max);

            return outputPackage(rawPercent, rawValue, mostAppropriatePercent, mostAppropriateValue);
        }

        return outputPackage(rawPercent, rawValue, rawPercent, rawValue);
    }

    const checkDisabledConfigAndSet = ($input, settings) => {
        let config = getConfig($input);
        config.disabled = settings.disabled;
        setDisabled(config.elements.parent, $input, settings.disabled);
    };

    const setDisabled = ($wrapper, $input, visible) => {
        if (!visible) {
            $wrapper.removeClass('InputSliderRange_disabled');
            $input.prop('disabled', false);
        } else {
            $wrapper.addClass('InputSliderRange_disabled');
            $input.prop('disabled', true);
        }
    };

    const findMostAppropriateValueWithStepsInLineSegment = (value, steps, start, end, startCount) => {

        let currentSegment = getNumbSegmentByValue(value, steps),
            neighbors = findLeftAndRightNeighborByValue(value, startCount, start, end, steps, currentSegment);

        return (value - neighbors.left >= neighbors.right - value) ? neighbors.right : neighbors.left;
    };

    const findLeftAndRightNeighborByValue = (value, startCount, start, end, steps, currentSegment) => {

        let bordersSegment = getMaxAndMinCurrentLineSegment(steps, start, end, currentSegment),
            startToCount = bordersSegment.min;

        if (currentSegment === 0 && startCount < bordersSegment.min) {
            startToCount = startCount;
        }

        let currentStep = Object.values(steps)[currentSegment],
            countStepsInSegment = getCountStepsInLineSegment(
                startToCount, bordersSegment.min, bordersSegment.max, currentStep
            ),
            leftNeighbor,
            rightNeighbor,
            firstStep = bordersSegment.min + countStepsInSegment.first;

        if (value < firstStep) {
            leftNeighbor = bordersSegment.min;
        } else if (value < firstStep + currentStep) {
            leftNeighbor = firstStep;
        } else {
            let diff = (value - firstStep) % currentStep;
            leftNeighbor = value - diff;
        }

        rightNeighbor = leftNeighbor + currentStep;

        if (rightNeighbor > bordersSegment.max) {
            rightNeighbor = bordersSegment.max;
        }

        return {
            left: leftNeighbor,
            right: rightNeighbor
        };
    };

    const getPercentByValueInLineSegment = (value, steps, start, end) => {

        let numbStep = getNumbSegmentByValue(value, steps),
            keys = Object.keys(steps),
            keysLength = keys.length;

        let bordersSegment = getMaxAndMinCurrentLineSegment(steps, start, end, numbStep),
            percentCalcInSegment = (value - bordersSegment.min) / ((bordersSegment.max - bordersSegment.min) / 100),
            plusPercents = calcStartSegmentPlusPercents(numbStep, keysLength);

        return plusPercents + percentCalcInSegment / keysLength;
    };

    const getValidSteps = (steps, start, end) => {

        let rev = [],
            retObject = {};

        let reverseArraySteps = Object.entries(steps).reverse();

        reverseArraySteps.every((arrWithKeys) => {
            let [border, step] = arrWithKeys,
                borderValue = parseFloat(border);

            if (borderValue > start) {
                rev.push([borderValue, step]);
                return true;
            }
            rev.push([start, step]);
            return false;
        });

        rev = rev.filter(value => {
            const [border] = value;
            return border <= end;
        });

        rev.reverse().forEach((arrValue) => {
            retObject[arrValue[0]] = arrValue[1];
        });

        return retObject;
    };

    const getNumbSegmentByValue = (value, steps) => {

        let numbStep = 0;

        Object.keys(steps).reverse().some((valueStep, index, arr) => {
            if (value < valueStep) {
                return false;
            }
            numbStep = arr.length - index - 1;
            return true;
        });

        return numbStep;
    };

    const calcStartSegmentPlusPercents = (numbSegment, quantitySegments) => {
        return 100 / quantitySegments * numbSegment;
    };

    const findRawValueByPercentInLineSegment = (percent, start, end, steps) => {

        let valuesStepsLength = Object.values(steps).length;
        let numbSegment = checkByPercentNumbLineSegment(percent, valuesStepsLength);
        let percentInLineSegment = getPercentInCurrentLineSegment(percent, numbSegment, valuesStepsLength);
        let bordersSegment = getMaxAndMinCurrentLineSegment(steps, start, end, numbSegment);

        return calcValueInSegment(percentInLineSegment, bordersSegment.min, bordersSegment.max);
    };

    const calcValueInSegment = (percent, minValue, maxValue) => {
        return minValue + percent * ((maxValue - minValue) / 100);
    };

    const getMaxAndMinCurrentLineSegment = (steps, start, end, numbSegment) => {

        let keys = Object.keys(steps),
            valuesSteps = Object.values(steps),
            lengthSegment = valuesSteps.length,
            min = keys[numbSegment],
            max;

        if (min < start) {
            min = start;
        }

        if (numbSegment < lengthSegment - 1) {
            max = keys[numbSegment + 1];
        } else {
            max = end;
        }

        return {
            min: parseFloat(min),
            max: parseFloat(max)
        }

    };

    const getPercentInCurrentLineSegment = (percentOnAllLine, numbSegment, quantitySegments) => {
        let percentOnSegment = getPercentInLineSegment(percentOnAllLine, numbSegment, quantitySegments);
        return percentOnSegment * quantitySegments;
    };

    const getPercentInLineSegment = (percent, numbSegment, quantitySegments) => {
        return percent - 100 / quantitySegments * numbSegment;
    };

    const checkByPercentNumbLineSegment = (percent, quantitySegments) => {
        if (percent >= 100) {
            return quantitySegments - 1;
        }
        return Math.floor(percent / (100 / quantitySegments));
    };

    const getCountStepsInLineSegment = (startCount, start, end, stepSize) => {

        let counter = 0,
            diffStart = (start - startCount) % stepSize,
            first = stepSize,
            last = stepSize;

        if (startCount < start && diffStart !== 0) {
            counter += 1;
            first = stepSize - diffStart;
            start += first;
        }

        let ceilPart = Math.floor((end - start) / stepSize),
            onEnd = end - (start + ceilPart * stepSize);

        counter += ceilPart;

        if (onEnd > 0) {
            counter += 1;
            last = onEnd;
        }

        return {
            first,
            last,
            counter,
            step: stepSize
        };
    };

    function toggleGridInwardly(config) {
        if (config.settings.gridInwardly) {
            config.elements.parent.addClass('InputSliderRange_grid_inwardly');
        } else {
            config.elements.parent.addClass('InputSliderRange_grid_inwardly');
        }
    }

    function getConfigFromAttr($element) {

        let attributesName = ['min', 'max', 'step', 'theme'],
            objectFormAttr = {};

        attributesName.forEach(attributeName => {
            let valueAttribute = $element.data(`isr-${attributeName}`);
            if (typeof valueAttribute !== 'undefined') {
                objectFormAttr[attributeName] = valueAttribute;
            }
        });

        return objectFormAttr;
    }

    function is_touch_device() {
        return (('ontouchstart' in window)
            || (navigator.MaxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0));
    }

    function validateValue(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    function validatePercent(percent) {
        if (percent < 0) {
            return 0;
        }
        if (percent > 100) {
            return 100;
        }
        return percent;
    }

    function changePosition(config) {
        viewChangePosition(config, config.currentPercentage);
    }

    function viewChangePosition(config, size) {

        let sizeText = size + '%';

        config.elements.handler.css('left', sizeText);
        config.elements.fill.css('width', sizeText);
    }

    function calculateCurrentValue(numb, min, max) {
        if (numb >= min && numb <= max) {
            return numb;
        } else {
            return (numb < min) ? min : max;
        }
    }

    function validateInput(text) {
        let decimal = /^[+-]?\d+(\.\d+)?$/;
        return !(('' + text).match(decimal) === null);
    }

    function constructor($element, config) {
        $element
            .addClass('InputSliderRange-Input' + generateClassToElement('input', config))
            .wrap(`<div class="InputSliderRange${generateClassToElement('parent', config)}"></div>`);

        config.elements.parent = $element.parent();

        constructorSlider($element, config);
    }

    function grid(config) {

        function constructorGrid() {
            return `
<div class="InputSliderRange-Grid">
    <div class="InputSliderRange-Label InputSliderRange-Label_position_first"></div>
    <div class="InputSliderRange-Label InputSliderRange-Label_position_last"></div>
</div>`
        }

        function contentGridElements() {
            let grid = config.elements.grid,
                firstHtml = config.settings.gridSuffix + compressionGridText(config.settings.min),
                lastHtml = config.settings.gridSuffix + compressionGridText(config.settings.max);
            if (config.settings.gridSuffix === '%') {
                firstHtml = compressionGridText(config.settings.min) + config.settings.gridSuffix;
                lastHtml = compressionGridText(config.settings.max) + config.settings.gridSuffix;
            }

            grid.first.html(firstHtml);
            grid.last.html(lastHtml);
        }

        function compressionGridText(value) {
            if (config.settings.gridCompression) {
                let objectResult = getDataFromDiapasonByValueMoreThan(config.settings.gridCompressionValues, value);
                let outputValue = (objectResult.value.value != null) ? objectResult.value.value : value;

                return roundPlus(outputValue, objectResult.value.compression, objectResult.value.digits) + '' + objectResult.value.text;
            }
            return thousandSeparator(outputValue);
        }

        function roundPlus(x, n, digits) { //x - число, n - количество порядков для сокращения, digits - количество знаков после сокращения
            if (isNaN(x) || isNaN(n)) return false;
            let m = Math.pow(10, n);
            return parseFloat((x / m).toFixed(digits));
        }

        function getDataFromDiapasonByValueMoreThan(objectDiapason, value) {

            const compressToObject = (key, value) => {
                return {key, value}
            };

            if (typeof objectDiapason === 'object') {

                let keys = Object.keys(objectDiapason).map((value) => parseFloat(value)).sort(),
                    needValue,
                    parseValue = parseFloat(value);

                for (let key of Array.prototype.slice.call(keys, 0).reverse()) {
                    let parseKey = parseFloat(key);
                    if (parseValue >= parseKey) {
                        needValue = compressToObject(parseKey, objectDiapason[key]);
                        break;
                    }
                }

                if (typeof needValue === 'undefined') {
                    return compressToObject(parseFloat(keys[0]), objectDiapason[keys[0]]);
                }

                return needValue;
            }
            return undefined;

        }

        if (typeof config.elements.grid === 'undefined') {
            config.elements.parent.append(
                constructorGrid(config)
            );
            let $parent = config.elements.parent;
            config.elements = $.extend(true, config.elements, {
                grid: {
                    first: $parent.find('.InputSliderRange-Label_position_first'),
                    last: $parent.find('.InputSliderRange-Label_position_last'),
                    self: $parent.find('.InputSliderRange-Grid')

                }
            });
        }

        function destructorGrid() {
            if (typeof config.elements.grid !== undefined) {
                config.elements.grid.self.remove();
            }
            delete(config.elements.grid);
        }

        if (config.settings.grid) {
            contentGridElements();
        } else {
            destructorGrid();
        }

    }

    function thumb(config) {

        function constructor() {
            return `
<div class="InputSliderRange-Thumb">
    <span class="InputSliderRange-ThumbInfo"></span>
</div>
`
        }

        let thumb = config.settings.thumb;

        if (typeof config.elements.thumb === 'undefined') {
            config.elements.parent.find('.InputSliderRange-WrapInput').append(constructor());
            config.elements = $.extend(true, config.elements, {
                thumb: config.elements.parent.find('.InputSliderRange-ThumbInfo')
            });
        }

        let thumbHTML = '';
        if (typeof thumb === 'function') {
            thumbHTML = thumb.call(null);
        }
        if (typeof thumb === 'string') {
            thumbHTML = thumb;
        }

        config.elements.thumb.html(thumbHTML);
    }

    function constructorSlider($element, config) {
        if (config.settings.grid) {
            grid(config);
        }

        $element.after(
            `<div class="InputSliderRange-Scale">
    <div class="InputSliderRange-Fill"></div>
    <div class="InputSliderRange-Goto"></div>
    <div class="InputSliderRange-Handler"></div>
</div>`
        );

        $element.wrap('<div class="InputSliderRange-WrapInput"></div>');

        thumb(config);

        let $parent = $element.parent().parent();

        config.elements = $.extend(true, config.elements, {
            scale: $parent.find('.InputSliderRange-Scale'),
            fill: $parent.find('.InputSliderRange-Fill'),
            handler: $parent.find('.InputSliderRange-Handler'),
            goto: $parent.find('.InputSliderRange-Goto')
        });
    }

    function getConfig($elem) {
        return $elem.data('inputSliderRange');
    }

    function generateEvents(elem, name, param) {
        let eventConfig = {
            bubbles: true
        };
        if (typeof param !== 'undefined') {
            eventConfig.detail = param;
        }

        elem.dispatchEvent(new CustomEvent(name, eventConfig));
    }

    function generateOutputInfoToEvent(config) {
        return {
            current: config.current,
            currentPercent: config.currentPercentage,
        };
    }

    function callCallbackConfig(nameCallback, config) {
        if (typeof nameCallback === 'function') {
            nameCallback.call(null);

            return false;
        }
        if (config.settings !== undefined && typeof config.settings[nameCallback] === 'function') {
            config.settings[nameCallback].call(null, {
                detail: generateOutputInfoToEvent(config)
            })
        }
    }

    function thousandSeparator(str) {
        str = '' + str;
        let parts = (str + '').split('.'),
            main = parts[0],
            len = main.length,
            output = '',
            i = len - 1;

        while (i >= 0) {
            output = main.charAt(i) + output;
            if ((len - i) % 3 === 0 && i > 0) {
                output = ' ' + output;
            }
            --i;
        }

        if (parts.length > 1) {
            output += '.' + parts[1];
        }
        return output;
    }

    function removeReplace(str) {
        return ('' + str).replace(/\s/g, "");
    }

    function generateClassToElement(nameElement, config) {

        if (config.settings.classes[nameElement].length < 1) {
            return '';
        }

        return ' ' + config.settings.classes[nameElement].join(' ');
    }

    $.fn.inputSliderRange = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' not exists in jQuery.inputSliderRange');
        }
    };

})(jQuery);

(function () {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        let evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
