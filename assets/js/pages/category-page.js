$(document).ready(function () {
    var cur_url = location.href;
    $('.lst_category [href="' + cur_url + '"]').addClass('active');
    function init_scroll() {
        $(".all_list").customScrollbar({
            skin: "default-skin",
            hScroll: false,
            updateOnWindowResize: true,
        });
    }

    /* category filter */
    $(document).click(function (e) {
        var cat_list = jQuery('.cat_filter .cat_list');
        var cat_filter = $(".cat_filter");
        if (!cat_filter.is(e.target) && cat_filter.has(e.target).length === 0) {
            cat_list.slideUp(300);
            jQuery('.cat_filter .open, .cat_filter .name').removeClass('active');
        }
    });

     jQuery('.cat_filter .open, .cat_filter .name').on('click', function () {
        if (jQuery(this).hasClass('active')) {
            jQuery(this).removeClass('active');
            jQuery('.cat_filter .cat_list').slideUp(300);
        } else {
            jQuery(this).addClass('active');
            jQuery('.cat_filter .cat_list').slideDown(300);
            init_scroll();
        }
    });


    $('.search_list input').keyup((e) => {
        var s = e.currentTarget.value;
        s = s.toLowerCase();
        if (s.length > 0) {
            $(".all_list .item").slideUp(50);
            $(".all_list [data-s^='" + s + "']").slideDown(50);
        }
        else {
            $(".all_list .item").slideDown(50);
        }
        init_scroll();
    });

    /* jQuery('.all_list .item').on('click', function (e) {
     e.preventDefault();
     jQuery('.pagination').css('display', 'none');
     jQuery('.cat_filter .name').text(jQuery(this).data('name'));
     jQuery('.cat_filter .open').removeClass('active');
     jQuery('.cat_filter .cat_list').slideUp(300);
     jQuery('#filter_cat_val').val(jQuery(this).data('id'));
     jQuery('#filter_cat_page').val(1);
     $('body').removeClass('loading');
     ajax_new_posts();
     });*/

    /*function ajax_new_posts() {
     var data = {
     'action': 'loadmore',
     'query': jQuery('#filter_cat_val').val(),
     };
     $.ajax({
     url: ajaxurl,
     data: data,
     type: 'POST',
     success: function (data) {
     if (data) {
     $('.addapt_blog .main_post_item').remove();
     $('#true_loadmore').before(data); // вставляем новые посты
     }
     }
     });
     };*/


    /* $(window).scroll(function () {
     var current_page = jQuery('#filter_cat_page').val();
     var bottomOffset = $('#true_loadmore').offset().top;
     var data = {
     'action': 'loadmore',
     'query': jQuery('#filter_cat_val').val(),
     'page':  parseInt(current_page) + 1,
     };
     if ($(document).scrollTop() > (bottomOffset) && !$('body').hasClass('loading')) {
     console.log($(document).scrollTop() > (bottomOffset) && !$('body').hasClass('loading'));
     $.ajax({
     url: ajaxurl,
     data: data,
     type: 'POST',
     beforeSend: function (xhr) {
     $('body').addClass('loading');
     },
     success: function (data) {
     if (data) {
     $('#true_loadmore').before(data);
     $('body').removeClass('loading');
     jQuery('#filter_cat_page').val(parseInt(current_page) + 1);
     }
     }
     });
     }
     });*/
});