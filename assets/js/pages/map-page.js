jQuery(document).ready(function ($) {

    /**
     * click
     */
    $(document).on('click', '.map-page__list > li > a', function(e) {
        e.preventDefault();

        const   $this   = $(this),
                $li     = $this.parent();

        if( $li.hasClass('active') ) {
            $li.removeClass('active');
        } else {
            $('.map-page__list').find('.active').removeClass('active');
            $li.addClass('active');
        }

    });

    /**
     * Tippy Tooltip and Go to Link
     */
    if( $('#full_usa_map').length ) {

        var pop = tippy('#full_usa_map [data-active="true"], #full_usa_map .text', {
            content: function content(reference) {
                var
                    title   = reference.getAttribute('data-title'),
                    code    = reference.getAttribute('id'),
                    rate    = (state_rates.hasOwnProperty(code)) ? state_rates[code].rate_avg : '',
                    apr     = (state_rates.hasOwnProperty(code)) ? state_rates[code].apr_avg : '',
                    link    = reference.getAttribute('data-url');

                return '<div class="map-page__tooltip"><h3>' + title + '</h3><ul><li><span>Interest Rate</span><strong>' + rate + '%</strong></li><li><span>APR</span><strong>' + apr + '%</strong></li></ul><a href="' + link + '">More info</a></div>';

            },
            allowHTML           : true,
            interactiveDebounce : 0,
            interactive         : true,
            interactiveBorder   : 0,
            //followCursor: 'horizontal',
            //appendTo            : () => document.querySelector('#map'),
            appendTo: function appendTo() {
                return document.querySelector('#map');
            },
            offset: function offset(reference) {
                var top = reference.reference.height / 2;
                return [0, -top];
            },

            // offset(reference) {
            //
            //     const top = reference.reference.height / 2;
            //
            //     return [0, -top];
            //
            // },
            animation           : false,
        });

        /**
         * Goto Link
         * @click
         */
        $(document).on('click', '#full_usa_map [data-active="true"]', function(e) {

            const url = $(this).data('url');

            if( url.length ) {
                document.location.href = url;
            }

        });

        $('#full_usa_map [data-active="true"]').hover(
            function () {
                var id = $(this).attr('id');
                $('#full_usa_map').find('[data-id="'+id+'"]').hide();
            },
            function () {
                var id = $(this).attr('id');
                $('#full_usa_map').find('[data-id="'+id+'"]').show();
            }
        );

    }

});
