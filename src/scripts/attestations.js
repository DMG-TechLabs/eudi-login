const ATTESTATIONS_ENDPOINT = "https://issuer.eudiw.dev/.well-known/openid-credential-issuer"

const request = new Request(ATTESTATIONS_ENDPOINT)
const response = await request.get();

const data = await response;

