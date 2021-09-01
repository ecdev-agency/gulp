/**
 * Tabulation form input
 * - compare with tabulation-form-input.scss styles
 */

jQuery(document).ready(function () {

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 9) {
            $('body').addClass('input-focus-outlines');
        }
    });

    document.addEventListener('click', function (e) {
        $('body').removeClass('input-focus-outlines');
    });

    // for double specific inputs
    $(document).on('focusin', 'input.field-group', function(){
        $(this).parents('.fields-group').addClass('focus');
    });
    $(document).on('focusout', 'input.field-group', function(){
        $(this).parents('.fields-group').removeClass('focus');
    });
});