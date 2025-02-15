const ATTESTATIONS_ENDPOINT = "http://localhost/php/redirect.php/issuers"

async function FetchAttestations() {
    try{
        const request = new Request(ATTESTATIONS_ENDPOINT)
        const response = await request.get();
        return response;
    } catch(err) {
        console.error('Error:', err);
        return null;
    }
}

var attestations = null;


async function buildBody(config) {
    const data = await FetchAttestations();
    console.log(data);

    // ...
}

buildBody(null)
