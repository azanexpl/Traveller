let LIMIT = 60;
let OFFSET = 0;
let COUNT = 0;
let coordinates = [];

Detail = function (data) {
    this.gif_url = data.gif_url;
    this.user_travel_data_url = data.user_travel_data_url;
    this.user_images_url = data.user_images_url;
    this.listing = data.listing;
    this.detail_url = data.detail_url;
    this.delete_url = data.delete_url;
    this.images_urls = [];
    this.segment_id = null;

    this.id = data.id;
    const self = this;

    const urlParams = new URLSearchParams(window.location.search);
    self.segment_id = urlParams.get('segment_id');

    if (self.segment_id){
        $("#header").hide();
    }

    self.init_travel_data(self.user_travel_data_url + "/" + self.id);
};

function initMultiplePollyMap(data, id, title, color, history_data=[]) {
    // Create a map object
    // console.log(data);
    let map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7128, lng: -74.0060}, // Set the center of the map
        zoom: 2, // Set the initial zoom level
        minZoom: 1
    });

    let infoWindow = new google.maps.InfoWindow();
    history_trail = history_data.map(i => {
        return {
            "lat": parseFloat(i.latitude),
            "lng": parseFloat(i.longitude)
        }
    });

      // Create a polyline object
      var polyline = new google.maps.Polyline({
        path: history_trail,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });

      // Add the polyline to the map
      polyline.setMap(map);



    data.map((i, i_index) => {
        let coordinates = JSON.parse(i.coordinates);
        let previousMarker = null;

        coordinates.map((j, j_index)=> {
            // Create a marker for each location
            let start_time = get_or_convert_date_time_to_system_time_zone(i.segment_start_date_time);
            let end_time = get_or_convert_date_time_to_system_time_zone(i.segment_end_date_time);
            const marker = new google.maps.Marker({
                position: {lat: j.coordinate.lat, lng: j.coordinate.lng},
                map: map,
                title: `Start Date:${start_time}\nEnd Date:${end_time}`,
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    fillColor: 'red', // Customize the marker color here
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 6
                }
            });
            // Add event listener to show details in the InfoWindow
            marker.addListener('click', function () {
                count = i_index + 1;
                var content = `<h6>Segment ${count}</h6>
                                <p>${start_time} - ${end_time}</p>
                                <p>${j.name}</p>
                                <p>${i.segment_description}</p>
                                <a href="/detail/${id}?segment_id=${i.id}">Click here for Detail View</a>`;

                infoWindow.setContent(content);
                infoWindow.open(map, this);
            });


            // if (previousMarker) {
            //     const line = new google.maps.Polyline({
            //         path: [previousMarker.getPosition(), marker.getPosition()],
            //         geodesic: true,
            //         strokeColor: color, // Customize the line color here
            //         strokeOpacity: 1.0,
            //         strokeWeight: 2
            //     });
            //
            //     line.setMap(map);
            // }
            // previousMarker = marker;
        });
    })

}


Detail.prototype.init_travel_data = function (url) {
    let self = this;
    $.ajax({
        url: url, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            let arr = [];
            // If segment Detail is Required
            let travel_history_arr = [];

            if (self.segment_id) {
                arr = data.segments_data.filter(i => {
                    if (i.id === parseInt(self.segment_id)) {
                        return i
                    }
                });

                start_date = new Date(arr[0].segment_start_date_time).toISOString().split('T')[0];
                end_date = new Date(arr[0].segment_end_date_time).toISOString().split('T')[0];
                console.log(start_date, end_date)
                if (data.images_urls === "{}" || data.images_urls === "null") {
                    image_data_filter = "{}"
                    image_data = image_data_filter
                }else{
                    image_data_filter = JSON.parse(data.images_urls).mediaItems.filter(i => {

                        if (new Date(i.mediaMetadata.creationTime).toISOString().split('T')[0] >= start_date && new Date(i.mediaMetadata.creationTime).toISOString().split('T')[0] <= end_date) {
                            return i
                        }
                    });
                    image_data = JSON.stringify({"mediaItems": image_data_filter});
                }
                image_flag = true;
                title = "Segment Detail";
                description = arr[0].segment_description;
                start_date = arr[0].segment_start_date_time;
                end_date = arr[0].segment_end_date_time;
                segment_arr = [];
                travel_history_arr = data.travel_history.filter(i => {
                    check = new Date(i.start_date_time).toISOString().split('T')[0] >= new Date(start_date).toISOString().split('T')[0] && new Date(i.start_date_time).toISOString().split('T')[0] <= new Date(end_date).toISOString().split('T')[0]
                    if (check){
                        console.log(i);
                        return i
                    }
                })
                console.log("Segment", travel_history_arr)
            } else {
                arr = data.segments_data;
                image_data = data.images_urls;
                image_flag = false;
                title = data.title;
                description = data.description;
                start_date = data.start_date_time;
                end_date = data.end_date_time;
                segment_arr = data.segments_data;
                travel_history_arr = data.travel_history;
            }

            initMultiplePollyMap(
                arr,
                data.id,
                data.title,
                data.color,
                travel_history_arr
            )
            // initMap(get_coordinates_from_places(JSON.parse(data.coordinates)), data.color, data.title);
            $("#meta-data").html(`<div class="col-12">
                                    <h1>${title}</h1>
                                    <p style="font-size: 12px">${get_or_convert_date_time_to_system_time_zone(start_date)} - ${get_or_convert_date_time_to_system_time_zone(end_date)}</p>
                                    <p>${description}</p>
                                    </div>`)

            self.init_segments(segment_arr);
            self.init_images_urls(image_data, image_flag);

        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
}

Detail.prototype.init_segments = function (data) {
    let self = this;
    let days_arr = ``;
    if (self.segment_id){
        days_arr = `<a href="/detail/${self.id}" class="date-change btn btn-outline-white text-black border-dark" data-date="all">Return</a>`;
    }
    data.map((i, index) => {
        count = index + 1;
        days_arr += `<a href="${window.location.href}?segment_id=${i.id}" class="date-change btn btn-outline-white text-black border-dark" date-start="${i.segment_start_date_time}" date-end="${i.segment_end_date_time}">Segment ${count}</a>`;
    })

    $("#days").html(days_arr)
}

Detail.prototype.init_images_urls = function (images_urls, rerender = false) {
    let self = this;
    image_amount = "";
    show_images = "<ul>";
    if (images_urls != "{}" && images_urls != "null" && images_urls != "[]") {
        all_data = JSON.parse(images_urls)
        if (!rerender) {
            self.images_urls = all_data;
        }
        all_data.mediaItems.map(i => {
            show_images += `<li><a href="${i.productUrl}" target="_blank"><img class="img img-thumbnail img-rounded" src="${i.baseUrl}"/></a></li>`
        });
        image_amount = `<p>Image amount: ${all_data.mediaItems.length}</p>`
    } else {
        image_amount = `<p>Image amount: 0</p>`
    }
    show_images += `</ul>`;
    $("#photos_amount").html(image_amount);
    $("#photos").html(show_images);
}

Detail.prototype.init_user_images = function (id) {
    console.log('init_user_images')
    let self = this;
    $.ajax({
        url: this.user_images_url + "/" + id, // the endpoint
        type: "GET", // http method
        success: function (json) {
            console.log(json);

        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
}
