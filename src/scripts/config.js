const ATTESTATIONS_ENDPOINT = "http://localhost/php/redirect.php/issuers"

class Attestation {
    constructor(data = {
        localName: "",
        scope: "",
        claims: []
    }){
        this.data = data
    }
}


class Config {
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

    async init() {
        await this.getAttestations();
        this.request = this.generateRequest();
    }

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

