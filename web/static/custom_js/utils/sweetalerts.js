function saveToLocalStorage(_key, value) {
    localStorage.setItem(_key, value);
}

function loadingSweetAlert(title) {
    Swal.fire({
        title: title,
        allowOutsideClick: false
    });
    Swal.showLoading();
}
function genericSweetAlert(title,text, type, confirmButtonColor) {
    // title is necessary
    // type, confirmButtonColor are optional

    confirmButtonColor = typeof confirmButtonColor === 'undefined' ? '#4fa7f3' : confirmButtonColor;
    type = typeof type === 'undefined' ? 'error' : type;
    return Swal.fire(
        {
            title: title,
            text: text,
            icon: type,
            confirmButtonColor: confirmButtonColor,
            allowOutsideClick: false
        }
    )
}
function genericHelpingTextSweetAlert(title, text, type, showCancelButton) {
    // title , text is necessary
    // type, showCancelButton are optional
    showCancelButton = typeof showCancelButton === 'undefined' ? false : showCancelButton;
    type = typeof type === 'undefined' ? 'error' : type;
    return swal(
        {
            title: title,
            text: text,
            type: type,
            showCancelButton: showCancelButton,
            allowOutsideClick: false
        }
    )
}

function genericHelpingTextSweetAlert2(title, text, type, showCancelButton) {

    showCancelButton = typeof showCancelButton === 'undefined' ? false : showCancelButton;
    type = typeof type === 'undefined' ? 'error' : type;
    return swal(
        {
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Send',
            cancelButtonColor: '#d33',
            showCancelButton: showCancelButton,
            allowOutsideClick: false
        }
    )
}

function genericHelpingTextSweetAlert3(title, text, type, showCancelButton) {

    showCancelButton = typeof showCancelButton === 'undefined' ? false : showCancelButton;
    type = typeof type === 'undefined' ? 'error' : type;
    return swal(
        {
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Upload',
            cancelButtonColor: '#d33',
            showCancelButton: showCancelButton,
            allowOutsideClick: false
        }
    )
}
