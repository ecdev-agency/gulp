jQuery(document).ready(function () {

    var $accepted_form = $('form.jquery-form-validate'),
        $err_form_container = $accepted_form.find('.submit-form-action'),
        err_form_msg = '* You must select at least one checkbox';


    jQuery(document).on('keypress click change', '.app-form input', function () {
        if ($accepted_form.find('.form-err-msg').length > 0)
            $accepted_form.find('.form-err-msg').remove();
    });


    /**
     * Select only one checkbox in form
     */
    jQuery(document).on('click change', 'input.circle-checkbox', function () {
       let $parent_item = $(this).parents('.question-item');
        $parent_item.find('.circle-checkbox').not(this).prop('checked', false);
    });



    /**
     * Validate application form
     */
    jQuery('.jquery-form-validate').validate(
        {
            submitHandler: function (form) {
                // see if selectone is even being used
                var boxes = jQuery('.circle-checkbox');
                if (boxes.length > 0) {
                    if (jQuery('.circle-checkbox:checked').length < 1) {
                        // add custom validate message
                        if ($accepted_form.find('.form-err-msg').length == 0)
                            jQuery('<div class="form-err-msg">' + err_form_msg + '</div>').insertBefore($err_form_container);

                        return false;
                    } else {
                        form.submit();
                    }
                }

                return false;
            },

            invalidHandler: function () {
                var boxes = jQuery('.circle-checkbox');
                if (boxes.length > 0) {
                    if (jQuery('.circle-checkbox:checked').length < 1) {

                        // add custom validate message
                        if ($accepted_form.find('.form-err-msg').length == 0)
                            jQuery('<div class="form-err-msg">' + err_form_msg + '</div>').insertBefore($err_form_container);

                        // boxes[0].focus();
                    }
                }

            },
        }
    );
})
;