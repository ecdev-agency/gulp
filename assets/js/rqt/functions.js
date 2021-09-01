// Function to create a cookie that (optionally) expires after specified number of days 
function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
 
    document.cookie = escape(name) + "=" +
        escape(value) + expires + "; path=/";
}


function removeCurrencyDots(str) {
    str = parseFloat(str).toFixed(0);
    let val = str.toString().replace(/\......[\s\S]*/g, '');
    return cleanNum(val);
}

function formatCurrency2(input, pos_select) {
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

    // check for decimal
    /* if (input_val.indexOf(".") >= 0) {
         // get position of first decimal
         // this prevents multiple decimals from
         // being entered
         var decimal_pos = input_val.indexOf(".");

         // split number by decimal point
         var left_side = input_val.substring(0, decimal_pos);
         var right_side = input_val.substring(decimal_pos);

         // add commas to left side of number
         left_side = formatNumber2(left_side);

         // validate right side
         right_side = formatNumber2(right_side);

         // On blur make sure 2 numbers after decimal
         if (blur === "blur") {
             right_side += "00";
         }

         // Limit decimal to only 2 digits
         right_side = right_side.substring(0, 2);

         // join number by .
         input_val = "$" + left_side + "." + right_side;

     } else {
         // no decimal entered
         // add commas to number
         // remove all non-digits
         input_val = formatNumber2(input_val);
         input_val = "$" + input_val;

         // final formatting
         if (blur === "blur") {
             input_val += ".00";
         }
     }*/

    input_val = formatNumber2(input_val);
    input_val = "$" + input_val;
    input.val(input_val);

    // put caret back in the right position
    if (pos_select == true)
    {
        var updated_len = input_val.length;
        caret_pos = updated_len - original_len + caret_pos;
        input[0].setSelectionRange(caret_pos, caret_pos);
    }

    jQuery(document).trigger('input-value-formatted-end');
}


function formatNumber2(n) {
    // format number 1000000 to 1,234,567
    return n.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function formatNumber(num) {
    num = parseFloat(num);

    if (isNaN(num)) {
        return '';
    } else if (typeof num !== 'number') {
        num = parseFloat(num);
    }

    return num.toLocaleString('en-US');
}

function formatPercentDigits(n) {
    return n.toString().match(/^\d+\.?\d{0,2}/);
}

function cleanNum(num) {
    let val = parseFloat(num.replace(/[^-0123456789.]/g, ''));

    if (isNaN(val)) val = 0;
    return val;
}

// clean all currency symbols to clear numbers & validate currency / percentage
function cleanNum_validate(num) {
    let val = num.replace(/[^-0123456789.]/g, '');
    var regex  = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;

    return (regex.test(val) == true) ? val : '';
}

// This function formats a passed float number as percent, rounding to 2 decimals and adding '%' suffix
function formatPercent(input, e, pos_select) {
    let val = input.val(),
        allowedCodes = [8, 9, 27, 35, 36, 37, 38, 39, 46, 110, 188],
        max = parseFloat(input.attr('max')),
        prefix = '';

    // format percent input (only two digits)
    val = formatPercentDigits(val);

    // only real numbers press
    if (!(allowedCodes.some(code => code === e.keyCode))) {
        // if value more max
        if (val > max) {
            val = val.toString().slice(0, -1);
        }

        // if many zero numbers
        if (val.toString().substr(0, val.toString().lastIndexOf('0') + 1).length > 1) {
            val = parseFloat(val).toFixed(2);
        }


    }

    if (e.type == 'change') {
        val = parseFloat(val).toFixed(2);
    }

    if (!val) return;

    if (!(allowedCodes.some(code => code === e.keyCode))) {
        prefix = '%';
    }

    input.val(val + prefix);

    if (pos_select == true)
    input[0].setSelectionRange(input.val().length - 1, input.val().length);
}

function createCookieHours(name, value, hours) {
    var now = new Date();
    var time = now.getTime();
    time += (hours * 3600) * 1000;
    now.setTime(time);
    document.cookie =
        name + '=' + value +
        '; expires=' + now.toUTCString() +
        '; path=/';
}


function setQueryStringParameter(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${params}`));
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function delCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function convertToMixedCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

// This is a supplemental function for copying text from screen to clipboard - don't call it directly
function getSelectionText() {
    var selectedText = ""
    if (window.getSelection) { // all modern browsers and IE9+
        selectedText = window.getSelection().toString()
    }
    return selectedText
}

// Below are 4 functions used for copying text from screen to the clipboard
// Written on 03/27/2020 by Oleg Moskalensky
//
// This is a supplemental function for copying text from screen to clipboard - don't call it directly
function selectElementText(el) {
    var range = document.createRange() // create new range object
    range.selectNodeContents(el) // set range to encompass desired element text
    var selection = window.getSelection() // get Selection object from currently user selected text
}

// This is a supplemental function for copying text from screen to clipboard - don't call it directly
function selectAllText(el) {
    var range = document.createRange() // create new range object
    range.selectNodeContents(el) // set range to encompass desired element text
    var selection = window.getSelection() // get Selection object from currently user selected text
    selection.removeAllRanges() // unselect any user selected text (if any)
    selection.addRange(range) // add range to Selection object to select it
}

// This function copies selected text in element id 'el', to the clipboard
function copy2clip(el) {
    var copyText = document.getElementById(el);
    selectElementText(copyText) // select the element's text we wish to read
    var content = getSelectionText() // read the user selection
    document.execCommand("copy");
}

// This function copies ALL text in element id 'el', to the clipboard
function copyall2clip(el) {
    var copyText = document.getElementById(el);
    selectAllText(copyText) // select the element's text we wish to read
    var content = getSelectionText() // read the user selection
    document.execCommand("copy");
}

// This function formats a passed numeric integer (doesn't work with floats) value as currency, adding '$' and commas
function formatCurrency(n) {
    // return "$" + new Intl.NumberFormat().format(n);
    return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// This function removes currency/percent formatting, returning just the numeric portion
function stripFormat(c) {

    return c.replace(/[^0-9.]/g, "");
}


function Base64Decode(str, encoding = 'utf-8') {
    var bytes = base64js.toByteArray(str);
    return new (TextDecoder || TextDecoderLite)(encoding).decode(bytes);
}


var decodeEntities = (function () {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('div');

    function decodeHTMLEntities(str) {
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    return decodeHTMLEntities;
})();


function distinct(array) {
    var flags = [], output = [], l = array.length, i;

    for (i = 0; i < l; i++) {
        if (flags[array[i].city]) continue;
        flags[array[i].city] = true;
        output.push(array[i]);
    }

    return output;
}

function groupBy(collection, property) {
    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
}