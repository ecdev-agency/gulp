$(function () {
    sm_tooltip = function () {
        var targets = $('[rel~=tooltip]'),
            target = false,
            tooltip = false,
            tooltip_id = 'tooltip',
            title = false;

        targets.bind('mouseenter', function (e) {
            target = $(this);
            tip = target.attr('title');
            cssClass = target.attr('class');
            mouseX = e.pageX;
            mouseY = e.pageY;
            tooltip = $('<div class="' + cssClass + '" id="' + tooltip_id + '"><div class="content"></div></div>');

            if (!tip || tip == '')
                return false;

            target.removeAttr('title');
            target.css('position', 'relative');
            target.css('z-index', '3');
            tooltip.find('.content').html(tip);
            tooltip.css('opacity', 0)
                .appendTo('body');

            var init_tooltip = function () {
                if ($(window).width() < tooltip.outerWidth() * 1.5)
                    // tooltip.css( 'max-width', $( window ).width() - 45 );
                    tooltip.css('max-width', 340);
                else
                    tooltip.css('max-width', 340);

                var pos_left = mouseX - 40,
                    pos_top = target.offset().top - tooltip.outerHeight() - 20;

                if (tooltip.hasClass('center')) {
                    pos_left = target.offset().left + (target.outerWidth() / 2) - (tooltip.outerWidth() / 2);
                } else if (tooltip.hasClass('left')) {
                    pos_left = target.offset().left;
                } else if (tooltip.hasClass('right')) {
                    pos_left = target.offset().right;
                }

                if (tooltip.hasClass('top')) {
                    pos_top = target.offset().top - tooltip.outerHeight() - 10;
                } else if (tooltip.hasClass('bottom')) {
                    pos_top = target.offset().top + tooltip.outerHeight() - 10;
                }

                if (pos_left < 0) {
                    pos_left = target.offset().left + target.outerWidth() / 2 - 20;
                    tooltip.addClass('left');
                } else
                    tooltip.removeClass('left');

                if (pos_left + tooltip.outerWidth() > $(window).width()) {
                    pos_left = target.offset().left - tooltip.outerWidth() + target.outerWidth() / 2 + 20;
                    tooltip.addClass('right');
                } else
                    tooltip.removeClass('right');

                if (pos_top < 0) {
                    var pos_top = target.offset().top + target.outerHeight();
                    tooltip.addClass('top');
                } else
                    tooltip.removeClass('top');

                tooltip.css({left: pos_left, top: pos_top})
                    .animate({top: '+=10', opacity: 1}, 50);
            };

            init_tooltip();

            $(window).resize(init_tooltip);

            var remove_tooltip = function () {
                tooltip.animate({top: '-=5', opacity: 0}, 50, function () {
                    $(this).remove();
                });

                target.attr('title', tip);
            };

            target.bind('mouseleave', remove_tooltip);
            tooltip.bind('click', remove_tooltip);
        });
    }
});