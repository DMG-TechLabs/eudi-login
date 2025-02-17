const AUTH_URL = "http://"+window.location.hostname+":8080";

const Visibility = {
    PUBLIC: 0,
    ANONYMOUS_OPT: 1,
    ANONYMOUS: 2
};

function anonymousCompatibility(config) {
    if (config.visibility == Visibility.PUBLIC) return true;
    const disallowed = [
        config.required.HealthID,
        config.required.IBAN,
        config.required.Loyalty,
        config.required.mDL,
        config.required.MSISDN,
        config.required.PhotoId,
        config.required.PID,
        config.required.TaxNumber
    ]

    // Block PII-heavy attestations
    return (disallowed.filter(req => req == true).length == 0);
}

/**
* @typedef {Object} ConfigOptions
* @property {Object} required - Required attestations.
* @property {boolean} [required.AgeOver18] - Whether the user is over 18.
* @property {boolean} [required.HealthID] - Whether to include Health ID attestation.
* @property {boolean} [required.IBAN] - Whether to include IBAN attestation.
* @property {boolean} [required.Loyalty] - Whether to include Loyalty attestation.
* @property {boolean} [required.mDL] - Whether to include mobile Driver’s License (mDL) attestation.
* @property {boolean} [required.MSISDN] - Whether to include MSISDN (phone number) attestation.
* @property {boolean} [required.PhotoId] - Whether to include Photo ID attestation.
* @property {boolean} [required.PID] - Whether to include Personal ID (PID) attestation.
* @property {boolean} [required.PowerOfRepresentation] - Whether to include Power of Representation attestation.
* @property {boolean} [required.PseudonymDeferred] - Whether to include Pseudonym Deferred attestation.
* @property {boolean} [required.Reservation] - Whether to include Reservation attestation.
* @property {boolean} [required.TaxNumber] - Whether to include Tax Number attestation.
* @property {Visibility} visibility - The visibility setting for the configuration.
*/

/**
 * Handles the login process for EUDI authentication.
 * @function EUDILogin
 * @param {ConfigOptions} config - The configuration settings for authentication.
 * @param {string} [target=window.location.origin] - The target URL to redirect to after authentication.
 */
function EUDILogin(config, target = window.location.origin) {
    console.log(config);
    if(Object.values(config.required).filter(value => value === true).length == 0){
        console.error("Please set at least one value to true");
        return;
    }
    if(!anonymousCompatibility(config)){
        console.error("Only AgeOver18, PseydonymDeferred, PowerOfRepresentation and Reservation are compatible with anonymous visibility");
        return;
    }


    window.addEventListener("message", function(event) {
        if (event.origin !== AUTH_URL) return; // Security check
        console.log("User Data:", event.data);
        this.sessionStorage.setItem("user_data", JSON.stringify(event.data));
        if (target == window.location.origin || event.data == "Missing attestations" || event.data == "Cancelled") return;
        window.location.href = target;
    });

    const authWindow = window.open(
        AUTH_URL,
        "EUDI Login",
        "width=1024,height=720"
    );

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
    setTimeout(() => clearInterval(interval), 2500);

    window.addEventListener("beforeunload", (event) => {
        authWindow.close()
    });

}

/**
 * Transforms input attestation data into a structured Map format.
 * @function _transformData
 * @param {Array<Object>} input - The input attestation data array.
 * @returns {Map<string, Map<string, any>>} A map where keys are scope names and values are maps of attribute keys to values.
 */
function _transformData(input) {
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

    return result;
}

/**
 * Loads and transforms attestation data from session storage.
 * @function EUDILoadData
 * @returns {Map<string, Map<string, any>>} A structured map of attestation data.
 */
function EUDILoadData(){
    return _transformData(JSON.parse(sessionStorage.getItem("user_data"))[0].attestations)
}




