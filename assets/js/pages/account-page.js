/**
 * Tel
 * @type {Element}
 */
var phoneUser = document.querySelector('#phone_user_def');
var phoneRefer = document.querySelector('#referal_phone_def');
if(phoneUser) {
    window.intlTelInput(phoneUser, {
        autoHideDialCode    :   false,
        separateDialCode    :   false,
        utilsScript         :   "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        hiddenInput         :   "phone_user",
        onlyCountries       :   ["us"],
        initialCountry      :   "us",
        preferredCountries  :   false,

    });
}
if(phoneRefer) {
    window.intlTelInput(phoneRefer, {
        autoHideDialCode    :   false,
        separateDialCode    :   false,
        utilsScript         :   "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        hiddenInput         :   "referal_phone",
        onlyCountries       :   ["us"],
        initialCountry      :   "us",
        preferredCountries  :   false,

    });
}
/**
 *
 * @type {{css: {border: string, cursor: string, padding: number, margin: number, backgroundColor: string, top: string, color: string, left: string, textAlign: string, width: string}, overlayCSS: {background: string, opacity: number}, message: string}}
 */
var loader = {
    message         :   '<div class="account__loader"></div>',
    overlayCSS      :   {
        background  :   '#fff',
        opacity     :   0.6
    },
    css: {
        padding     :   0,
        margin      :   0,
        width       :   '100%',
        top         :   '0%',
        left        :   '0%',
        textAlign   :   'center',
        color       :   '#000',
        border      :   'none',
        backgroundColor:'transparent',
        cursor      :   'wait'
    }
}
var loader_default = {
    message         :   '',
    overlayCSS      :   {
        background  :   '#fff',
        opacity     :   0.6
    },
    css: {
        padding     :   0,
        margin      :   0,
        width       :   '100%',
        top         :   '0%',
        left        :   '0%',
        textAlign   :   'center',
        color       :   '#000',
        border      :   'none',
        backgroundColor:'transparent',
        cursor      :   'wait'
    }
}
/**
 * ready
 */
jQuery(document).ready(function ($) {

    /**
     * Svg Replace
     * @each
     */
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });

    /**
     * mask
     * @tel
     */
    $('[type="tel"]').mask("(999)-999-9999");

    /**
     * Input Enter
     * @keypress
     */
    $(document).on('keypress', 'input,select,textarea', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            var $next = $('[tabindex=' + (+this.tabIndex + 1) + ']');
            console.log($next.length);
            if (!$next.length) {
                $next = $('[tabindex=1]');
            }
            $next.focus();
        }
    });

    /**
     * Input Password Show and Hide
     * @click
     */
    $(document).on('click', '.form-group--viewpin', function(e) {
        $(this).toggleClass('active');

        var $input = $(this).parent().find('input');

        if('password' == $input.attr('type')){
            $input.prop('type', 'text');
        }else{
            $input.prop('type', 'password');
        }

    });

    /**
     * Menu Click
     * @click
     */
    $(document).on('click', '.account__menu a', function(e) {

        $('.account__menu').find('.active').removeClass('active');
        $(this).parent().addClass('active');
        $('#main').addClass('account__preloader');

    });

    /**
     * Add Active
     */
    $(document).on('click', '.account__refer-list--card---footer, .account__header-btn', function(e) {

        $('#main').addClass('account__preloader');

    });

    /**
     * Input Password Limit Numbers
     * @keyup
     */
    $(document).on('keyup', '.account #password, .account #password_confirm, .account #password_modal, .account #password_confirm_modal', function(e) {

        var $this   = $(this),
            maxLen  = 4;
        if($this.val().length > maxLen) {
            $this.val($this.val().substr(0, maxLen));
        };

    });

    /**
     * Table Contractors
     * @each
     */
    $('#tableContractor thead tr th').each( function (i) {
        var $id = 'tableContractor-' + i,
            filter  = $(this).data('filter'),
            name    = $(this).data('filter-name'),
            arr     = [],
            text    = null,
            $li     = null;

        if(filter == true){
            $(this).find('span').addClass('account__contractorDropdown');

            $('#tableContractor tbody [data-filter-name="'+name+'"]').each( function (i) {
                text        = $(this).text().trim();
                arr[text]   = text;
            });

            if(Object.keys(arr).length > 0) {
                $li = '<ul id="' + $id + '" class="account__contractor-sortable">';
                $li += '<li class="active" data-type="clear">All</li>';
                Object.entries(arr).forEach(([key, value]) => {
                    $li += '<li data-type="text">' + value + '</li>';
                });
                $li += '</ul>';
                $(this).append($li);
            }


            $(document).on('click', '#' + $id + ' > li', function(e) {
                $(this).parent().find('.active').removeClass('active');
                $(this).addClass('active');
                if ( table.column(i).search() !== this.value ) {
                    var type        = $(this).data('type'),
                        this_value  = (type == 'clear') ? '' : $(this).text();

                    table
                        .column(i)
                        .search( this_value )
                        .draw();
                }

                $('.account__contractorDropdown, .account__contractor-sortable').removeClass('active');

            });


        }

    } );

    /**
     * Table Contractors
     * @DataTable
     */
    var table = $('#tableContractor').DataTable( {
        ordering:       false,
        orderCellsTop:  false,
        fixedHeader:    true,
        searching:      true,
        select:         false,
        "language": {
            "zeroRecords": "No matched records found"
        },
        "fnDrawCallback":function(){
            if ( $('#tableContractor_paginate span a').length > 1) {
                $('#tableContractor_paginate').removeClass('empty');
            } else {
                $('#tableContractor_paginate').addClass('empty');
            }
        }
    } );

    /**
     * Table Contractors Dropdown
     * @click
     */
    $(document).on('click', '.account__contractorDropdown', function(e) {

        if($(this).hasClass('active')){
            $(this).removeClass('active');
            $('.account__contractor-sortable').removeClass('active');
        }else{
            $('.account__contractorDropdown').removeClass('active');
            $('.account__contractor-sortable').removeClass('active');
            $(this).addClass('active');
            $(this).parent().find('.account__contractor-sortable').addClass('active');
        }

    });
    $(document).on('mouseup', function(e) {
        var container = $(".account__contractor-sortable");
        if (container.has(e.target).length === 0){
            container.removeClass('active');
            $('.account__contractorDropdown').removeClass('active');
        }
    });

    /**
     * Tooltip
     * @mouseover
     * @mouseout
     */
    $( '[data-toggle="tooltip"]' ).hover(function() {
            var text    =   $(this).attr('title'),
                offset  =   $( this ).offset(),
                posY    =   offset.top - $(window).scrollTop(),
                posX    =   offset.left - $(window).scrollLeft();

            //$(document).find('.tooltip').remove();
            $(this).parent().append(
                $('<div class="tooltip" style="opacity: 0"></div>').html(text)
            ).ready(function () {
                $('.tooltip').css({
                    left    :   posX - ($('.tooltip').outerWidth(true) / 2) + 20,
                    top     :   posY - $('.tooltip').outerHeight(true) - 2,
                    opacity :   1
                });
            });
        }, function () {

            var tooltip = setTimeout(function () {
                $(document).find('.tooltip').remove();
            }, 200);

        });

    /**
     * Account Change Pin
     * @click
     */
    $(document).on('click', '.changePin', function(e){
        e.preventDefault();

        if( ! $(this).hasClass('disabled')) {
            var $this = $(this),
                data = {
                    action     :   'profile_change_pin',
                    type       :    'open'
                };

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader_default);
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    if(data.status === 'OK') {

                        $.fancybox.close();
                        $.fancybox.open({
                            type: "html",
                            src: data.html
                        });

                    }else if (data.status === 'ERROR'){
                        alert('An error occurred:' + data.message);
                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }
    });

    /**
     * Account Change Pin
     * @submit
     */
    $(document).on('submit', '.formChangePin', function(e){


        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    if(data.status === 'OK') {

                        if(data.reload == 1){
                            $('.form__message').html(data.message);
                            location.reload();
                            return false;
                        }else{
                            $.fancybox.close();
                            $.fancybox.open({
                                type: "html",
                                src: data.html
                            });
                        }

                    }else if (data.status === 'ERROR' && data.validation != 0){

                        $('.form__message').html(data.message);
                        $.each(data.validation,function(index,value){
                            var $inp    = $(value),
                                top     = $inp.offset().top,
                                header  = $('.pageHeader').outerHeight(true),
                                scroll  = top - header - 50;

                            if($inp.length) {
                                $inp.addClass('form__input-error');
                                $('body,html').animate({scrollTop: scroll}, 400);
                            }
                        });

                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );


        }

        e.preventDefault();
    });

    /**
     * Account Auth
     * @submit
     */
    $(document).on('submit', '.formAuth', function(e){

        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                    $this.find('.form__input-error').removeClass('form__input-error');
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    $('.form__message').html(data.message);

                    $this.find('.form__input-error').removeClass('form__input-error');
                    if(data.status === 'ERROR' && data.validation != 0) {

                        $.each(data.validation,function(index,value){
                            var $inp    = $(value),
                                top     = $inp.offset().top,
                                header  = $('.pageHeader').outerHeight(true),
                                scroll  = top - header - 50;

                            if($inp.length) {
                                $inp.addClass('form__input-error');
                                $('body,html').animate({scrollTop: scroll}, 400);
                            }
                        });

                    }

                    if(data.status === 'OK') {

                        if(data.reload == 1){

                            setTimeout(function () {
                                $('#main').addClass('account__preloader');
                            }, 400);

                            $('.form__message').html(data.message);
                            window.location.href = data.url;
                            return false;
                        }

                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }

        e.preventDefault();
    });

    /**
     * Account Profile Update
     * @submit
     */
    $(document).on('submit', '.formProfile', function(e){

        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    $('.form__message').html(data.message);

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }

        e.preventDefault();
    });

    /**
     * Add and Edit Referal
     * @submit
     */
    $(document).on('submit', '.formReferal', function(e){

        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    console.log(data);

                    $('.form__message').html(data.message);

                    if(data.status === 'ERROR' && data.validation != 0) {

                        $.each(data.validation,function(index,value){
                            var $inp    = $(value),
                                top     = $inp.offset().top,
                                header  = $('.pageHeader').outerHeight(true),
                                scroll  = top - header - 50;

                            if($inp.length) {
                                $inp.addClass('form__input-error');
                                $('body,html').animate({scrollTop: scroll}, 400);
                            }
                        });

                    }

                    if(data.status === 'OK') {

                        if(data.reload == 1){

                            setTimeout(function () {
                                $('#main').addClass('account__preloader');
                            }, 400);

                            window.location.href = data.url;
                            return false;

                        }

                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }

        e.preventDefault();
    });

    /**
     * Add and Edit Referal
     * CheckBox
     * @change
     */
    $(document).on('change', '.formReferalCheckbox', function(e){
        $(this).val(this.checked ? "TRUE" : "FALSE");
    });

    /**
     * Forgot Pin
     * @submit
     */
    $(document).on('submit', '.formForgotPin', function(e){

        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                    $this.find('.form__input-error').removeClass('form__input-error');
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    $('.form__message').html(data.message);
                    $this.find('.form__input-error').removeClass('form__input-error');
                    if(data.status === 'ERROR' && data.validation != 0) {

                        $.each(data.validation,function(index,value){
                            var $inp    = $(value),
                                top     = $inp.offset().top,
                                header  = $('.pageHeader').outerHeight(true),
                                scroll  = top - header - 50;

                            if($inp.length) {
                                $inp.addClass('form__input-error');
                                $('body,html').animate({scrollTop: scroll}, 400);
                            }
                        });

                    }

                    if(data.status === 'OK') {

                        $('.formForgotPin').html(data.html);

                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }

        e.preventDefault();
    });

    /**
     * Lost Password
     * @submit
     */
    $(document).on('submit', '.formLostPassword', function(e){

        if( ! $(this).hasClass('disabled')) {
            var $this   =   $(this),
                data    =   $this.serialize();

            $this.addClass('disabled');

            $.ajax( {
                beforeSend  :   function(xhr){
                    $this.block(loader);
                    $this.find('.form__input-error').removeClass('form__input-error');
                },
                data        :   data,
                dataType    :   'json',
                method      :   'POST',
                headers     :   {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                complete    :   function(){
                    $this.removeClass('disabled');
                    $this.unblock();
                },
                success     :   function( data ){

                    $('.form__message').html(data.message);
                    $this.find('.form__input-error').removeClass('form__input-error');
                    if(data.status === 'ERROR' && data.validation != 0) {

                        $.each(data.validation,function(index,value){
                            var $inp    = $(value),
                                top     = $inp.offset().top,
                                header  = $('.pageHeader').outerHeight(true),
                                scroll  = top - header - 50;

                            if($inp.length) {
                                $inp.addClass('form__input-error');
                                $('body,html').animate({scrollTop: scroll}, 400);
                            }
                        });

                    }

                    if(data.status === 'OK') {

                        if(data.reload == 1){
                            window.location.href = data.url;
                            return false;
                        }

                    }

                },
                url         :   ajax_profile_object.ajaxurl
            } );

        }

        e.preventDefault();
    });

});