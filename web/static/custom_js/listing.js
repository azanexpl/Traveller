var start_date;
var end_date;


Listing = function (data) {
    this.delete_url = data.delete_url;
    this.travel_datatable_url = data.travel_datatable_url;
    this.travel_datatable_self = null;
    this.create_view_url = data.create_url;

    this.id = data.id;
    const self = this;

    let travel_datatable = $("#travel-datatable");

    self.init_data_table(self.create_url(start_date, end_date));

    travel_datatable.on('click', ".delete-travel", function (e) {
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

    $('#startdate').on('change', function () {
        start_date = $(this).val();
    });
    $('#enddate').on('change', function () {
        end_date = $(this).val();
    });


    $("#check-records").on("click", function (e) {
        self.init_data_table(self.create_url(start_date, end_date));

    });

    $("#reset-records").on('click', function(e){
        start_date = "";
        end_date = "";
        $('#startdate').val("");
        $('#enddate').val("");
        self.init_data_table(self.create_url(start_date, end_date));
    })

};


Listing.prototype.init_data_table = function (query_params) {
    const self = this;
    self.travel_datatable_self = $('#travel-datatable').DataTable({
        "processing": true,
        "serverSide": true,
        // "order": [[ 12, "asc" ]],
        "destroy": true,
        "ajax": {
            "url": self.travel_datatable_url + query_params,
            "type": "GET",
            // dataSrc:"",
            // "dataSrc": "data.payload",

            headers: {},
            dataFilter: function (responsce) {
                var json = jQuery.parseJSON(responsce);
                json = json.payload
                totalEntries = json.recordsTotal;
                return JSON.stringify(json); // return JSON string
            },
            // handle a non-successful response
            error: error_function

        },
        "columns": [
            {
                "title": "ID",
                "data": "id",
                "mRender": function (data, type, full) {
                    if (data) {
                        return '<td>' + data + '</td>';
                    } else return '<td class="center"> - </td>'
                }
            },
            {
                "title": "Title",
                "data": "title",
                "mRender": function (data, type, full) {
                    if (data) {
                        return '<td>' + data + '</td>';
                    } else return '<td class="center"> - </td>'
                }
            },
            {
                "title": "Description",
                "data": "description",
                "mRender": function (data, type, full) {
                    if (data) {
                        return '<td>' + data + '</td>';
                    } else return '<td class="center"> - </td>'
                }
            },

            {
                "title": "Start Date Time",
                "data": "start_date_time",
                "mRender": function (data, type, full) {
                    if (data) {
                        return '<td>' + get_or_convert_date_time_to_system_time_zone(data) + '</td>';
                    } else return '<td class="center"> - </td>'
                }
            },
            {
                "title": "End Date Time",
                "data": "end_date_time",
                "mRender": function (data, type, full) {
                    if (data) {
                        return '<td>' + get_or_convert_date_time_to_system_time_zone(data) + '</td>';
                    } else return '<td class="center"> - </td>'
                }
            },
            {
                "title": "Actions",
                'data': 'id',
                "mRender": function (data, type, full) {

                    if (data) {
                        let operations = "";
                        operations += `<a title='View' href="/detail/${full.id}" style='padding-right: 2px; cursor: pointer'  class='view-travel mx-2'><i class="fa fa-eye text-info"></i></a>`;
                        operations += `<a title='Edit' href="${self.create_view_url}?id=${full.id}" target="_blank" data-pk="${full.id}" style='padding-right: 2px; cursor: pointer'  class='edit-travel mx-2'><i class="fa fa-pencil-alt text-info"></i></a>`;
                        operations += '<a title="Delete" data-pk="' + full.id + '" style="padding-right: 1px; cursor: pointer"  class="mx-2 delete-travel"><i class="fa fa-trash text-danger"></i></a>';
                        return operations;

                    }
                }

            }
        ],

    });
};


Listing.prototype.delete_travel_data = function (id) {
    let self = this;
    loadingSweetAlert("Please Wait");
    $.ajax({
        url: self.delete_url + "/" + id, // the endpoint
        type: "GET", // http method
        success: function (json) {
            data = json.payload;
            self.travel_datatable_self.ajax.reload(null,false);
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


Listing.prototype.create_url = function (start_date = "", end_date="") {
    return `?start_date=${start_date}&end_date=${end_date}`;
}
