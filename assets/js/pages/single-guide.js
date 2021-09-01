jQuery(document).ready(function ($) {
    jQuery(document).on('click', '.guideList__cat', function () {
        const $this = $(this);
        $this.toggleClass('guideList__cat-active');
        $this.parents('.guideList__item').find('.guideList__subMenu').slideToggle();
    });

    $('.guideList__guideLink-active').parents('.guideList__item').find('.guideList__cat').trigger('click');
});