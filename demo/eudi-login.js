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

const AUTH_URL = "https://your-auth-portal.com";

function login(config) {
    const authWindow = window.open(AUTH_URL, "_blank");

    authWindow.onload = () => {
        authWindow.postMessage({
            site: window.location.origin,
            data: config
        }, AUTH_URL);
    };

    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        authWindow.close();
    }, { once: true });
}

