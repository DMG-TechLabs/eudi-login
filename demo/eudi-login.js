config_t = {
    AgeOver18: false,
    HealthID: false,
    IBAN: false,
    Loyalty: false,
    mDL: false,
    MSISDN: false,
    PhotoId: false,
    PID: false,
    PowerOfRepresentation: false,
    PseudonymDeferred: false,
    Reservation: false,
    TaxNumber: false
}

const AUTH_URL = "http://localhost";

function login(config) {
    // const authWindow = window.open(AUTH_URL, "_blank");
    //
    // authWindow.onload = () => {
    //     timeout = setTimeout(function() {
    //         console.log("timeout")
    //         authWindow.postMessage({
    //             site: window.location.origin,
    //             data: config
    //         }, AUTH_URL);
    //     }, 1000);
    //     // authWindow.postMessage({
    //     //     site: window.location.origin,
    //     //     data: config
    //     // }, AUTH_URL);
    // };
    //
    window.addEventListener("message", function(event) {
        console.log("Received message from:", event.origin);
        console.log("Received Data:", event.data);
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        authWindow.close();
    }, { once: true });


    const authWindow = window.open(AUTH_URL, "_blank");

    const messageData = {
        site: window.location.origin,
        data: config
    };

    const sendMessage = () => {
        if (authWindow) {
            authWindow.postMessage(messageData, AUTH_URL);
        }
    };

    // authWindow.onload = () => {
    //     console.log("authWindow.onload")
    //     sendMessage();
    // }
    //
    // console.log(authWindow)

    // // Retry sending every 500ms until the window is loaded
    const interval = setInterval(() => {
        if (authWindow && !authWindow.closed) {
            sendMessage();
        } else {
            clearInterval(interval);
        }
    }, 500);

    // Stop retrying after 5 seconds
    setTimeout(() => clearInterval(interval), 1000);
}

