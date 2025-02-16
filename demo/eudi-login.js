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
    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        this.localStorage.setItem("user_data", JSON.stringify(event.data));
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

