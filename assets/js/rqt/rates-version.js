/**
 * Short RQT version without header
 * showing only rates
 */


function update_rates() {
    let $form = (typeof $('.rates-form') != 'undefined' && $('.rates-form') != null) ? $('.rates-form') : false,
        $container = $('.rqt-short-rates-container');

    if ($form == false) {
        alert('Rate form not found. Input params not found!');
        return false;
    }

    let formData = new FormData($form[0]);
    formData.append('action', 'sm_update_rqt_rates');
    let $update_sec = $container.find('.rqt-rates-container .rates-wrapper');

    $update_sec.addClass('loading');

    $.ajax({
        type: "POST",
        url: sm_obj.ajaxurl,
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res.hasOwnProperty('html')) {
                $container.html(res.html);
            }

            $update_sec.removeClass('loading');
        }
    });
}


$(function(){
    $(document).on('change', 'input.extra-options', function () {
        update_rates();
    });
});