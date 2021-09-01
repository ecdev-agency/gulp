/**
 * Youtube video player & preview (find all youtube containers and create video player)
 * *
 * data-autoplay (true|false)
 * data-preview-image (true|false)
 * data-embed (youtube full video url)
 * data-preview-type (preview image type: 'bgr'|'img')
 */

(function () {
    var youtube = document.querySelectorAll(".video-yt");

    for (var i = 0; i < youtube.length; i++) {
        let $yt_container = youtube[i];
        $yt_obj = $($yt_container),
            $yt_config = {
                video_id: $yt_obj.attr('embed'),
                preview_img: {type: (typeof $yt_obj.attr('data-preview-type') != 'undefined' && $yt_obj.attr('data-preview-type') != null) ? $yt_obj.attr('data-preview-type') : 'bgr', show: (typeof $yt_obj.attr('data-preview-image') != 'undefined' && $yt_obj.attr('data-preview-image') != null) ? JSON.parse($yt_obj.attr('data-preview-image') .toLowerCase()) : false},
                autoplay: (typeof $yt_obj.attr('data-autoplay') != 'undefined' && $yt_obj.attr('data-autoplay') != null) ? JSON.parse($yt_obj.attr('data-autoplay').toLowerCase()) : true,
            };

        // show preview image
        if ($yt_config.preview_img.show == true) {
            var source = "https://img.youtube.com/vi/" + $yt_container.dataset.embed + "/maxresdefault.jpg";

            if ($yt_config.preview_img.type == 'bgr') {
                $yt_obj.css('background-image', 'url(' + source + ')');
            }
            else {
                var image = new Image();
                image.src = source;
                image.addEventListener("load", function () {
                    $yt_container.appendChild(image);
                }(i));
            }
        }


        $yt_container.addEventListener("click", function () {

            var iframe = document.createElement("iframe"),
                iframe_url = "https://www.youtube.com/embed/" + this.dataset.embed + "?rel=0&showinfo=0";

            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowfullscreen", "");

            if ($yt_config.autoplay == true) {
                iframe.setAttribute("allow", "autoplay");
                iframe_url += "&autoplay=1";
            }

            iframe.setAttribute("src", iframe_url);
            this.innerHTML = "";
            this.appendChild(iframe);
        });
    }
    ;

})();