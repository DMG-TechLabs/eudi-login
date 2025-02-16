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
        this.settings = config
        this.scopes = this.getAttestations()
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

    async getAttestations() {
        const availableAttestations = await fetchAttestations();
        const supportedAt = availableAttestations.credential_configurations_supported;

        const attestationsFinal = Object.keys(supportedAt)
            .filter(key => key !== "eu.europa.ec.eudi.pid_jwt_vc_json")
            .map(key => {
                const { scope, claims } = supportedAt[key];
                return new Attestation({
                    localName: "",
                    scope,
                    claims: Object.keys(claims).flatMap(claimKey => Object.keys(claims[claimKey]))
                });
            });

        // Map settings to scopes for cleaner filtering
        const settingsMap = {
            "eu.europa.ec.eudi.pid.1": this.settings.PID,
            "org.iso.18013.5.1.mDL": this.settings.mDL,
            "eu.europa.ec.eudi.iban.1": this.settings.IBAN,
            "eu.europa.ec.eudi.loyalty.1": this.settings.Loyalty,
            "org.iso.23220.photoid.1": this.settings.PhotoId,
            "eu.europa.ec.eudi.pseudonym.age_over_18.1": this.settings.AgeOver18,
            "eu.europa.ec.eudi.hiid.1": this.settings.HealthID,
            "org.iso.18013.5.1.reservation": this.settings.Reservation,
            "eu.europa.ec.eudi.tax.1": this.settings.TaxNumber,
            "eu.europa.ec.eudi.por.1": this.settings.PowerOfRepresentation,
            "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint": this.settings.PseudonymDeferred
        };

        const addScopes = attestationsFinal.filter(at => settingsMap[at.scope]);

        this.scopes.push(...addScopes);
        return addScopes;
    }


    generateRequest() {
        request = {
            "type": "vp_token",
            "presentation_definition": {
                "id": "",
                "input_descriptors": [
                    
                ]
            }
        }

        request.presentation_definition.id = crypto.randomUUID()
        request.nonce = crypto.randomUUID()
        i = 0
        for (const attestation of this.scopes) {
            filds = []
            for (const claim of attestation.claims) {
                filds.push({
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

            request.presentation_definition.input_descriptors[i].constraints.fields = filds
            i++
        }

        return request
    }
}

