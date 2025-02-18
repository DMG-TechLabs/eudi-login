import { Config } from './modules/config.mjs';
import { MdocDecoder } from './modules/decoder.mjs';
import { poll } from './modules/polling.mjs';
import { Request } from './modules/request.mjs';
import { PRESENTATIONS_ENDPOINT, PROXY } from './modules/settings.mjs'

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
 * @function transactionInit
 * @param {json} transactionBody
 * @returns {Promise<any>} - Resolves with the response data or null if an error occurs.
 */
async function transactionInit(transactionBody) {
    try {
        const request = new Request(PROXY);
        const response = await request.post(PRESENTATIONS_ENDPOINT, transactionBody);
        return response;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // List of common mobile devices and user agents
    const mobileAgents = [
        'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Opera Mini', 'Windows Phone', 'webOS',
        'Mobile', 'Silk', 'Kindle', 'Samsung', 'SonyEricsson', 'Mobi'
    ];

    // Check if the user agent contains any of the mobile device strings
    for (let i = 0; i < mobileAgents.length; i++) {
        if (userAgent.indexOf(mobileAgents[i]) > -1) {
            return true;
        }
    }

    return false;
}

/**
 * Main function to initialize and validate the authentication process (ONLY FOR DEVELOPMENT).
 * @async
 * @function main
 * @returns {Promise<void>}
 */
export async function main() {
    const config = {
        required: {
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
        },
        visibility: 0
    }

    const decoded = await run(config);

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
    sessionStorage.setItem('config', JSON.stringify(conf));

    const transaction = await transactionInit(config.request);
    const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    if(isMobileDevice()) {
        sessionStorage.setItem("app_uri", uri);
    } else {
        document.getElementById("open-wallet-button").disabled = true;
        document.getElementById("open-wallet-button").style.background = "#ccc";
    }

    paintQR(uri);

    const pollingUrl = buildPollingUrl(transaction.transaction_id);
    const response = await poll(pollingUrl)
    const decoded = await new MdocDecoder().run(response)

    return {data: decoded, conf: config}
}

/**
 * Starts the authentication process by retrieving stored configuration and validating data.
 * @async
 * @function start
 * @returns {Promise<void>}
 */
export async function start(){
    const site = sessionStorage.getItem('site');
    const data = JSON.parse(sessionStorage.getItem('response'));
    const result = await run(data);
    console.log(result)

    const validData = result.conf.validate(result.data);
    if(validData){
        window.opener.postMessage(result.data, site);
        // cleanLocalStorage();
        window.close();
    }
    else{
        console.error("Missing attestations")
        window.opener.postMessage("Missing attestations", site);
        // cleanLocalStorage();
        document.getElementById('dialog').style.display = 'flex';
    }
}


document.addEventListener("DOMContentLoaded", () => {

    window.addEventListener("message", async function(event) {

        // Extract the received data
        const { site, data } = event.data;

        if (site !== event.origin) {
            console.error("Invalid site:", site);
            return;
        }
        this.sessionStorage.setItem('site', site);
        this.sessionStorage.setItem('response', JSON.stringify(data));

        showDivs(data);
    }, false);

});


window.main = main;
window.run = run;
window.start = start;
