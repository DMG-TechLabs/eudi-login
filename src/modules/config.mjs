import { Request } from "./request.mjs";

/**
 * Endpoint for fetching attestations.
 * @constant {string}
 */
const ATTESTATIONS_ENDPOINT = "http://localhost/php/redirect.php/issuers"

/**
 * Represents an attestation.
 */
class Attestation {
    /**
     * Creates an Attestation instance.
     * @param {Object} [data]
     * @param {string} [data.localName] - The local name of the attestation.
     * @param {string} [data.scope] - The scope of the attestation.
     * @param {string[]} [data.claims] - The claims associated with the attestation.
     */
    constructor(data = {
        localName: "",
        scope: "",
        claims: []
    }){
        this.data = data
    }
}

/**
 * Represents the configuration of the requested attestations.
 */
export class Config {
    /**
    * @typedef {Object} ConfigOptions
    * @property {boolean} [AgeOver18=false] - Whether the user is over 18.
    * @property {boolean} [HealthID=false] - Whether to include Health ID attestation.
    * @property {boolean} [IBAN=false] - Whether to include IBAN attestation.
    * @property {boolean} [Loyalty=false] - Whether to include Loyalty attestation.
    * @property {boolean} [mDL=false] - Whether to include mobile Driver’s License (mDL) attestation.
    * @property {boolean} [MSISDN=false] - Whether to include MSISDN (phone number) attestation.
    * @property {boolean} [PhotoId=false] - Whether to include Photo ID attestation.
    * @property {boolean} [PID=false] - Whether to include Personal ID (PID) attestation.
    * @property {boolean} [PowerOfRepresentation=false] - Whether to include Power of Representation attestation.
    * @property {boolean} [PseudonymDeferred=false] - Whether to include Pseudonym Deferred attestation.
    * @property {boolean} [Reservation=false] - Whether to include Reservation attestation.
    * @property {boolean} [TaxNumber=false] - Whether to include Tax Number attestation.
    */

    /**
     * Creates a Config instance.
     * @constructor
     * @param {Object} [config] - Configuration settings.
     */
    constructor(config = {
        AgeOver18: false,
        HealthID: false,
        IBAN: false,
        Loyalty: false,
        mDL: false,
        MSISDN: false,
        PhotoId: false,
        PID: false,
        PowerOfRepresentation: false,
        PseudonymDeferred: false,
        Reservation: false,
        TaxNumber: false
        }
    ){
        this.settings = config;
        this.scopes = [];
        this.request = null;
    }

    validate(decoded) {
        const count = Object.values(this.settings).filter(value => value === true).length;
        const expected = decoded[0].attestations.length

        return count == expected;
    }

    /**
     * Initializes the configuration by fetching attestations and generating a request.
     * @function init
     */
    async init() {
        await this.getAttestations();
        this.request = this.generateRequest();
    }

    /**
     * Fetches available attestations from the endpoint.
     * @function fetchAttestations
     * @returns {Promise<Object|null>} The fetched attestations or null in case of error.
     */
    async fetchAttestations() {
        try{
            const request = new Request(ATTESTATIONS_ENDPOINT)
            const response = await request.get();
            return response;
        } catch(err) {
            console.error('Error:', err);
            return null;
        }
    }

    /**
     * Retrieves and processes available attestations based on the configuration settings.
     * @function getAttestations
     */
    async getAttestations(){
        const attestationsFinal = []
        const availableAttestations = await this.fetchAttestations()
        const supportedAt = availableAttestations.credential_configurations_supported

        for (const key in supportedAt) {
            if (supportedAt.hasOwnProperty(key) && key != "eu.europa.ec.eudi.pid_jwt_vc_json") {
                var at = new Attestation({
                    localName: "",
                    scope: "",
                    claims: []
                })
                at.scope = supportedAt[key].scope

                at.localName = supportedAt[key].display[0].name
                const atClaims = []
                const claims = supportedAt[key].claims;
                for (const claimsKey in claims) {
                    if (claims.hasOwnProperty(claimsKey)) {
                        const claimsValue = supportedAt[key].claims[claimsKey]
                        for (const claimsValueKey in claimsValue) {
                            if (claimsValue.hasOwnProperty(claimsValueKey)) {
                                atClaims.push(claimsValueKey)
                            }
                        }
                    }
                }
                at.claims = atClaims

                attestationsFinal.push(at)
            }
        }

        for (const attestation of attestationsFinal) {
            if ((attestation.scope == "eu.europa.ec.eudi.pid.1") && this.settings.PID) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.18013.5.1.mDL" && this.settings.mDL) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.iban.1" && this.settings.IBAN) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.loyalty.1" && this.settings.Loyalty) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.23220.photoid.1" && this.settings.PhotoId) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.1" && this.settings.AgeOver18) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.hiid.1" && this.settings.HealthID) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.18013.5.1.reservation" && this.settings.Reservation) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.tax.1" && this.settings.TaxNumber) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.por.1" && this.settings.PowerOfRepresentation) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint" && this.settings.PseudonymDeferred) {
                this.scopes.push(attestation)
            }
        }
    }

    /**
     * Generates a request based on the configured attestations.
     * @function generateRequest
     * @returns {JSON} The generated request.
     */
    generateRequest() {
        const request = {
            "type": "vp_token",
            "presentation_definition": {
                "id": "",
                "input_descriptors": [

                ]
            }
        }

        request.presentation_definition.id = crypto.randomUUID()
        request.nonce = crypto.randomUUID()
        let i = 0
        for (const attestation of this.scopes) {
            const fields = []
            for (const claim of attestation.claims) {
                fields.push({
                    "path": ["$['"+attestation.scope+"']['"+claim+"']"],
                    "intent_to_retain": false
                })
            }

            request.presentation_definition.input_descriptors.push({
                "id": attestation.scope,
                "name": "",
                "purpose": "",
                "format": {
                    "mso_mdoc": {
                        "alg": [
                            "ES256"
                        ]
                    }
                },
                "constraints": {
                    "fields": []
                }
            })

            request.presentation_definition.input_descriptors[i].constraints.fields = fields
            i++
        }

        return request
    }
}

