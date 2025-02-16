const AUTH_URL = "http://localhost";

function login(config, target) {
    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        // authWindow.close();
        this.localStorage.setItem("user_data", JSON.stringify(event.data));
    }, { once: true });


    const authWindow = window.open(AUTH_URL, "_blank");

    const messageData = {
        site: target,
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

