/**
 * Global config initialized by the user
 * @var {Config}
 */
var config = null

/** 
 * Backend proxy endpoint URL.
 * @constant {string}
 */
const BACKEND_URL = "http://localhost/php/redirect.php";

/** 
 * Presentations API endpoint.
 * @constant {string}
 */
const PRESENTATIONS_ENDPOINT = "ui/presentations";

const DUMMY_BODY = {
    "type": "vp_token",
    "presentation_definition": {
        "id": "cf11c081-4337-47f7-8771-57305ce6b3a4",
        "input_descriptors": [
            {
                "id": "eu.europa.ec.eudi.pid.1",
                "name": "Person Identification Data (PID)",
                "purpose": "",
                "format": {
                    "mso_mdoc": {
                        "alg": [
                            "ES256",
                            "ES384",
                            "ES512"
                        ]
                    }
                },
                "constraints": {
                    "fields": [
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['family_name']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['given_name']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['birth_date']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['age_over_18']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['age_in_years']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['age_birth_year']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['family_name_birth']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['given_name_birth']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['birth_place']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['birth_country']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['birth_state']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['birth_city']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_address']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_country']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_state']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_city']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_postal_code']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_street']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['resident_house_number']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['gender']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['nationality']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['issuance_date']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['expiry_date']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['issuing_authority']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['document_number']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['administrative_number']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['issuing_country']"
                            ],
                            "intent_to_retain": false
                        },
                        {
                            "path": [
                                "$['eu.europa.ec.eudi.pid.1']['issuing_jurisdiction']"
                            ],
                            "intent_to_retain": false
                        }
                    ]
                }
            }
        ]
    },
    "nonce": "8117cc1f-57f3-4b69-8cb3-94507c32a2cd"
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
    return decodeHTMLEntities(decodeURIComponent(uri))
}

/**
 * Builds a QR code URI for EUDI OpenID.
 * @param {string} client_id - The client identifier.
 * @param {string} request_uri - The request URI.
 * @returns {string} The formatted EUDI OpenID URL.
 */
function buildQRUri(client_id, request_uri) {
    return decodeAll(`eudi-openid4vp://?client_id=${client_id}&request_uri=${request_uri}`);
}

/**
 * Paints the QR code in the HTML
 * @param {string} uri - The QR code uri
 */
function paintQR(uri) {
    new QRCode(document.getElementById("qrcode"), {
        text: uri,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
}

/**
 * Initializes the transaction.
 * @async
 * @function TransactionInit
 * @returns {Promise<any>} - Resolves with the response data or null if an error occurs.
 */
async function TransactionInit(transactionBody) {
    try {
        const request = new Request(BACKEND_URL);
        const response = await request.post(PRESENTATIONS_ENDPOINT, transactionBody);
        return response;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function main() {
    await getAttestations(new Config({
        AgeOver18: false,
        HealthID: false,
        IBAN: false,
        Loyalty: false,
        mDL: false,
        MSISDN: false,
        PhotoId: false,
        PID: true,
        PowerOfRepresentation: false,
        PseudonymDeferred: false,
        Reservation: false,
        TaxNumber: false
    }))

    const data = await TransactionInit(generateRequest());
    // console.log(data)
    // console.log(data.client_id)
    // console.log(data.request_uri)
    // console.log(data.transaction_id)
    // console.log(data.presentation_id)
    const uri = buildQRUri(data.client_id, data.request_uri);
    paintQR(uri);
   

}

main();

