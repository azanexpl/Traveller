let LIMIT = 60;
let OFFSET = 0;
let COUNT = 0;
let coordinates = [];

Home = function (data) {
    this.gif_url = data.gif_url;
    this.google_sign_in_url = data.google_sign_in_url;
    this.user_travel_data_url = data.user_travel_data_url;
    this.google_image = data.google_image;
    this.detail_url = data.detail_url;
    this.listing_url = data.listing_url;

    const self = this;

    // Initiate to check if user is logged in then show operational buttons else show login button
    self.init_buttons();
    // Initiate the Empty Calendar
    self.init_calendar();
    //Initiate the API call to fetch the Travel and and then pass that data to the init_calander
    self.init_travel_data();

    //Initiate Auto Complete Function
    initAutocomplete();

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

    // To create a Travel Record a Pop will appear
    $("#create-travel").on("click", function () {
        $("#exampleModal").modal('show');
    });

    // To login, the click event is triggered and it will redirect to the google login screen
    $("#buttons").on('click', "#sign-in-with-google", function () {
        self.google_sign_in();
    });

    //Submit the travel form and call init_travel_data to fetch new results
    $("#submit").on('click', function () {
        self.travel_form_submit()
    });

};

Home.prototype.travel_form_submit = function () {
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
    }
    else if (new Date(start_date_time).getTime() > new Date().getTime()) {
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
    travel_form_data.append('coordinates', JSON.stringify(coordinates));
    // return false;

    loadingSweetAlert(title = 'Please wait');
    $.ajax({
        url: this.user_travel_data_url, // the endpoint
        type: "POST", // http method
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
            coordinates = [];
            $("#exampleModal").modal('hide');
            genericSweetAlert("Success", text = json.description, "success");
            self.init_travel_data();

        },
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("Authorization", "Token " + getCookie('u-at'));
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        },

        // handle a non-successful response
        error: error_function
    });
}


Home.prototype.init_travel_data = function () {
    let self = this;
    $.ajax({
        url: this.user_travel_data_url, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            let event_arr = []
            data.map(i => {
                event_arr.push({
                    title: i.title,
                    url: `${self.detail_url}/${i.id}`,
                    start: i.start_date_time,
                    end: i.end_date_time,
                    backgroundColor: i.color
                })
            });
            self.init_calendar(event_arr);
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


Home.prototype.init_calendar = function (event_arr = []) {
    let calander_height = $(document).height() - $("#header").height();
    $("#calendar-container-2").css("height", calander_height - 40);

    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        height: '100%',
        expandRows: true,
        slotMinTime: '00:00',
        slotMaxTime: '23:00',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        initialDate: get_or_convert_date_to_system_time_zone(),
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        selectable: true,
        nowIndicator: true,
        dayMaxEvents: true, // allow "more" link when too many events
        events: event_arr,
        eventClick: function (info) {
            // alert('Event: ' + info.event.title);
            // alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
            //
            // // change the border color just for fun
            // info.el.style.borderColor = 'red';
            info.jsEvent.preventDefault(); // don't let the browser navigate

            if (info.event.url) {
                window.open(info.event.url);
            }
        }
    });

    calendar.render();
}


Home.prototype.init_buttons = function () {
    let self = this;
    if (getCookie("u-at")) {
        // If got cookie show Oprational Buttons
        $("#buttons").html(`<div class="d-flex flex-wrap justify-content-center w-100" id="navbarSupportedContent">
                <a class="text-decoration-none"
                   href="javascript:void(0)" id="create-travel">
                    Add Travel
                </a>
                
                <a class="text-decoration-none"
                   href="${self.listing_url}">
                    List of Travel
                </a>
            </div>`);
    } else {
        //Show Google Sign In Button
        $("#buttons").html(`            <div class="d-flex flex-wrap justify-content-center w-100" id="navbarSupportedContent">
                <a class="text-decoration-none"
                   href="javascript:void(0)" id="sign-in-with-google">
                    <img src="${this.google_image}" /> Sign In With Google
                </a>
                
            </div>`);
    }
}

Home.prototype.google_sign_in = function () {
    window.location.href = this.google_sign_in_url;
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

