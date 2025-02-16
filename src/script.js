import { Config } from './modules/config.mjs';
import { MdocDecoder } from './modules/decoder.mjs';
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
    if(uri == null || uri == undefined || uri == "") return;
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

/**
 * Main function to initialize and validate the authentication process (ONLY FOR DEVELOPMENT).
 * @async
 * @function main
 * @returns {Promise<void>}
 */
export async function main() {
    const config = {
        AgeOver18: true,
        HealthID: true,
        IBAN: true,
        Loyalty: true,
        mDL: true,
        MSISDN: false,
        PhotoId: true,
        PID: true,
        PowerOfRepresentation: true,
        PseudonymDeferred: true,
        Reservation: true,
        TaxNumber: true
    }

    const decoded = await run(config);
    console.log(decoded)

    const success = config.validate(decoded);
    console.log(success);
}

/**
 * Runs the authentication process based on the provided configuration.
 * @async
 * @function run
 * @param {ConfigOptions} conf - The configuration settings.
 * @returns {Promise<{data: Object, conf: Config} | null>} The decoded data and configuration, or null if no attestations are active.
 */
export async function run(conf) {
    const config = new Config(conf)
    if(config.countActive() == 0) return null;
    await config.init();
    localStorage.setItem('config', JSON.stringify(config.settings));


    const transaction = await TransactionInit(config.request);
    const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    paintQR(uri);

    const pollingUrl = buildPollingUrl(transaction.transaction_id);
    const response = await poll(pollingUrl)
    const decoded = await new MdocDecoder().run(response)
    console.log(decoded)

    return {data: decoded, conf: config}
}

/**
 * Starts the authentication process by retrieving stored configuration and validating data.
 * @async
 * @function start
 * @returns {Promise<void>}
 */
export async function start(){
    const site = localStorage.getItem('site');
    const data = JSON.parse(localStorage.getItem('config'));
    const result = await run(data);
    console.log(result)

    const validData = result.conf.validate(result.data);
    if(validData){
        console.log(site)
        window.opener.postMessage(result.data, site);
        window.close();
    }
    else{
        window.opener.postMessage("Missing attestations", site);
        window.alert("Not all requied files available. Please try again.")
    }
}


// main();
document.addEventListener("DOMContentLoaded", () => {

    window.addEventListener("message", async function(event) {
        console.log("Received message from:", event.origin);

        // Extract the received data
        const { site, data } = event.data;
        console.log("User's Site:", site);
        console.log("Received Data:", data);

        // if (site !== event.origin) {
        //     console.error("Invalid site:", site);
        //     return;
        // }
        localStorage.setItem('site', site);
        localStorage.setItem('config', JSON.stringify(data));

        showDivs(data);
        // const config = new Config(data);
        // config.init();
        //
        // const transaction = await TransactionInit(config.request);
        // const uri = buildQRUri(transaction.client_id, transaction.request_uri);
        // paintQR(uri);
        //
        // const pollingUrl = buildPollingUrl(transaction.transaction_id);
        // const response = await poll(pollingUrl);
        // const decoded = await run(data);
        // console.log(decoded)
        // window.opener.postMessage(decoded, site);
        // window.close();
    }, false);
});

window.main = main;
window.run = run;
window.start = start;
