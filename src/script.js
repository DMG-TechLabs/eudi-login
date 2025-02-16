/** 
 * Backend proxy endpoint URL.
 * @constant {string}
 */
const PROXY = "http://localhost/php/redirect.php";

/** 
 * Presentations API endpoint.
 * @constant {string}
 */
const PRESENTATIONS_ENDPOINT = "ui/presentations";

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
 * Builds the request URL, used when polling
 * @param {string} transaction_id - The transaction identifier.
 * @returns {string} The endpoint.
 */
function buildPollingUrl(transaction_id) {
    return `${PROXY}/${PRESENTATIONS_ENDPOINT}/${transaction_id}`
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
        const request = new Request(PROXY);
        const response = await request.post(PRESENTATIONS_ENDPOINT, transactionBody);
        return response;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function main() {
    const config = new Config({
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
    })

    const requestBody = config.generateRequest();
    const transaction = await TransactionInit(requestBody);
    const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    paintQR(uri);

    const pollingUrl = buildPollingUrl(transaction.transaction_id);
    const response = await poll(pollingUrl)
    console.log(response.vp_token);
}

main();

