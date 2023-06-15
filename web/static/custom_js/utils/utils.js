const ENV = 'dev';

// Global methods.
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// function getCookie(name) {
//     var cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         var cookies = document.cookie.split(';');
//         for (var i = 0; i < cookies.length; i++) {
//             var cookie = jQuery.trim(cookies[i]);
//             // Does this cookie string begin with the name we want?
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

function saveToLocalStorage(_key, value) {
    localStorage.setItem(_key, value);
}

function getFromLocalStorageData(key) {
    return localStorage.getItem(key);
}

(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
    };
}(jQuery));

function getDataUrl(img) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL();
};


function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], {type: mimeString});
};

function defaultSaleDropdown(dropdown) {
    $(dropdown).children('option[value="1"]').remove();
    $(dropdown).children('option[value="2"]').remove();
}
function setSaleDropdown(dropdown) {
    defaultSaleDropdown(dropdown);
    $(dropdown).prepend('<option value=6>Residential Plot</option>');
    $(dropdown).prepend('<option value=7>Commercial Plot</option>');
    $(dropdown).prepend('<option value=8>Farmhouse Plot</option>');
    $(dropdown).prepend('<option value=9>Plot File</option>');
}
function setRentDropdown(dropdown) {
    defaultRentDropdown(dropdown);
    $(dropdown).prepend('<option value=2>Lower Portion</option>');
    $(dropdown).prepend('<option value=1>Upper Portion</option>');

}
function defaultRentDropdown(dropdown) {
    $(dropdown).children('option[value="6"]').remove();
    $(dropdown).children('option[value="7"]').remove();
    $(dropdown).children('option[value="8"]').remove();
    $(dropdown).children('option[value="9"]').remove();
}
function Ucfirst(string) {
    //converet the first letter to capital
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getFloorPlanDescriptions(context) {
    const self = context;
    $('input[type="text"].set-img-toggle').each(function () {
        var obj = {id: '', value: ''};
        obj.id = $(this).attr('id');
        obj.value = $(this).val();
        self.fp_images_titles.push(obj);
    });
}
function responseHandler(error) {
    try {
        var fields = Ucfirst(error.field);
        var message = error.message;
        if (typeof fields === 'undefined') {
            fields = '';
        }
        if (typeof message === 'undefined') {
            message = '';
        }
        var error = fields + ' : ' + message;
        genericSweetAlert(title = error, type = 'error').then((function () {
            $(':input[type="submit"]').prop('disabled', false);
        }));
    } catch (error) {
        console.log(error);
    }
}
function toBoolean(value) {
    // Parse the string ``"true"`` or ``"false"`` as a boolean (case
    // insensitive). Also accepts ``"1"`` and ``"0"`` as ``True``/``False``
    // (respectively). If the input is from the request JSON body, the type is
    // already a native python boolean, and will be passed through without
    // further parsing.
    var result = false;
    var check =true;
    try {
        if (typeof (value) == "boolean") {
            return value
        }
        var value = String(value).toLowerCase();
        var TrueCases = ['true', 'yes', '1', 1];
        $.each(TrueCases, function (i, obj) {
            if (value == obj) {
                result = true;
                return check = false;
            }
        });
        if (check) {
            var FalseCases = ['false', 'no', '0', 0, ''];
            $.each(FalseCases, function (i, obj) {
                if (value == obj) {
                    return result = false;
                }
            });
        }
        return result;
    } catch (error) {
        console.log(error);
    }
}
function chkEmpty(value) {
    return typeof value === 'undefined' ?  true :  false;
}
