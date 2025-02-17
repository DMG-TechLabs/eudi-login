const AUTH_URL = "http://"+window.location.hostname;

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
    if(Object.values(config).filter(value => value === true).length == 0){
        window.alert("Please set at least one value to true");
        return;
    }


    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        this.sessionStorage.setItem("user_data", JSON.stringify(event.data));
        if (target == window.location.origin || event.data == "Missing attestations" || event.data == "Cancelled") return;
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
    const scopeConfig = {
        "eu.europa.ec.eudi.pid.1": "PID",
        "org.iso.18013.5.1.mDL": "mDL",
        "eu.europa.ec.eudi.iban.1": "IBAN",
        "eu.europa.ec.eudi.loyalty.1": "Loyalty",
        "org.iso.23220.photoid.1": "PhotoId",
        "eu.europa.ec.eudi.pseudonym.age_over_18.1": "AgeOver18",
        "eu.europa.ec.eudi.hiid.1": "HealthID",
        "org.iso.18013.5.1.reservation": "Reservation",
        "eu.europa.ec.eudi.tax.1": "TaxNumber",
        "eu.europa.ec.eudi.por.1": "PowerOfRepresentation",
        "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint": "PseudonymDeferred"
    };

    const result = new Map();

    input.forEach(item => {
        item.attributes.forEach(attr => {
            const rawScopeKey = attr.key.split(":")[0]; // Extract scope from key
            const scopeKey = scopeConfig[rawScopeKey] || rawScopeKey; // Map to predefined scope name or keep original
            const key = attr.key.split(":").slice(1).join(":"); // Extract actual key

            if (!result.has(scopeKey)) {
                result.set(scopeKey, new Map());
            }

            result.get(scopeKey).set(key, attr.value.value !== undefined ? attr.value.value : attr.value);
        });
    });

    return result;}

function EUDILoadData(){
    return transformData(JSON.parse(sessionStorage.getItem("user_data"))[0].attestations)
}

