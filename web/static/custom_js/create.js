let LIMIT = 60;
let OFFSET = 0;
let COUNT = 0;
let coordinates = [];
let segments = [];
let START_DATE_TIME = '';
let END_DATE_TIME = new Date().toISOString().slice(0, 16);

Create = function (data) {
    this.user_travel_data_url = data.user_travel_data_url;
    this.edit = data.edit;
    this.travel_instance = data.travel_instance;
    const self = this;


    let segment_start_date = $("#segment_start_date_time");
    let start_date = $("#start_date_time");
    let segment_end_date = $("#segment_end_date_time");
    let end_date = $("#end_date_time");
    let segment_description = $("#segment-description");


    if (self.edit === 'True'){
        let obj = JSON.parse(decodeURIComponent(self.travel_instance));
        self.travel_instance = obj;
        $("#title").val(obj.title);
        $("#description").val(obj.description);
        START_DATE_TIME = new Date(obj.start_date_time).toISOString().slice(0, 16);
        END_DATE_TIME = new Date(obj.end_date_time).toISOString().slice(0, 16);
        $("#start_date_time").val(START_DATE_TIME);
        $("#end_date_time").val(END_DATE_TIME);
        $("#color").val(obj.color);
        segment_start_date.attr("max", END_DATE_TIME);
        segment_end_date.attr("max", END_DATE_TIME);
        segment_start_date.attr("min", START_DATE_TIME);
        segment_end_date.attr("min", START_DATE_TIME);
        segments = obj.segments_data;
        self.generate_segment_grid();
    }
    //Initiate Auto Complete Function
    self.initAutocomplete();

    self.generate_segment_grid()

    $("#create-segment").on('click', function (e) {
        e.preventDefault();
        if (start_date_time === "") {
            genericSweetAlert("Error", "Please Select Travel Start Date First", 'error')
            return
        }
        if (segment_start_date.val() === "") {
            genericSweetAlert("Error", "Start Date is Required", 'error')
            return
        } else if (segment_end_date.val() === "") {
            genericSweetAlert("Error", "End Date is Required", 'error')
            return
        } else if (coordinates.length === 0) {
            genericSweetAlert("Error", "Please Select a Place", 'error')
            return
        }
       var isInRange = false;
        var newStartDate = new Date(segment_start_date.val()).toISOString();  // Example new start date
        var newEndDate = new Date(segment_end_date.val()).toISOString();  // Example new end date

        segments.map(i => {
            console.log("Start",newStartDate,i.segment_start_date_time)
            console.log("End",newEndDate,i.segment_end_date_time)
            console.log(newStartDate >= i.segment_start_date_time && newStartDate <= i.segment_end_date_time)
              if (newStartDate >= i.segment_start_date_time && newStartDate <= i.segment_end_date_time) {
                isInRange = true;
              }
                console.log(newEndDate >= i.segment_start_date_time && newEndDate <= i.segment_end_date_time)
              if (newEndDate >= i.segment_start_date_time && newEndDate <= i.segment_end_date_time) {
                isInRange = true;
              }
                console.log(newStartDate <= i.segment_start_date_time && newEndDate >= i.segment_end_date_time)
              if (newStartDate <= i.segment_start_date_time && newEndDate >= i.segment_end_date_time) {
                isInRange = true;
              }
        });

        if (isInRange){
            genericSweetAlert("Error", "Segment Already Exists with this range", 'error')
            return
        }
        segments.push({
            "segment_start_date_time": newStartDate,
            "segment_end_date_time": newEndDate,
            "segment_description": segment_description.val(),
            "coordinates": coordinates
        });
        segment_end_date.val("");
        segment_start_date.val("");
        segment_description.val("");
        coordinates = [];
        self.generate_places_gird();
        self.generate_segment_grid();
    });

    $("#places").on('click', '.delete-coordinate', function () {
        let index = $(this).attr('data-id');
        coordinates.splice(index, 1);
        self.generate_places_gird();
        if (coordinates.length == 0) {
            $("#map").html(`<center><i>Please select a place to see google map</i></center>`)

        }
    })

    $("#segments-data").on('click', '.segment-delete', function (e) {
        let index = $(this).attr('data-id');
        segments.splice(index, 1);
        self.generate_segment_grid();
    })

    end_date.attr("max", END_DATE_TIME);
    end_date.val(END_DATE_TIME);
    start_date.attr("max", END_DATE_TIME);
    segment_start_date.attr("max", END_DATE_TIME);
    segment_end_date.attr("max", END_DATE_TIME);

    start_date.on('change', function () {
        START_DATE_TIME = $(this).val();
        segment_start_date.attr("min", START_DATE_TIME);
        end_date.attr("min", START_DATE_TIME);
    });

    end_date.on('change', function () {
        END_DATE_TIME = $(this).val();
        segment_end_date.attr("max", END_DATE_TIME);
        segment_start_date.attr("max", END_DATE_TIME);
    });

    segment_start_date.on("change", function () {
        segment_end_date.attr("min", $(this).val());
    });

    //Submit the travel form and call init_travel_data to fetch new results
    $("#submit").on('click', function () {
        let url = self.user_travel_data_url;
        let method = 'POST'
        if (self.edit === "True"){
            url += `/${self.travel_instance.id}`;
            method = "PUT"
        }
        self.travel_form_submit(url, method)
    });

};

Create.prototype.generate_places_gird = function () {
    let temp = ``;
    if (coordinates.length == 0) {
        temp += `<i>No Place Added Yet</i>`;
    }
    for (i = 0; i < coordinates.length; i++) {
        temp += `<div class="places d-flex justify-content-between flex-fill"><p class="m-0">${coordinates[i].name} [${coordinates[i].coordinate[0]}, ${coordinates[i].coordinate[1]}]</p> <a class="delete-coordinate" href="javascript:void(0)" data-id="${i}"><i class="fa fa-trash text-danger"></i></a></div>`
    }
    $("#places").html(temp);
}

Create.prototype.travel_form_submit = function (url, method) {
    var self = this;
    let title = $("#title").val();
    let description = $("#description").val();
    let start_date_time = $("#start_date_time").val();
    let end_date_time = $("#end_date_time").val();
    let color = $("#color").val();
    if (!title.trim()) {
        genericSweetAlert("Error", "A Valid title is required", "error")
        return
    } else if (!description.trim()) {
        genericSweetAlert("Error", "A Valid description is required", "error")
        return
    } else if (color === "#ff0000") {
        genericSweetAlert("Error", "Please select some other color", "error")
        return
    } else if (!start_date_time) {
        genericSweetAlert("Error", "A Valid Start Date and Time is required", "error")
        return
    } else if (!end_date_time) {
        genericSweetAlert("Error", "A Valid End Date and Time is required", "error")
        return
    } else if (new Date(start_date_time).getTime() > new Date().getTime()) {
        genericSweetAlert("Error", "Start Date Time Should be less than the current time.", "error")
        return
    } else if (new Date(end_date_time).getTime() > new Date().getTime()) {
        genericSweetAlert("Error", "End Date Time Should be less than the current time.", "error")
        return
    } else if (new Date(start_date_time).getTime() > new Date(end_date_time).getTime()) {
        genericSweetAlert("Error", "Start Date Time Should be less than the End Date time.", "error")
        return
    } else if (segments.length == 0) {
        genericSweetAlert("Error", "Please At Least one Segment is required", "error")
        return
    }


    let travel_form_data = new FormData();
    travel_form_data.append('title', title);
    travel_form_data.append('description', description);
    travel_form_data.append('start_date_time', new Date(start_date_time).toISOString());
    travel_form_data.append('end_date_time', new Date(end_date_time).toISOString());
    travel_form_data.append('color', color);
    travel_form_data.append('segments', JSON.stringify(segments));
    // return false;

    loadingSweetAlert(title = 'Please wait');
    $.ajax({
        url: url, // the endpoint
        type: method, // http method
        processData: false,
        contentType: false,
        data: travel_form_data,
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },

        success: function (json) {
            $("#travel-form").trigger("reset");
            coordinates = [];
            genericSweetAlert("Success", text = json.description, "success").then(() => {
                window.location.href = "/";
            });

        },
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("Authorization", "Token " + getCookie('u-at'));
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        },

        // handle a non-successful response
        error: error_function
    });
}

Create.prototype.fillInLatLong = function() {
    let self = this;
    var place = autocomplete.getPlace();
    if (place.length == 0) {
        return;
    }
    if (!place.place_id) {
        genericSweetAlert("Error", "Please select a place from dropdown", "error");
        return;
    }
    if (!place.geometry) {
        genericSweetAlert("Error", "Returned place contains no geometry.", "error");
        return;
    }
    coordinates.push({
        "name": document.getElementById('search-input').value,
        "coordinate": {
            "lat": place.geometry.location.lat(),
            "lng": place.geometry.location.lng()
        }
    });
    Create.prototype.generate_places_gird();
    document.getElementById('search-input').value = "";
    // initMap(get_coordinates_from_places(coordinates))

}//End of FillinLatLong

// Function to initialize the map
Create.prototype.initAutocomplete = function() {

    let self = this;
    var objSearchID = document.getElementById('search-input');
    autocomplete = new google.maps.places.Autocomplete(objSearchID);
    autocomplete.setFields(['place_id', 'address_component', 'geometry']);
    autocomplete.addListener('place_changed', self.fillInLatLong);

}


Create.prototype.generate_segment_grid = function () {
    console.log(segments)
    let temp = ``;
    if (segments.length === 0) {
        temp += `<center><i>No Segment Added Yet. At lease one segment is required</i></center>`;
    }

    segments.map((i, index) => {
        let location = '';
        if(!Array.isArray(i.coordinates)){
            i.coordinates = JSON.parse(i.coordinates)
        }
        i.coordinates.map(j => {
            location += `${j.name} - `
        })
        temp += `<div class="border border-round p-4" style="width: 48%">
                    <p style="font-size: 14px" class="m-0">${i.segment_description}</p>
                    <p style="font-size: 12px" class="m-0"><i>${get_or_convert_date_time_to_system_time_zone(i.segment_start_date_time)} - ${get_or_convert_date_time_to_system_time_zone(i.segment_end_date_time)}</i></p>
                    <p style="font-size: 14px" class="m-0">${location}</p>
                    <a href="javascript:void(0)" class="btn btn-danger my-2 segment-delete" data-id="${index}"><i class="fa fa-trash"></i></a>
                 </div>`;
    });
    $("#segments-data").html(temp);
}


