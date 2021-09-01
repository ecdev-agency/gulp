jQuery(document).ready(function ($) {
    $('.moreCats').on('change', function () {
        var catLink = $(this).find("option:selected").val();
        window.location.href = catLink;
    });

});