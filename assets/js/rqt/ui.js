$(document).ready(function () {

    /**
     * See more rates button
     */
    $(document).on('click', '.more-rates-btn-arrow', function (e) {
        let shown_caption = $(this).attr('data-shown-title'),
            hidden_caption = $(this).attr('data-hidden-title'),
            $btn = $(this);
        e.preventDefault();

        $btn.toggleClass('open');

        // hidden more rates state
        if ($('.rates-wrapper').find('#all-rates').find('.rate-item').hasClass('hidden')) {
            $('.rates-wrapper #all-rates .rate-item.hidden').removeClass('hidden').addClass('shown');
            $btn.text(hidden_caption);
        } else {
            $('.rates-wrapper #all-rates .rate-item.shown').removeClass('shown').addClass('hidden');
            $btn.text(shown_caption);
        }

    })

});