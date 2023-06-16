function simpleToastNotification(type = "success", message = "") {
    $.simplyToast(type, message, {
        offset:
            {
                from: "bottom",
                amount: 10
            },
        align: "right",
        width: 300,
        delay: 2500,
        allow_dismiss: false,
        stackup_spacing: 10
    });
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const error_function = function (xhr, errmsg, err) {
    if (xhr.status === 403 || xhr.status === 401) {
        data = xhr.responseJSON;
        message = "detail" in data ? data.detail : data.description
        deleteAllCookies()
        genericSweetAlert(title = "Error", text = message, type = 'error').then(function () {
            window.location.href = "/";
        });

    } else if (xhr.status === 500) {
        genericSweetAlert(title = "Error", text = xhr.statusText, type = 'error');

    } else if (xhr.status === 404) {
        genericSweetAlert(title = "Error", text = xhr.statusText, type = 'error');

    } else if (xhr.status === 422) {
        genericSweetAlert(title = "Error", text = xhr.responseJSON.description, type = 'error');

    }
}

$("#logout").on("click", function () {
    $.ajax({
        url: "/api/users/logout", // the endpoint
        type: "GET", // http method
        headers: {},
        success: function (json) {
            if (json['success'] == true) {
                setCookie("u-at", "")
                saveToLocalStorage("u-at", "")
                deleteAllCookies();
                simpleToastNotification("success", json['description'])
                window.location.href = "/"
            }
        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            if (xhr.status == 403) {
                genericSweetAlert(title = "Error", type = 'error');
            }
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
})


function convertToSlug(Text) {
    return Text.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

function get_or_convert_date_time_to_system_time_zone(date = "") {
    let time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (date) {
        return new Date(date).toLocaleString("en-US", {timeZone: time_zone})
    }
    return new Date().toLocaleString("en-US", {timeZone: time_zone})
}

function get_or_convert_date_to_system_time_zone(date = "") {
    let time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (date) {
        return new Date(date).toISOString().split('T')[0].toLocaleString("en-US", {timeZone: time_zone})
    }
    return new Date().toISOString().split('T')[0].toLocaleString("en-US", {timeZone: time_zone})
}


function deleteAllCookies() {
    var cookies = document.cookie.split("; ");
    console.log("Cookies", cookies);
    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
            var p = location.pathname.split('/');
            document.cookie = cookieBase + '/';
            while (p.length > 0) {
                document.cookie = cookieBase + p.join('/');
                p.pop();
            }

            d.shift();
        }
    }
}

// deleteAllCookies()
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}


function get_coordinates_from_places(coordinates) {
    return coordinates.map(i => {
        return i.coordinate
    });
}

let map;

async function initMap(coordinates, color = "black", title = "") {
    console.log("Hitted Init Map");
    const {Map} = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById("map"), {
        center: {
            lat: coordinates[parseInt(coordinates.length - 1)][0],
            lng: coordinates[parseInt(coordinates.length - 1)][1]
        },
        zoom: 10,
    });
    let previousMarker = null;

    for (i = 0; i < coordinates.length; i++) {
        // Create a marker for each location
        const marker = new google.maps.Marker({
            position: {lat: coordinates[i][0], lng: coordinates[i][1]},
            map: map,
            title: title,
            icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: 'red', // Customize the marker color here
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 6
            }
        });

        if (previousMarker) {
            const line = new google.maps.Polyline({
                path: [previousMarker.getPosition(), marker.getPosition()],
                geodesic: true,
                strokeColor: color, // Customize the line color here
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            line.setMap(map);
        }

        previousMarker = marker;
    }
}


