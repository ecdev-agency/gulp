/**
 * General Geo Location detection class
 * 1.) first step - get lat, lon data
 * 2.) second step - decode all received location data to state, city, zip code etc..
 */


/**
 * get primary location lat, lon
 */
function getLocation() {
    return jQuery.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + geolocation_vars.geoApiKey + "&v=3");
}

function getIpinfoLocation() {
    return jQuery.get("https://ipinfo.io", function (response) {
        $(document).trigger('ipinfo_location_done', response);
    }, "json");
}

var sm_user_geo_loading = false;


/**
 * Detect visitor country
 * - if not detected country, get country detect by ipinfo, after return location details zip, city, etc...
 */
function sm_get_user_geolocation() {
    if (typeof (geolocation_vars.visitor_country) != 'undefined' && geolocation_vars.visitor_country != null && geolocation_vars.visitor_country != '') {
        return sm_get_user_location_details(geolocation_vars.visitor_country);
    } else {
        // detect visitor country
        var geolocation = getCookie('geolocation');

        // checking cookie location
        if (geolocation) {
            try {
                geolocation = JSON.parse(geolocation);
                if (!geolocation.hasOwnProperty('country') || !geolocation.hasOwnProperty('zip_code') || !geolocation.hasOwnProperty('state')) {
                    throw 'geolocation error';
                }
            } catch (e) {
                geolocation = false;
            }
        }

        if (!geolocation || geolocation == false) {
            $.when(getIpinfoLocation()).done(function(res){
                return sm_get_user_location_details(res.country);
            });
        }
        else {
            $(document).trigger('geolocation_received', geolocation);
            return geolocation;
        }
    }
}


/**
 * Get visitor details of location
 */
function sm_get_user_location_details(country) {
    var expires,
    geolocation = getCookie('geolocation');

       // if visitor not from USA
    if (country != 'US') {
        geolocation = geolocation_vars.geoLocation;

        sm_user_geo_loading = true;
        // save received location to cookie
        setCookie('geolocation', JSON.stringify(geolocation), {expires: expires});

        $(document).trigger('geolocation_received', geolocation);

        return geolocation;
    } else {
        // detect location USA visitor
        if (geolocation) {
            try {
                geolocation = JSON.parse(geolocation);
                $(document).trigger('geolocation_received', geolocation);
                if (!geolocation.hasOwnProperty('country') || !geolocation.hasOwnProperty('zip_code') || !geolocation.hasOwnProperty('state')) {
                    throw 'geolocation error';
                }

                return geolocation;
            } catch (e) {
                geolocation = false;
            }
        }

        // real API request detect location
        if (!geolocation || geolocation == false) {

            return getLocation().done(function (location) {
                var expires = new Date(Date.now() + 3600e3);


                return $.ajax({
                    url: sm_obj.ajaxurl,
                    method: 'POST',
                    data: {
                        action: 'sm_get_location',
                        location: JSON.stringify(location),
                    },
                    success: function (data) {
                        let response = data;

                        geolocation = {
                            country: response.country,
                            zip_code: response.zip_code,
                            state_code: response.statecode,
                            state: response.state,
                            city: response.city,
                            county_name: response.county_name,
                            state_url: response.state_url,
                        }

                        sm_user_geo_loading = true;

                        // save received location to cookie
                        setCookie('geolocation', JSON.stringify(geolocation), {expires: expires});

                        $(document).trigger('geolocation_received', geolocation);

                        return geolocation;
                    }
                });
            });
        }

    }

}


/**
 * Geolocation Event handler
 */
$(document).on('geolocation_received', function (e, geo_data) {
    if (geo_data.hasOwnProperty('state_name') && geo_data.state) {
        $('[data-update="state_name"]').text(geo_data.state);
        $('li.state_link > a, a.state_link, a[href="#state_link"]').attr('href', geo_data.state_url);
    }
});


function sm_get_us_user_zip() {
    let geolocation = getCookie('geolocation'),
        expires;

    if (geolocation) {
        try {
            geolocation = JSON.parse(geolocation);
            if (!geolocation.hasOwnProperty('country') || !geolocation.hasOwnProperty('zip_code') || !geolocation.hasOwnProperty('state')) {
                throw 'geolocation error';
            }
        } catch (e) {
            geolocation = false;
        }
    }

    return geolocation;
}


function sm_get_us_user_state() {
    const geolocation = sm_get_user_geolocation();
    return geolocation.country == 'US' ? geolocation.state_code : '';
}


function sm_get_us_user_state_name() {
    let geolocation = sm_get_user_geolocation();
    return geolocation.country == 'US' ? geolocation.state : '';
}