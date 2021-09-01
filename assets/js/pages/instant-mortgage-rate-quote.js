jQuery(document).ready(function ($) {


    if (window.innerWidth >= 768) {
        autoheight_posttitle();
    }

    /*
        var pageNumber = 1;
        let moreContainer = $('.partners-container');
        function more_reviews(){
            pageNumber++;
            let url = '&pageNumber=' + pageNumber + '&action=more_reviews_ajax';
            moreContainer.find(".show-more-container .btn").attr("disabled", true);
            moreContainer.find(".show-more-container .btn").text('loading..');

            $.ajax({
                type: "POST",
                url: sammamish.ajaxurl,
                data: url,
                success: function(data){
                  let response = JSON.parse(data);

                    if (response) {
                        moreContainer.find(".partners-reviews .list").append(response.items);

                        if (response.finished == true)
                        {
                            moreContainer.find(".show-more-container").remove();
                        }
                    } else{
                        moreContainer.find(".show-more-container").remove();
                    }

                },
                error : function(jqXHR, textStatus, errorThrown) {
                    // $loader.html(jqXHR + " :: " + textStatus + " :: " + errorThrown);
                }

            });
            return false;
        }
        */
    function more_reviews_html() {
        let reviews = $('.partners-container .partners-reviews .list');
        reviews.find('.reviews-item').removeClass('not-show');
        $('.partners-container').find('.show-more-container').remove();
    }

    $(document).on("click", '.show-more-container .btn', function () {
        $(this).attr("disabled", true);
        more_reviews_html();
    });


    $('#faq_section .faq-title').click(function () {
        jQuery(this).parent().toggleClass('active');
        jQuery(this).parent().find('.faq-content').slideToggle(300);

    });

    function autoheight_posttitle() {
        let items = $('#latest_blog_posts_section .post-title');
        let max_item_height = Math.max.apply(null, items.map(function () {
            return $(this).outerHeight();
        }).get());


        items.css('height', max_item_height + 'px');
    }

    /*
        iFrameResize({ log: true }, '#mrct');
    */
    /*
    //Go through each carousel on the page
    $('.owl-carousel').each(function () {
        //Find each set of dots in this carousel
        $(this).find('.owl-dot').each(function (index) {
            //Add one to index so it starts from 1
            $(this).attr('aria-label', index + 1);
        });
    });


    let $testimonials_slider = $('#testimonials_slider');
    $testimonials_slider.on('initialized.owl.carousel', function (event) {
       let t = setInterval(function(){
           $('.owl-carousel').each(function () {
               $(this).find('.owl-dot').each(function (index) {
                   $(this).attr('aria-label', 'Review ' + index);
               });
           });
           clearInterval(t);
       }, 250);
    });
    $testimonials_slider.owlCarousel({
        loop: true,
        margin: 0,
        responsiveClass: true,
        items: 1,
        navigation: false,
        slideSpeed: 1200,
        paginationSpeed: 1200,
        smartSpeed: 310,
        responsive: {
            767: {
                items: 1,
            },
        }
    });
    */
});

