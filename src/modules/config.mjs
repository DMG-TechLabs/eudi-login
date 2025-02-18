import { Request } from "./request.mjs";
import { ATTESTATIONS_ENDPOINT } from './settings.mjs';

const Visibility = {
    PUBLIC: 0,
    ANONYMOUS_OPT: 1,
    ANONYMOUS: 2
};

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

export const EMPTY_CONFIG = {
    required: {
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
    },
    visibility: Visibility.PUBLIC
};

/**
 * Represents the configuration of the requested attestations.
 */
export class Config {

    /**
    * @typedef {Object} ConfigOptions
    * @property {Object} required - Required attestations.
    * @property {boolean} [required.AgeOver18] - Whether the user is over 18.
    * @property {boolean} [required.HealthID] - Whether to include Health ID attestation.
    * @property {boolean} [required.IBAN] - Whether to include IBAN attestation.
    * @property {boolean} [required.Loyalty] - Whether to include Loyalty attestation.
    * @property {boolean} [required.mDL] - Whether to include mobile Driver’s License (mDL) attestation.
    * @property {boolean} [required.MSISDN] - Whether to include MSISDN (phone number) attestation.
    * @property {boolean} [required.PhotoId] - Whether to include Photo ID attestation.
    * @property {boolean} [required.PID] - Whether to include Personal ID (PID) attestation.
    * @property {boolean} [required.PowerOfRepresentation] - Whether to include Power of Representation attestation.
    * @property {boolean} [required.PseudonymDeferred] - Whether to include Pseudonym Deferred attestation.
    * @property {boolean} [required.Reservation] - Whether to include Reservation attestation.
    * @property {boolean} [required.TaxNumber] - Whether to include Tax Number attestation.
    * @property {Visibility} visibility - The visibility setting for the configuration.
    */

    /**
     * Creates a Config instance.
     * @constructor
     * @param {Object} [config] - Configuration settings.
     */
    constructor(config = EMPTY_CONFIG){
        this.required = config.required;
        this.visibility = config.visibility
        this.scopes = [];
        this.request = null;
    }

    countActive() {
        return Object.values(this.required).filter(value => value === true).length;
    }

    // FIXME: Better way to check the number of attestations returned
    // We don't handle the case of multiple enveloped attestations
    /**
     * Validates whether the response contains all the necessary attestations
     * @function validate
     * @param {Array} decoded
     * @returns boolean
     */
    validate(decoded) {
        const count = this.countActive();
        let expected;
        const kind = decoded[0].kind;
        if(kind == "enveloped")
            expected = decoded[0].attestations.length
        else if(kind == "single")
            expected = decoded.length

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
            if ((attestation.scope == "eu.europa.ec.eudi.pid.1") && this.required.PID) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.18013.5.1.mDL" && this.required.mDL) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.iban.1" && this.required.IBAN) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.loyalty.1" && this.required.Loyalty) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.23220.photoid.1" && this.required.PhotoId) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.1" && this.required.AgeOver18) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.hiid.1" && this.required.HealthID) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "org.iso.18013.5.1.reservation" && this.required.Reservation) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.tax.1" && this.required.TaxNumber) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.por.1" && this.required.PowerOfRepresentation) {
                this.scopes.push(attestation)
            }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint" && this.required.PseudonymDeferred) {
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
        function generateUUID() {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);

            array[6] = (array[6] & 0x0f) | 0x40; // UUID version 4
            array[8] = (array[8] & 0x3f) | 0x80; // Variant 1

            return [...array]
                .map((b, _i) => b.toString(16).padStart(2, "0"))
                .join("")
                .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
        }

        request.presentation_definition.id = generateUUID();
        request.nonce = generateUUID();

        const removalMap = {
            "eu.europa.ec.eudi.por.1": ["legal_name", "legal_person_identifier"],
            "eu.europa.ec.eudi.pseudonym.age_over_18.1": ["issuing_country", "user_pseudonym"]
        };

        for (const [index, attestation] of this.scopes.entries()) {
            const fields = attestation.claims
                .filter(claim =>
                    !(this.visibility === Visibility.ANONYMOUS &&
                        removalMap[attestation.scope]?.includes(claim))
                )
                .map(claim => ({
                    path: [`$['${attestation.scope}']['${claim}']`],
                    intent_to_retain: false
                }));

            request.presentation_definition.input_descriptors.push({
                id: attestation.scope,
                name: "",
                purpose: "",
                format: {
                    mso_mdoc: {
                        alg: ["ES256"]
                    }
                },
                constraints: { fields: [] }
            });

            request.presentation_definition.input_descriptors[index].constraints.fields = fields;
        }

        return request
    }
}

