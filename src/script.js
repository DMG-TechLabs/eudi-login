const BACKEND_ENDPOINT = "https://verifier_backend.dev.eudiw.dev"
const PRESENTATIONS_ENDPOINT = "ui/presentations"

const express = require('express');
const request = require('request');
const app = express();

app.use('/backend', (req, res) => {
  const url = BACKEND_ENDPOINT + req.url;
  req.pipe(request({ url, headers: { origin: null } })).pipe(res);
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));


const DUMMY_BODY = {"type":"vp_token","presentation_definition":{"id":"853c7aa0-d6f9-451a-b97b-1d54d78f2ea3","input_descriptors":[{"id":"eu.europa.ec.eudi.pid.1","name":"Person Identification Data (PID)","purpose":"","format":{"mso_mdoc":{"alg":["ES256","ES384","ES512"]}},"constraints":{"fields":[{"path":["$['eu.europa.ec.eudi.pid.1']['family_name']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['given_name']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['birth_date']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['age_over_18']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['age_in_years']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['age_birth_year']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['family_name_birth']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['given_name_birth']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['birth_place']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['birth_country']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['birth_state']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['birth_city']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_address']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_country']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_state']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_city']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_postal_code']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_street']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['resident_house_number']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['gender']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['nationality']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['issuance_date']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['expiry_date']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['issuing_authority']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['document_number']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['administrative_number']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['issuing_country']"],"intent_to_retain":false},{"path":["$['eu.europa.ec.eudi.pid.1']['issuing_jurisdiction']"],"intent_to_retain":false}]}}]},"nonce":"717d5d1b-281c-4dee-aab4-044848c419aa"}

function buildQRUrl(client_id, request_uri) {
    return `/backend/?${client_id}&${request_uri}`
}

async function fetchData() {
    try {
        const response = await fetch(`/backend/${PRESENTATIONS_ENDPOINT}` , {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Content-Type': 'application/json',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Priority': 'u=0',
                'Cookie': '_hello_world_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYR1NQX2JHYWxCWkRPbTRzMGNJdHkxc1NP.FFuJVDk47DZes8vxl0ai6oVf2qOKJsTpSqC75bupcrE; request_logger=SFMyNTY.g2gDbQAAAARoRDk1bgYAKxqNVZMBYgABUYA.sYtbw_-pNm0h6qzSuHvVtKPFXogSgVrwhHLL7uvf3Mw'
            },
            body: JSON.stringify(
                DUMMY_BODY     
            )
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchData();

