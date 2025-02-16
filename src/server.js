import { Config } from './modules/config.mjs'
import { MdocDecoder } from './modules/decoder.mjs'
import { poll } from './modules/polling.mjs';
import { Request } from './modules/request.mjs';
import { mapVpTokenToAttestations } from './modules/test.mjs'

// Listen for messages from the parent window
window.addEventListener("message", async function(event) {
    console.log("Received message from:", event.origin);

    // Security Check: Ensure the sender is a trusted website
    // const allowedOrigins = ["https://your-client-site.com"]; // Add more if needed
    // if (!allowedOrigins.includes(event.origin)) {
    //     console.error("Unauthorized origin:", event.origin);
    //     return;
    // }

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
    console.log(response);
    const decoded = await mapVpTokenToAttestations(response, "")
    console.log(decoded)

    window.opener.postMessage(decoded, site);

    // Close the tab
    window.close();


}, false);

//
// window.addEventListener("message", function(event) {
//     if (event.origin !== "https://your-client-site.com") return; // Security check
//
//     const { site, data } = event.data;
//     console.log("User Site:", site);
//     console.log("Custom Data:", data);
//
//     // After successful authentication
//     const userData = { id: "123", name: "John Doe", email: "john@example.com" };
//
//     // Send user data back
//     window.opener.postMessage(userData, site);
//
//     // Close the tab
//     window.close();
// });
