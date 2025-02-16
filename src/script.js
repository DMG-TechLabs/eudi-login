import { Config } from './modules/config.mjs' 
import { Decoder } from './modules/decoder.mjs'
import { poll } from './modules/polling.mjs';
import { Request } from './modules/request.mjs';

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
 * @function decodeHTMLEntities
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
 * @function decodeAll
 * @param {string} uri
 * @returns {string} the decoded text
 */
function decodeAll(uri) {
    return decodeHTMLEntities(decodeURIComponent(uri))
}

/**
 * Builds a QR code URI for EUDI OpenID.
 * @function buildQRUri
 * @param {string} client_id - The client identifier.
 * @param {string} request_uri - The request URI.
 * @returns {string} The formatted EUDI OpenID URL.
 */
function buildQRUri(client_id, request_uri) {
    return decodeAll(`eudi-openid4vp://?client_id=${client_id}&request_uri=${request_uri}`);
}

/**
 * Builds the request URL, used when polling
 * @function buildPollingUrl
 * @param {string} transaction_id - The transaction identifier.
 * @returns {string} The endpoint.
 */
function buildPollingUrl(transaction_id) {
    return `${PROXY}/${PRESENTATIONS_ENDPOINT}/${transaction_id}`
}

/**
 * Paints the QR code in the HTML
 * @function paintQR
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
 * @param {json} transactionBody 
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
    await config.init();

    const transaction = await TransactionInit(config.request);
    const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    paintQR(uri);

    const pollingUrl = buildPollingUrl(transaction.transaction_id);
    const response = await poll(pollingUrl)
    console.log(response);
    const decoded = await new Decoder().decode(response.vp_token[0]);
    console.log(decoded)
}

main();
//
// // Listen for messages from the parent window
// window.addEventListener("message", async function(event) {
//     console.log("Received message from:", event.origin);
//
//     // Security Check: Ensure the sender is a trusted website
//     // const allowedOrigins = ["https://your-client-site.com"]; // Add more if needed
//     // if (!allowedOrigins.includes(event.origin)) {
//     //     console.error("Unauthorized origin:", event.origin);
//     //     return;
//     // }
//
//     // Extract the received data
//     const { site, data } = event.data;
//     console.log("User's Site:", site);
//     console.log("Received Data:", data);
//
//     if (site != event.origin) {
//         console.error("Invalid site:", site);
//         return;
//     }
//
//     const config = new Config(data);
//     config.init();
//
//     const transaction = await TransactionInit(config.request);
//     const uri = buildQRUri(transaction.client_id, transaction.request_uri);
//     paintQR(uri);
//     const pollingUrl = buildPollingUrl(transaction.transaction_id);
//     const response = await poll(pollingUrl)
//     console.log(response);
//     
//     window.opener.postMessage(response, site);
//
//     // Close the tab
//     window.close();
//
//
// }, false);
//
// //
// // window.addEventListener("message", function(event) {
// //     if (event.origin !== "https://your-client-site.com") return; // Security check
// //
// //     const { site, data } = event.data;
// //     console.log("User Site:", site);
// //     console.log("Custom Data:", data);
// //
// //     // After successful authentication
// //     const userData = { id: "123", name: "John Doe", email: "john@example.com" };
// //
// //     // Send user data back
// //     window.opener.postMessage(userData, site);
// //
// //     // Close the tab
// //     window.close();
// // });
