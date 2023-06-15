LoadMap = function (data) {
    this.marker = '';
    this.elementid = data.DomElementId;
    this.myOptions = this.options();
    this.map = this.initMap(document.getElementById(this.elementid), this.myOptions);
    const self = this;
    google.maps.event.addListener(self.map, 'click', function (event) {
        // call function to reposition marker location
        self.placeMarker(event.latLng);
        update_property_latlong(event.latLng.lat().toFixed(5), event.latLng.lng().toFixed(5));
    });
};
LoadMap.prototype.options = function (zoom_level, map_type, lat, long) {
    if (chkEmpty(zoom_level)) {
        zoom_level = 12;
    }
    if (chkEmpty(map_type)) {
        map_type = 'roadmap';
        // map_type ='hybrid';
    }
    if (chkEmpty(lat)) {
        lat = 34.1688;
    }
    if (chkEmpty(long)) {
        long = 73.2215;
    }
    // for abbotabad 34.1688° N, 73.2215° E
    //  Latitude: 34.0000 Longitude: 73.0000
    return {
        zoom: zoom_level,
        center: new google.maps.LatLng(lat, long),//default for abbotabad
        zoomControl: true,
        mapTypeId: map_type,
        draggableCursor: 'crosshair',
        draggingCursor: 'move',
        animation: google.maps.Animation.DROP
    }
};
LoadMap.prototype.setCenter = function (latitude, longitude) {
    // if not attrib default set to lahore
    const self = this;
    if (chkEmpty(latitude)) {
        latitude = 31.5204;
    }
    if (chkEmpty(longitude)) {
        longitude = 74.3587;
    }
    self.map.setCenter(new google.maps.LatLng(latitude, longitude));

};
LoadMap.prototype.placeMarker = function (location) {
    const self = this;
        if (self.marker) {
        self.marker.setPosition(location);
    } else {
        self.marker = new google.maps.Marker({
            position: location,
            map: self.map
        });
    }
};

LoadMap.prototype.initMap = function (element, setting_options) {
    return new google.maps.Map(element, setting_options);
};

//dedicated method correspond to caller object
function update_property_latlong(lat, lng) {
    $("#property-latitude").val(lat);
    $("#property-longitude").val(lng);
}
