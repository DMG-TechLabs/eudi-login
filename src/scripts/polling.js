/**
 * Polls a given URL at 2-second intervals until a response is received or the maximum attempts are reached.
 *
 * @function poll
 * @param {string} url - The URL to poll for a response.
 * @returns {Promise<any>} A promise that resolves with the response data if successful, or rejects if max attempts are reached.
 *
 * @example
 * poll("https://example.com/api")
 *   .then(data => console.log("Received data:", data))
 *   .catch(error => console.error("Polling failed:", error));
 */
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
