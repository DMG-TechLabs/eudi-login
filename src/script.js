/** 
 * Backend proxy endpoint URL.
 * @constant {string}
 */
const BACKEND_URL = "http://localhost:8080/proxy.php";

/** 
 * Presentations API endpoint.
 * @constant {string}
 */
const PRESENTATIONS_ENDPOINT = "ui/presentations";

const DUMMY_BODY = {
    "type": "vp_token",
    "presentation_definition": {
        "id": "853c7aa0-d6f9-451a-b97b-1d54d78f2ea3",
        "input_descriptors": [
            {
                "id": "eu.europa.ec.eudi.pid.1",
                "name": "Person Identification Data (PID)",
                "purpose": "",
                "format": {
                    "mso_mdoc": {
                        "alg": ["ES256", "ES384", "ES512"]
                    }
                },
                "constraints": {
                    "fields": [
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['family_name']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['given_name']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['birth_date']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['age_over_18']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['age_in_years']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['age_birth_year']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['family_name_birth']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['given_name_birth']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['birth_place']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['birth_country']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['birth_state']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['birth_city']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_address']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_country']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_state']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_city']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_postal_code']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_street']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['resident_house_number']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['gender']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['nationality']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['issuance_date']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['expiry_date']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['issuing_authority']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['document_number']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['administrative_number']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['issuing_country']"], "intent_to_retain": false },
                        { "path": ["$['eu.europa.ec.eudi.pid.1']['issuing_jurisdiction']"], "intent_to_retain": false }
                    ]
                }
            }
        ]
    },
    "nonce": "717d5d1b-281c-4dee-aab4-044848c419aa"
};

/**
 * Decodes HTML Entities like `&amp;`
 * @param {string} text
 * @returns {string} the decoded text
 */
function decodeHTMLEntities(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent;
}

/**
 * Decodes URI characters and HTML entities back to their ascii counterparts
 * @param {string} uri
 * @returns {string} the decoded text
 */
function decodeAll(uri) {
    return decodeHTMLEntities(decodeUri(uri))
}

/**
 * Builds a QR code URL for EUDI OpenID.
 * @param {string} client_id - The client identifier.
 * @param {string} request_uri - The request URI.
 * @returns {string} The formatted EUDI OpenID URL.
 */
function buildQRUrl(client_id, request_uri) {
    return decodeAll(`eudi-openid4vp://?${client_id}&${request_uri}`);
}

/**
 * Initializes the transaction.
 * @async
 * @function TransactionInit
 * @returns {Promise<void>} - Logs data to console or catches errors.
 */
async function TransactionInit() {
    try {
        const request = new Request(BACKEND_URL)
        const response = request.post(PRESENTATIONS_ENDPOINT, JSON.stringify(DUMMY_BODY), {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Content-Type': 'application/json',
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

TransactionInit();
