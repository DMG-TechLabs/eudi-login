import { Config } from './modules/config.mjs'
import { poll } from './modules/polling.mjs';

// Listen for messages from the parent window
window.addEventListener("message", async function(event) {
    console.log("Received message from:", event.origin);

    // Extract the received data
    const { site, data } = event.data;
    console.log("User's Site:", site);
    console.log("Received Data:", data);

    if (site != event.origin) {
        console.error("Invalid site:", site);
        return;
    }

    const config = new Config(data);
    config.init();

    const transaction = await TransactionInit(config.request);
    const uri = buildQRUri(transaction.client_id, transaction.request_uri);
    paintQR(uri);

    const pollingUrl = buildPollingUrl(transaction.transaction_id);
    const response = await poll(pollingUrl)
    const decoded = await new MdocDecoder().run(response)


    window.opener.postMessage(decoded, site);

    window.close();


}, false);
