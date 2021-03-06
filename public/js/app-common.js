var map;
var layerList = [];
var mapLayers = [];
var mapOptions;
var map_info;
var map_info_all = {};
var layers_info;
var initialzoom = 5;
var maxzoom = 15;
var minzoom = 1;
var center_lat = 50;
var center_lon = -105;

var hash = null;

var contentJson = [];

// get url hash and display options
var urlHash = window.location.hash,
    isEmbed = window.location.pathname.split('/')[2] === 'embed',
    args = [],
    displayOpts = '',
    hasZoom = true,
    hasAttribution = true,
    hasLayers = true,
    hasLegend = true,
    hasSearch = true;


function createSearchFields() {
    if (hasSearch) {
        if ((map_info_all.map_address_search && map_info_all.map_address_search.toLowerCase() == "on") || (map_info_all.map_coordinate_search && map_info_all.map_coordinate_search.toLowerCase() == "on")) {
            $('#search-field-holder').toggleClass('hasSearch hide');

        } else {
            $('#search-field-holder').toggleClass('hasSearch hide');
        }
    }
}




function searchLocation() {
    locChange();
}

function locChange() {
    var loc = $("#input-location").val();
    geocoder.query(loc, codeMap);

    function codeMap(err, data) {

        if (data.results.features.length == 0) {
            alert("No results found");
            return;
        }
        var lat = data.latlng[0];
        var lon = data.latlng[1];

        map.setView([lat, lon], 14);

    }
}

function search_dms() {

    var lat_deg = $('#lat-deg').val();
    var lat_min = $('#lat-min').val();
    var lat_sec = $('#lat-sec').val();
    var ns = $('#select-ns').val();
    var lon_deg = $('#lon-deg').val();
    var lon_min = $('#lon-min').val();
    var lon_sec = $('#lon-sec').val();
    var ew = $('#select-ew').val();
    if (lat_deg == "" || lon_deg == "") {
        alert("empty fields");
        return;
    }

    lat_deg = Math.floor(lat_deg);
    lat_min = Math.floor(lat_min);
    if (lat_sec == "") {
        lat_sec = 0;
    }
    lat_sec = parseFloat(lat_sec);
    var lat = lat_deg + lat_min / 60.0 + lat_sec / 3600.0;
    lat = Math.round(lat * 1000000) / 1000000.0;

    if (ns == "S") {
        lat = -1 * lat;
    }

    lon_deg = Math.floor(lon_deg);
    lon_min = Math.floor(lon_min);
    if (lon_sec == "") {
        lon_sec = 0;
    }
    lon_sec = parseFloat(lon_sec);
    var lon = lon_deg + lon_min / 60.0 + lon_sec / 3600.0;
    lon = Math.round(lon * 1000000) / 1000000.0;

    if (ew == "W") {
        lon = -1 * lon;
    }

    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        alert("Lat/Lon values out of range");
        return;
    }

    map.setView([lat, lon], 14);
}


function search_decimal() {

    var lat = $('#latitude').val().replace(/ +/g, "");
    var lon = $('#longitude').val().replace(/ +/g, "");

    if (lat == "" || lon == "") {
        alert("Please enter lat/lon");
        return;
    }

    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        alert("Lat/Lon values out of range");
        return;
    }

    map.setView([lat, lon], 14);

}




function setupListener() {
    $('.checkbox-provider').on("click", function(e) {
        var id = e.target.id;
        var i = parseInt(id);

        if ($('#' + id).prop('checked')) {
            //remove layer
            if (map.hasLayer(mapLayers[i])) {
                map.removeLayer(mapLayers[i]);
            }
            //add layer
            mapLayers[i].addTo(map);
        } else {
            //remove layer
            if (map.hasLayer(mapLayers[i])) {
                map.removeLayer(mapLayers[i]);
            }
        }
    });

    // hide legend      
    $('.btn-closeLegend').on("click", function(e) {
        $('#div-legend').hide('fast');
    });

    // show legend
    $('#div-legend-icon').on("click", function(e) {
        $('#div-legend').show('fast');
    });


    $("#input-loc-search").on("click", function(e) {
        e.preventDefault();
        locChange();
    });

    $("#input-latlon-dms-search").on("click", function(e) {
        e.preventDefault();
        search_dms();
    });

    $("#input-latlon-decimal-search").on("click", function(e) {
        e.preventDefault();
        search_decimal();
    });

    $("#input-search-switch").on('click', 'a', function(e) {
        var search = $(e.currentTarget).data('value');

        e.preventDefault();


        if (search == 'loc') {
            $("#input-latlon-dms").css('display', 'none');
            $("#span-latlon-dms-search").css('display', 'none');
            $("#input-latlon-decimal").css('display', 'none');
            $("#span-latlon-decimal-search").css('display', 'none');

            $("#input-location").css('display', 'block');
            $("#span-location-search").css('display', 'table-cell');
            $("#btn-label").text('Address');
        } else if (search == 'latlon-dms') {
            $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
            $("#input-latlon-decimal").css('display', 'none');
            $("#span-latlon-decimal-search").css('display', 'none');

            $("#input-latlon-dms").css('display', 'block');
            $("#span-latlon-dms-search").css('display', 'table-cell');
            $("#btn-label").text('Lat/lon (DMS)');
        } else if (search == 'latlon-decimal') {
            $("#input-location").css('display', 'none');
            $("#span-location-search").css('display', 'none');
            $("#input-latlon-dms").css('display', 'none');
            $("#span-latlon-dms-search").css('display', 'none');

            $("#input-latlon-decimal").css('display', 'block');
            $("#span-latlon-decimal-search").css('display', 'table-cell');
            $("#btn-label").text('Coordinates');
        }

    });

    $('#input-location').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-loc-search').click();
            return false;
        }
    });


    $('#lat-deg, #lon-deg, #lat-min, #lon-min, #lat-sec, #lon-sec, #select-ns, #select-ew').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-latlon-dms-search').click();
            return false;
        }
    });


    $('#latitude, #longitude').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-latlon-decimal-search').click();
            return false;
        }
    });

    $('#btn-geoLocation').click(function(event) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geo_lat = position.coords.latitude;
                var geo_lon = position.coords.longitude;
                var geo_acc = position.coords.accuracy;

                geo_lat = Math.round(geo_lat * 1000000) / 1000000.0;
                geo_lon = Math.round(geo_lon * 1000000) / 1000000.0;

                map.setView([geo_lat, geo_lon], 14);

            }, function(error) {
                //alert('Error occurred. Error code: ' + error.code);            
                alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.');
            }, {
                timeout: 4000
            });
        } else {
            alert('Sorry, your current location could not be found. \nPlease use the search box to enter your location.');
        }

        return false;
    });

    $("#btn-nationLocation").on("click", function() {
        //map.fitBounds(bounds_us);
        map.setView([50, -105], 3);
    });


    $("#input-location").autocomplete({
        source: function(request, response) {
            var location = request.term;
            geocoder.query(location, processAddress);

            function processAddress(err, data) {

                var f = data.results.features;
                var addresses = [];
                for (var i = 0; i < f.length; i++) {
                    addresses.push(f[i].place_name);
                }
                response(addresses);

            }
        },
        minLength: 3,
        select: function(event, ui) {
            setTimeout(function() { searchLocation(); }, 200);
        },
        open: function() {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function() {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });

}


function updateMapSize() {
    if (map_info.mapwidth) {

        $('#search-field').css("width", map_info.mapwidth);
        $('#map-holder').css("width", map_info.mapwidth);
        //$('#map').css("width", map_info.mapwidth);

    }
    if (map_info.mapheight) {
        $('#map-holder').css("height", map_info.mapheight);
        $('#map').css("height", map_info.mapheight);

    }

    document.title = map_info.title;

}

function getBureau(tid) {
    var bureau = '';
    if (mapOptions.taxonomy) {
        for (var i = 0; i < mapOptions.taxonomy.length; i++) {
            if (mapOptions.taxonomy[i].tid == tid) {
                bureau = mapOptions.taxonomy[i].name;
            }
        }

    }

    return bureau;
}

function getMapInfo() {

    //title
    var title = '';
    if (mapOptions.title) {
        title = mapOptions.title;
    }
    map_info_all.title = title;

    //webUrl
    var webUrl = '';
    if (mapOptions.webUrl) {
        webUrl = mapOptions.webUrl;
    }
    map_info_all.webUrl = webUrl;

    //archived
    var archived = '0';
    if (mapOptions.fields.field_archived && mapOptions.fields.field_archived.und) {
        archived = mapOptions.fields.field_archived.und[0].value;
    }
    map_info_all.archived = archived;

    //bureau_office
    var bureau_office = '';
    if (mapOptions.fields.field_bureau_office && mapOptions.fields.field_bureau_office.und) {
        var bureau_office = mapOptions.fields.field_bureau_office.und[0];
        // bureau_office = getBureau(tid);
    }
    map_info_all.bureau_office = bureau_office;

    //date published
    var date = ''
    if (mapOptions.fields.field_date && mapOptions.fields.field_date.und) {
        date = mapOptions.fields.field_date.und[0].value;
    }
    map_info_all.date = date;

    //date_updated_reviewed
    var date_updated_reviewed = ''
    if (mapOptions.fields.field_date_updated_reviewed && mapOptions.fields.field_date_updated_reviewed.und) {
        date_updated_reviewed = mapOptions.fields.field_date_updated_reviewed.und[0].value;
    }
    map_info_all.date_updated_reviewed = date_updated_reviewed;

    //description
    var description = ''
    if (mapOptions.fields.field_description && mapOptions.fields.field_description.und) {
        description = mapOptions.fields.field_description.und[0].safe_value;
    }
    map_info_all.description = description;

    //featured
    var featured = '0'
    if (mapOptions.fields.field_featured && mapOptions.fields.field_featured.und) {
        featured = mapOptions.fields.field_featured.und[0].value;
    }
    map_info_all.featured = featured;

    //image_thumbnail
    var image_thumbnail = '';
    if (mapOptions.fields.field_image_thumbnail && mapOptions.fields.field_image_thumbnail.und) {
        image_thumbnail = mapOptions.fields.field_image_thumbnail.und[0].uri;
    }
    map_info_all.image_thumbnail = image_thumbnail;

    //link
    var link = [];   

    //map_frame_size    
    var map_frame_size = {};
    if (mapOptions.fields.field_frame_size && mapOptions.fields.field_frame_size.und) {
        map_frame_size.height = mapOptions.fields.field_frame_size.und[0].height;
        map_frame_size.width = mapOptions.fields.field_frame_size.und[0].width;        
    }
    map_info_all.map_frame_size = map_frame_size;

    //map_address_search
    var map_address_search = 'on';
    if (mapOptions.fields.field_map_address_search && mapOptions.fields.field_map_address_search.und) {
        map_address_search = mapOptions.fields.field_map_address_search.und[0].value;
    }
    map_info_all.map_address_search = map_address_search;

    //map_attribution
    var map_attribution = '';
    if (mapOptions.fields.field_map_attribution && mapOptions.fields.field_map_attribution.und) {
        map_attribution = mapOptions.fields.field_map_attribution.und[0].value;
    }
    map_info_all.map_attribution = map_attribution;

    //map_basemap

    var map_basemap = []
    if (mapOptions.fields.field_map_basemap && mapOptions.fields.field_map_basemap.und) {
        for (var i = 0; i < mapOptions.fields.field_map_basemap.und.length; i++) {
            map_basemap.push(mapOptions.fields.field_map_basemap.und[i].value);
        }
    }
    map_info_all.map_basemap = map_basemap;

    //map_coordinate_search
    var map_coordinate_search = 'on'
    if (mapOptions.fields.field_map_coordinate_search && mapOptions.fields.field_map_coordinate_search.und) {
        map_coordinate_search = mapOptions.fields.field_map_coordinate_search.und[0].value;
    }
    map_info_all.map_coordinate_search = map_coordinate_search;

    //map_display_date
    var map_display_date = '';
    if (mapOptions.fields.field_map_display_date && mapOptions.fields.field_map_display_date.und) {
        map_display_date = mapOptions.fields.field_map_display_date.und[0].value;
    }
    map_info_all.map_display_date = map_display_date;

    //map_embedded_code


    //map_initial_zoom
    var map_initial_zoom = '';
    if (mapOptions.fields.field_map_initial_zoom && mapOptions.fields.field_map_initial_zoom.und) {
        map_initial_zoom = mapOptions.fields.field_map_initial_zoom.und[0].value;
    }
    map_info_all.map_initial_zoom = map_initial_zoom;

    //map_latitude
    var map_latitude = '0';
    if (mapOptions.fields.field_map_latitude && mapOptions.fields.field_map_latitude.und) {
        map_latitude = mapOptions.fields.field_map_latitude.und[0].value;
    }
    map_info_all.map_latitude = map_latitude;

    //map_layer
    var map_layer = [];
    if (mapOptions.fields.field_map_layer) {
        for (var i = 0; i < mapOptions.fields.field_map_layer.length; i++) {
            var domain = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_domain && mapOptions.fields.field_map_layer[i].field_layer_domain.und) {
                domain = mapOptions.fields.field_map_layer[i].field_layer_domain.und[0].value;
            }
            var format = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_format && mapOptions.fields.field_map_layer[i].field_layer_format.und) {
                format = mapOptions.fields.field_map_layer[i].field_layer_format.und[0].value;
            }
            var name = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_name && mapOptions.fields.field_map_layer[i].field_layer_name.und) {
                name = mapOptions.fields.field_map_layer[i].field_layer_name.und[0].value;
            }
            var opacity = 1.0;
            if (mapOptions.fields.field_map_layer[i].field_layer_opacity && mapOptions.fields.field_map_layer[i].field_layer_opacity.und) {
                opacity = mapOptions.fields.field_map_layer[i].field_layer_opacity.und[0].value;
            }
            var protocol = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_protocol && mapOptions.fields.field_map_layer[i].field_layer_protocol.und) {
                protocol = mapOptions.fields.field_map_layer[i].field_layer_protocol.und[0].value;
            }
            var query_string = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_query_string && mapOptions.fields.field_map_layer[i].field_layer_query_string.und) {
                query_string = mapOptions.fields.field_map_layer[i].field_layer_query_string.und[0].value;
            }
            var style = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_style && mapOptions.fields.field_map_layer[i].field_layer_style.und) {
                style = mapOptions.fields.field_map_layer[i].field_layer_style.und[0].value;
            }
            var title = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_title && mapOptions.fields.field_map_layer[i].field_layer_title.und) {
                title = mapOptions.fields.field_map_layer[i].field_layer_title.und[0].value;
            }
            var type = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_type && mapOptions.fields.field_map_layer[i].field_layer_type.und) {
                type = mapOptions.fields.field_map_layer[i].field_layer_type.und[0].value;
            }
            var visibility = '';
            if (mapOptions.fields.field_map_layer[i].field_layer_visibility && mapOptions.fields.field_map_layer[i].field_layer_visibility.und) {
                visibility = mapOptions.fields.field_map_layer[i].field_layer_visibility.und[0].value;
            }

            var entry = {
                "domain": domain,
                "format": format,
                "name": name,
                "opacity": opacity,
                "protocol": protocol,
                "query_string": query_string,
                "style": style,
                "title": title,
                "type": type,
                "visibility": visibility
            };

            map_layer.push(entry);


        }

    }

    map_info_all.map_layer = map_layer;

    //map_legend
    var map_legend = [];
    if (mapOptions.fields.field_map_legend) {
        for (var i = 0; i < mapOptions.fields.field_map_legend.length; i++) {
            var color = '#FFFFFF';
            if (mapOptions.fields.field_map_legend[i].field_legend_color && mapOptions.fields.field_map_legend[i].field_legend_color.und) {
                color = mapOptions.fields.field_map_legend[i].field_legend_color.und[0].value;
            }
            var text = '';
            if (mapOptions.fields.field_map_legend[i].field_legend_text && mapOptions.fields.field_map_legend[i].field_legend_text.und) {
                text = mapOptions.fields.field_map_legend[i].field_legend_text.und[0].value;
            }
            var entry = {
                "color": color,
                "text": text
            };
            map_legend.push(entry);

        }
    }
    map_info_all.map_legend = map_legend;



    //map_longitude
    var map_longitude = '0';
    if (mapOptions.fields.field_map_longitude && mapOptions.fields.field_map_longitude.und) {
        map_longitude = mapOptions.fields.field_map_longitude.und[0].value;
    }
    map_info_all.map_longitude = map_longitude;

    //map_max_zoom
    var map_max_zoom = '12';
    if (mapOptions.fields.field_map_max_zoom && mapOptions.fields.field_map_max_zoom.und) {
        map_max_zoom = mapOptions.fields.field_map_max_zoom.und[0].value;
    }
    map_info_all.map_max_zoom = map_max_zoom;

    //map_min_zoom
    var map_min_zoom = '3';
    if (mapOptions.fields.field_map_min_zoom && mapOptions.fields.field_map_min_zoom.und) {
        map_min_zoom = mapOptions.fields.field_map_min_zoom.und[0].value;
    }
    map_info_all.map_min_zoom = map_min_zoom;

    //map_options

    //map_page_url
    var map_page_url_url = '';
    var map_page_url_title = '';
    if (mapOptions.fields.field_map_page_url && mapOptions.fields.field_map_page_url.und) {
        map_page_url_url = mapOptions.fields.field_map_page_url.und[0].url;
        map_page_url_title = mapOptions.fields.field_map_page_url.und[0].title;
    }
    map_info_all.map_page_url_url = map_page_url_url;
    map_info_all.map_page_url_title = map_page_url_title;

    //map_repository

    //map_status

    //map_type
    var map_type = '';
    if (mapOptions.fields.field_map_type && mapOptions.fields.field_map_type.und) {
        map_type = mapOptions.fields.field_map_type.und[0].value;
    }
    map_info_all.map_type = map_type;

    //publishing_bureau_office

    //related content

    //related_link

    //related_links
    var related_links = [];
    if (mapOptions.fields.field_related_links && mapOptions.fields.field_related_links.und) {
        for (var i = 0; i < mapOptions.fields.field_related_links.und.length; i++) {
            var title = mapOptions.fields.field_related_links.und[i].title;
            var url = mapOptions.fields.field_related_links.und[i].url;
            if (!/^(f|ht)tps?:\/\//i.test(url)) {
                url = "http://" + url;
            }
            entry = { "title": title, "url": url }
            related_links.push(entry);

        }
    }
    map_info_all.related_links = related_links;

    //tags
    var tag_list = [];

    if (mapOptions.taxonomy && mapOptions.taxonomy.length > 0) {
        tag_list = mapOptions.taxonomy;
    }

    map_info_all.tags = tag_list;

    //search_exclude
    var search_exclude = "0";
    if (mapOptions.fields.field_search_exclude && mapOptions.fields.field_search_exclude.und) {
        search_exclude = mapOptions.fields.field_search_exclude.und[0].value;
    }
    map_info_all.search_exclude = search_exclude;

    //subtitle
    var subtitle = "";
    if (mapOptions.fields.field_subtitle && mapOptions.fields.field_subtitle.und) {
        subtitle = mapOptions.fields.field_subtitle.und[0].value;
    }
    map_info_all.subtitle = subtitle;

}

function formatDate(dateFormat) {
    var dateStr = dateFormat.split('-');
    var MM = dateStr[1];
    var DD = dateStr[2];
    var YYYY = dateStr[0];

    return (MM + '/' + DD + '/' + YYYY);
}

function updateText() {
    $(document).prop('title', map_info_all.title);
    $('#span-title').html(map_info_all.title);
    $('#span-subtitle').html(map_info_all.subtitle);
    //date published
    if (map_info_all.date !== '') {
        $('dd[data-published]').text(formatDate(map_info_all.date.split(' ')[0]));
    } else {
        $('[data-published]').remove();
    }

    //date updated
    if (map_info_all.date_updated_reviewed !== '') {
        $('dd[data-updated]').text(formatDate(map_info_all.date_updated_reviewed.split(' ')[0]));
    } else {
        $('[data-updated]').remove();
    }

    //publishing bureau
    if (map_info_all.bureau_office.value !== '') {
        $('dd[data-bureau]').html('<a href="' + map_info_all.bureau_office.url + '">' + map_info_all.bureau_office.value + '</a>');
    } else {
        $('[data-bureau]').remove();
    }

    $('#span-description').html(map_info_all.description);

    //related links
    if (map_info_all.related_links.length !== 0) {
        var related_links_html = '';
        for (var i = 0; i < map_info_all.related_links.length; i++) {
            var title = map_info_all.related_links[i].title;
            var url = map_info_all.related_links[i].url;
            related_links_html = related_links_html + '<li><a href="' + url + '" target="_blank">' + title + '</a></li>';
        }

        $('[data-relatedLinks]').find('ul').html(related_links_html);
    } else {
        $('[data-relatedLinks]').remove();
    }

    var tagList = '';
    var tagLink = '';
    for (var i = 0; i < map_info_all.tags.length; i++) {
        tagLink = '<a href="' + map_info_all.tags[i].url + '">' + map_info_all.tags[i].name + '</a>';

        tagList += '<li class="tag">' + tagLink + '</li>';
    }

    $('#ul-tag-list').html(tagList);

    // Create Share and Embed links    
    $('#btn-embed').click(function(e) {
        var embedLink = window.location.href.split('#');

        if (map_info_all.map_type === 'iframe') {
            embedLink = map_info_all.webUrl;
            $('.help-block').addClass('hide');
        } else if (embedLink[1] === undefined) { 
            embedLink = embedLink[0] + 'embed/#' + map_info_all.map_initial_zoom + '/' + map_info_all.map_latitude + '/' + map_info_all.map_longitude + '/zoom,search,layers,attr,key';
            $('.help-block').removeClass('hide');
        } else {
            embedLink = embedLink[0] + 'embed/#' + embedLink[1].replace(/\/?$/, '/') + 'zoom,search,layers,attr,key';
            $('.help-block').removeClass('hide');
        }

        e.preventDefault();
        $('#linkShare').slideDown();
        $('#txt-link').val(embedLink).select();
    });

    $('#btn-bookmark').click(function(e) {
        var bookmarkLink = window.location;

        e.preventDefault();
        $('#linkShare').slideDown();
        $('#txt-link').val(bookmarkLink).select();
        $('.help-block').addClass('hide');
    });

    $('#btn-closeShare').click(function(e) {
        e.preventDefault();
        $('#linkShare').slideUp();
    });

    $('#txt-link').on('click, focus', function() {
        this.select();
    });

}

function getMapOption() {

    var mapId = window.location.href.replace(/.*\/\//, '').split('/')[1] || '';
console.log(mapId);

    for (var i = 1; i < contentJson.length; i++) {
        var map_url = '';
        if (contentJson[i].fields.field_map_page_url && contentJson[i].fields.field_map_page_url.und && contentJson[i].fields.field_map_page_url.und[0].url) {
            map_url = contentJson[i].fields.field_map_page_url.und[0].url;
        }

        var mapId0 = map_url.replace(/.*\//, '');

        if (mapId0 == mapId) {
            mapOptions = contentJson[i];
        }

    }

}