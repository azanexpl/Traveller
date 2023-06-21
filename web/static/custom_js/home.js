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
    this.create_url = data.create_url;
    this.gps_trail = data.gps_trail;

    const self = this;

    // Initiate to check if user is logged in then show operational buttons else show login button
    self.init_buttons();
    // Initiate the Empty Calendar
    self.init_calendar();
    //Initiate the API call to fetch the Travel and and then pass that data to the init_calander
    self.init_travel_data();

    // To login, the click event is triggered and it will redirect to the google login screen
    $("#buttons").on('click', "#sign-in-with-google", function () {
        self.google_sign_in();
    });

    //Submit the travel form and call init_travel_data to fetch new results
    $("#buttons").on('click', "#submit", function () {
        $("#gps_file").click();
    });

    $("#gps_file").on('change', function () {
        var fileInput = $(this)[0];
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('file', file);
        loadingSweetAlert("Please Wait")
        $.ajax({
            url: self.gps_trail, // the endpoint
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (json) {
                genericSweetAlert("Success", "Data Dumped Successfully", 'success');
            },
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            },
            // handle a non-successful response
            error: error_function
        });
    });

};


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
            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek'
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
            info.jsEvent.preventDefault(); // don't let the browser navigate

            if (info.event.url) {
                window.open(info.event.url, "_self");
            }
        }
    });

    calendar.render();
}


Home.prototype.init_buttons = function () {
    let self = this;
    if (getCookie("u-at")) {
        // If got cookie show Operational Buttons
        $("#buttons").html(`<div class="d-flex flex-wrap justify-content-center w-100" id="navbarSupportedContent">
                <a class="text-decoration-none"
                   href="${self.create_url}">
                    Add Travel
                </a>
                
                <a class="text-decoration-none"
                   href="${self.listing_url}">
                    List All Travels
                </a>
                <a class="text-decoration-none"
                   href="/map">
                    Map With All Travels
                </a>
                <button class="text-decoration-none"
                    type="button" id="submit">
                    Upload Google GPS data
                </button>
            </div>`);
    } else {
        //Show Google Sign In Button
        $("#buttons").html(`<div class="d-flex flex-wrap justify-content-center w-100" id="navbarSupportedContent">
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

