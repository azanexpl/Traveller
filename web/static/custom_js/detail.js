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
    this.images_urls = []

    this.id = data.id;
    const self = this;

    if (self.listing) {
        self.init_travel_data(self.user_travel_data_url);
                //Initiate Auto Complete Function
    initAutocomplete();
    } else {
        self.init_travel_data(self.user_travel_data_url + "/" + self.id);
    }

    $("#places").on('click', '.delete-coordinate', function () {
        let index = $(this).attr('data-id');
        coordinates.splice(index, 1);
        generate_places_gird();
        if (coordinates.length == 0) {
            $("#map").html(`<center><i>Please select a place to see google map</i></center>`)
            return
        }
        initMap(get_coordinates_from_places(coordinates));
    })

    $("#meta-data").on('click', ".delete-button", function (e) {
        e.preventDefault();
        self.delete_travel_data($(this).attr("data-pk"));
    });

    $("#meta-data").on('click', ".edit-button", function (e) {
        e.preventDefault();
        let obj = JSON.parse(decodeURIComponent($(this).attr("data-pk")));
        $("#title").val(obj.title);
        $("#description").val(obj.description);
        $("#start_date_time").val(new Date(obj.start_date_time).toISOString().slice(0, 16));
        $("#end_date_time").val(new Date(obj.end_date_time).toISOString().slice(0, 16));
        $("#color").val(obj.color);
        coordinates = JSON.parse(obj.coordinates);
        $("#submit").attr("data-pk", obj.id);
        $("#exampleModal").modal('show');
        generate_places_gird();
        initMap(get_coordinates_from_places(coordinates), obj.color, obj.title);
    });

    $("#submit").on("click", function () {
        self.travel_form_submit($(this).attr("data-pk"))
    });

    $("#days").on('click', '.date-change', function(){
        date = $(this).attr("data-date");
        if (date === "all"){
            console.log(JSON.stringify(self.images_urls))
            self.init_images_urls(JSON.stringify(self.images_urls));
            return
        }
        if (self.images_urls === "{}" || self.images_urls === "null"){
            return
        }
        let data = self.images_urls.mediaItems.filter(i => {
            if (date === new Date(i.mediaMetadata.creationTime).toISOString().split('T')[0]){
                return i
            }
        });
        self.init_images_urls(JSON.stringify({"mediaItems": data}), true);
    });
};

Detail.prototype.init_travel_data = function (url) {
    let self = this;
    $.ajax({
        url: url, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            if (self.listing) {
                template_arr = "";
                data.map(i => {
                    images = "";
                    if (i.images_urls == "{}" || i.images_urls === "null") {
                        images = "No Image Found";
                    } else {
                        images_data = JSON.parse(i.images_urls);
                        images = `<img src="${images_data.mediaItems[0].baseUrl}"  width="100%" style=""/>`;
                    }
                    let obj_data = encodeURIComponent(JSON.stringify(i));
                    template_arr += `<a class="d-flex justify-content-between w-100 custom-listing" style="height: 300px; overflow: hidden" href="${self.detail_url + "/" + i.id}">
                                <div class="d-flex justify-content-between w-75">
                                    <ul class="list-unstyled px-4" style="width: 85%">
                                        <li><h1>${i.title}</h1></li>
                                        <li><p style="height: 130px; overflow: hidden">${i.description}</p></li>
                                    </ul>
                                    <ul class="list-unstyled d-flex flex-column justify-content-evenly" style="width: 15%">
                                        <li><button data-pk="${obj_data}" type="button" class="btn btn-info edit-button"><i class="fa fa-pencil"></i> Edit</button></li>
                                        <li><button data-pk='${JSON.stringify(i.id)}' type="button" class="btn btn-danger delete-button"><i class="fa fa-trash"></i> Delete</button></li>
                                    </ul>
                                </div>
                            </a>`
                });
                $("#meta-data").html(template_arr);
            } else {
                console.log(get_coordinates_from_places(JSON.parse(data.coordinates)));
                initMap(get_coordinates_from_places(JSON.parse(data.coordinates)), data.color, data.title);
                $("#meta-data").html(`<div class="col-12">
                                    <h1>${data.title}</h1>
                                    <p style="font-size: 12px">${get_or_convert_date_time_to_system_time_zone(data.start_date_time)} - ${get_or_convert_date_time_to_system_time_zone(data.end_date_time)}</p>
                                    <p>${data.description}</p>
                                    </div>`)

                self.init_days(data.end_date_time, data.start_date_time);

                self.init_images_urls(data.images_urls);
            }
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

Detail.prototype.init_days = function (end_date_time, start_date_time) {
    difference = new Date(end_date_time) - new Date(start_date_time);
    days = Math.ceil(difference / (1000 * 3600 * 24));
    days_arr = `<button class="date-change btn btn-outline-white text-black border-dark" data-date="all">All</button>`;
    for (i = 0; i <= days; i++) {
        date_for_day = get_or_convert_date_to_system_time_zone(start_date_time)
        count = i;
        days_arr += `<button class="date-change btn btn-outline-white text-black border-dark" data-date="${addDays(date_for_day, i)}">Day ${count + 1}</button>`;
    }
    $("#days").html(days_arr)
}

Detail.prototype.init_images_urls = function(images_urls, rerender = false){
    let self = this;
    show_images = "<ul>";
                if (images_urls != "{}" && images_urls != "null" && images_urls != "[]") {
                    all_data = JSON.parse(images_urls)
                    if(!rerender){
                        self.images_urls = all_data;
                    }
                    all_data.mediaItems.map(i => {
                        show_images += `<li><a href="${i.productUrl}" target="_blank"><img class="img img-thumbnail img-rounded" src="${i.baseUrl}"/></a></li>`
                    });
                } else {
                    show_images += `<li>No Images Found</li>`
                }
                show_images += `</ul>`;
                $("#photos").html(show_images);
}

Detail.prototype.travel_form_submit = function (id) {
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
    }else if (new Date(start_date_time).getTime() > new Date().getTime()) {
        genericSweetAlert("Error", "Start Date Time Should be less than the current time.", "error")
        return
    } else if (new Date(end_date_time).getTime() > new Date().getTime()) {
        genericSweetAlert("Error", "End Date Time Should be less than the current time.", "error")
        return
    } else if (new Date(start_date_time).getTime() > new Date(end_date_time).getTime()) {
        genericSweetAlert("Error", "Start Date Time Should be less than the End Date time.", "error")
        return
    }else if(coordinates.length == 0){
        genericSweetAlert("Error", "Please add locations", "error")
        return
    }


    let travel_form_data = new FormData();
    travel_form_data.append('title', title);
    travel_form_data.append('description', description);
    travel_form_data.append('start_date_time', new Date(start_date_time).toISOString());
    travel_form_data.append('end_date_time', new Date(end_date_time).toISOString());
    travel_form_data.append('color', color);
    travel_form_data.append('id', id);
    travel_form_data.append('coordinates', JSON.stringify(coordinates));

    loadingSweetAlert(title = 'Please wait');
    $.ajax({
        url: this.user_travel_data_url + "/" + id, // the endpoint
        method: "PUT", // http method
        processData: false,
        contentType: false,
        data: travel_form_data,
        // data: $('#add-content-form').formSerialize(),
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },

        success: function (json) {
            $("#travel-form").trigger("reset");
            $("#exampleModal").modal('hide');
            genericSweetAlert("Success", text = json.description, "success");
            self.init_travel_data(self.user_travel_data_url);

        },
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("Authorization", "Token " + getCookie('u-at'));
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        },

        // handle a non-successful response
        error: error_function
    });
}

Detail.prototype.delete_travel_data = function (id) {
    let self = this;
    loadingSweetAlert("Please Wait");
    $.ajax({
        url: self.delete_url + "/" + id, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            self.init_travel_data(self.user_travel_data_url);
            genericSweetAlert("Success", json.description, "success");
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


function generate_places_gird() {
    let temp = ``;
    if (coordinates.length == 0) {
        temp += `<i>No Place Added Yet</i>`;
    }
    for (i = 0; i < coordinates.length; i++) {
        temp += `<div class="places d-flex justify-content-between flex-fill"><p class="m-0">${coordinates[i].name} [${coordinates[i].coordinate[0]}, ${coordinates[i].coordinate[1]}]</p> <a class="delete-coordinate" href="javascript:void(0)" data-id="${i}"><i class="fa fa-trash text-danger"></i></a></div>`
    }
    $("#places").html(temp);
}