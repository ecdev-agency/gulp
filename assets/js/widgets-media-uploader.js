jQuery(document).ready(function ($) {
    var $imageField = $('.img-field'),
        $img_preview_selector = null;

    $(document).on('click', '.select-img', function () {
        $img_preview_selector = $(this).parents('form').find('.img-preview');

        $(this).parents('form').find('[type="submit"]').removeAttr('disabled');
        tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
        return false;
    });

    window.send_to_editor = function (html) {
        var imagelink = jQuery('img', html).attr('src');

        if ($img_preview_selector != null)
            $img_preview_selector.html('<img src="' + imagelink + '" style="width: 80px;height: 80px;margin-bottom: 15px;object-fit: contain;">');

        $('.img-field').val(imagelink);
        tb_remove();
    }
});