const AUTH_URL = "http://localhost";


function EUDILogin(config, target = window.location.origin) {
    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        // authWindow.close();
        this.localStorage.setItem("user_data", JSON.stringify(event.data));
        if (target == window.location.origin) return;
        window.location.href = target;

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

