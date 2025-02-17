const AUTH_URL = "http://localhost";

/**
* @typedef {Object} ConfigOptions
* @property {boolean} [AgeOver18] - Whether the user is over 18.
* @property {boolean} [HealthID] - Whether to include Health ID attestation.
* @property {boolean} [IBAN] - Whether to include IBAN attestation.
* @property {boolean} [Loyalty] - Whether to include Loyalty attestation.
* @property {boolean} [mDL] - Whether to include mobile Driver’s License (mDL) attestation.
* @property {boolean} [MSISDN] - Whether to include MSISDN (phone number) attestation.
* @property {boolean} [PhotoId] - Whether to include Photo ID attestation.
* @property {boolean} [PID] - Whether to include Personal ID (PID) attestation.
* @property {boolean} [PowerOfRepresentation] - Whether to include Power of Representation attestation.
* @property {boolean} [PseudonymDeferred] - Whether to include Pseudonym Deferred attestation.
* @property {boolean} [Reservation] - Whether to include Reservation attestation.
* @property {boolean} [TaxNumber] - Whether to include Tax Number attestation.
*/

/**
 * Handles the login process for EUDI authentication.
 * @function EUDILogin
 * @param {ConfigOptions} config - The configuration settings for authentication.
 * @param {string} [target=window.location.origin] - The target URL to redirect to after authentication.
 */
function EUDILogin(config, target = window.location.origin) {
    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        this.sessionStorage.setItem("user_data", JSON.stringify(event.data));
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

    // Stop retrying after 1 seconds
    setTimeout(() => clearInterval(interval), 1000);
}

function transformData(input) {
    const result = {};

    input.forEach(item => {
        item.attributes.forEach(attr => {
            const scopeKey = attr.key.split(":")[0]; // Extract scope from key
            const key = attr.key.split(":").slice(1).join(":"); // Extract actual key

            if (!result[scopeKey]) {
                result[scopeKey] = {};
            }

            result[scopeKey][key] = attr.value.value !== undefined ? attr.value.value : attr.value;
        });
    });

    return result;
}

function EUDILoadData(){
    return transformData(JSON.parse(sessionStorage.getItem("user_data"))[0].attestations)
}

