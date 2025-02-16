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


export function showDivs(config) {
            const container = document.getElementById("documents");
        container.innerHTML = "";

            const fieldNames = {
                AgeOver18: "Age Over 18",
                HealthID: "Health ID",
                IBAN: "Bank Account (IBAN)",
                Loyalty: "Loyalty Card",
                mDL: "Mobile Driver's License",
                MSISDN: "Phone Number",
                PhotoId: "Photo ID",
             PID: "Personal ID",
                PowerOfRepresentation: "Power of Representation",
                PseudonymDeferred: "Pseudonym Deferred",
                Reservation: "Reservation",
                TaxNumber: "Tax Number"
            };

            Object.entries(config).forEach(([key, value]) => {
                if (value == true) {
                    let div = document.createElement("div");
                    div.className = "document-box";
                    div.textContent = `${fieldNames[key]}`;
                    div.style.display = "block";
                    container.appendChild(div);
                }
            });
}


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
    // await config.init();
    // localStorage.setItem('config', JSON.stringify(config.settings));
    //
    // const transaction = await TransactionInit(config.request);
    // const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    // paintQR(uri);
    //
    // const pollingUrl = buildPollingUrl(transaction.transaction_id);
    // const response = await poll(pollingUrl)
    // const decoded = await new MdocDecoder().run(response)
    const decoded = await run(config);
    console.log(decoded)

    const success = config.validate(decoded);
    console.log(success);
}

export async function run(conf) {
    // showDivs(conf);
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

// main();
document.addEventListener("DOMContentLoaded", () => {

window.addEventListener("message", async function(event) {
        console.log("Received message from:", event.origin);

        // Extract the received data
        const { site, data } = event.data;
        console.log("User's Site:", site);
        console.log("Received Data:", data);

        if (site !== event.origin) {
            console.error("Invalid site:", site);
            return;
        }
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
window.showDivs = showDivs;
