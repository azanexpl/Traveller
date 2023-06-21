let LIMIT = 60;
let OFFSET = 0;
let COUNT = 0;
let coordinates = [];

MapDetail = function (data) {
    this.map_detail_url = data.map_detail_url;
    const self = this;

    self.init_travel_data(self.map_detail_url);

    $("#map").css("height", $(document).height())
};

function initMultiplePollyMap(data) {
    // Create a map object
    let map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.2318, lng: 21.0060}, // Set the center of the map
        zoom: 7, // Set the initial zoom level
        minZoom: 1
    });

    let infoWindow = new google.maps.InfoWindow();
    // Travel Object
    data.map(travel => {
        // Travel Segments
        travel.segments_data.map((i, i_index) => {
        let coordinates = JSON.parse(i.coordinates);
        let previousMarker = null;
        // Segment Coordinates
        coordinates.map(j => {
            // Create a marker for each location
            let start_time = get_or_convert_date_time_to_system_time_zone(i.segment_start_date_time);
            let end_time = get_or_convert_date_time_to_system_time_zone(i.segment_end_date_time);
            const marker = new google.maps.Marker({
                position: {lat: j.coordinate.lat, lng: j.coordinate.lng},
                map: map,
                title: `Start Date:${start_time}\nEnd Date:${end_time}`,
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    fillColor: travel.color, // Customize the marker color here
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 6
                }
            });
            // Add event listener to show details in the InfoWindow
            marker.addListener('click', function () {
                var content = `<h6>${travel.title}</h6>
                                <p>${start_time} - ${end_time}</p>
                                <p>${travel.description}</p>
                                <p><a href="/detail/${travel.id}" target="_blank">Click here for Detail Travel View</a></p>
                                `;

                infoWindow.setContent(content);
                infoWindow.open(map, this);
            });


            // if (previousMarker) {
            //     const line = new google.maps.Polyline({
            //         path: [previousMarker.getPosition(), marker.getPosition()],
            //         geodesic: true,
            //         strokeColor: travel.color, // Customize the line color here
            //         strokeOpacity: 1.0,
            //         strokeWeight: 2
            //     });
            //
            //     line.setMap(map);
            // }
            // previousMarker = marker;
        });
    })
    })

}

MapDetail.prototype.init_travel_data = function (url) {
    let self = this;
    $.ajax({
        url: url, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            initMultiplePollyMap(
                data
            )
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
