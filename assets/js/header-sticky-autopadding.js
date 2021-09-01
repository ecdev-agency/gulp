/*
* This func autoresize and add padding top to wrapper content
 */

function header_gap_content() {
    var h_header = document.getElementById('top_header').offsetHeight;
    var shadow_header = 10;
    var found_section = document.getElementById('main').getElementsByClassName('no_fixed_header');

    if (found_section.length > 0) {
        return;
    } else {
        var h = h_header - shadow_header;

        document.getElementById('wrapper').style.paddingTop = h + 'px';
    }
}

//document.addEventListener("DOMContentLoaded", header_gap_content);

header_gap_content();

window.onresize = function (event) {
    header_gap_content();
};