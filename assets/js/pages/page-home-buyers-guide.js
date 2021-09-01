jQuery(document).ready(function ($) {
    $('[data-fancybox="images"]').fancybox({
        afterLoad : function(instance, current) {
            var pixelRatio = window.devicePixelRatio || 1;
            if ( pixelRatio > 1.5 ) {
                current.width  = current.width  / pixelRatio;
                current.height = current.height / pixelRatio;
            }
        }
    });

    $('[data-fancybox="videos"]').fancybox({
        youtube : {
            controls : 0,
            showinfo : 0
        },
        vimeo : {
            color : 'f00'
        }
    });

});