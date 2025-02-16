function poll(url) {
    let attempts = 0;
    const maxAttempts = 60;
    let stopPolling = false;

    return new Promise((resolve, reject) => {
        function fetchWalletResponse() {
            if (stopPolling || attempts >= maxAttempts) {
                reject(new Error("Max attempts reached"));
                return;
            }

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        stopPolling = true;
                        resolve(data);
                    }
                })
                .catch(_error => console.log("Waiting for confirmation..."));

            attempts++;
            if (!stopPolling) {
                setTimeout(fetchWalletResponse, 2000);
            }
        }

        fetchWalletResponse();
    });
}
