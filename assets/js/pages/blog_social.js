jQuery(document).ready(function ($) {

    $(window).on('resize load', function () {
        var wind_width = $(window).innerWidth();
        var gk_social = $('.gk-social-buttons').innerWidth();
        var container_width = $('.container').innerWidth();
        var border = wind_width / 2 - container_width / 2;
        var left_pos = border - gk_social - 52;
        if (left_pos > 0) {
            $('.gk-social-buttons').css('left', left_pos);
        }
        else {
            $('.gk-social-buttons').css('left', 5);
        }
    });

});