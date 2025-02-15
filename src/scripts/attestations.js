const ATTESTATIONS_ENDPOINT = "http://localhost/php/redirect.php/issuers"

async function FetchAttestations() {
    try{
        const request = new Request(ATTESTATIONS_ENDPOINT)
        const response = await request.get();
        return response;
    } catch(err) {
        console.error(err);
    }
}

var attestations = null;

async function loadAttestations() {
    attestations = await FetchAttestations();
}

loadAttestations();



