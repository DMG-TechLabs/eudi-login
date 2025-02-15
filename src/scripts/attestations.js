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

const requestTemplate = {
    "type": "vp_token",
    "presentation_definition": {
        "id": "",
        "input_descriptors": [
            
        ]

    }
}


class Attestation {
    constructor(data = {
        localName: "",
        scope: "",
        claims: []
    }){
        this.data = data
    }
}

// pattestationsFinal = []
//
//
// availableAttestations = FetchAttestations()
// supported = availableAttestations.credential_configurations_supported
// for (const supportedAttestation of supported) {
//     claims = supportedAttestation.claims
//     localClaims = []
//     for (const claim of claims) {
//         localClaims.push(claim[0][0])
//     }
//
//     attestationsFinal.push(new Attestation({
//         localName: "",
//         scope: supportedAttestation.scope,
//         claims: localClaims
//     }))
//     console.log(supportedAttestation.scope)
// 

addScopes = []
// var sup 
async function getAttestations(config){
    attestationsFinal = []
    availableAttestations = await FetchAttestations()
    supportedAt = availableAttestations.credential_configurations_supported
    // sup = supported
    console.log(supportedAt)
    // Object.entries(supportedAt).forEach(([key, supportedAt]) => {
        // claims = supportedAttestation.claims
        // console.log(claims)

    for (let key in supportedAt) {
        if (supportedAt.hasOwnProperty(key) && key != "eu.europa.ec.eudi.pid_jwt_vc_json") {
            var at = new Attestation({
                localName: "",
                scope: "", 
                claims: []
            })
            at.scope = supportedAt[key].scope
            var atClaims = []
            // console.log(supportedAt[key].scope)
            // console.log(supportedAt[key].claims)
            const claims = supportedAt[key].claims;
            for (let claimsKey in claims) {
                if (claims.hasOwnProperty(claimsKey)) {
                    // console.log(supportedAt[key].claims[claimsKey])
                    claimsValue = supportedAt[key].claims[claimsKey]
                    for (let claimsValueKey in claimsValue) {
                        if (claimsValue.hasOwnProperty(claimsValueKey)) {
                            atClaims.push(claimsValueKey)
                            // console.log(claimsValueKey)
                        }
                    }
                }
            }
            at.claims = atClaims

            attestationsFinal.push(at)
            // console.log(at.scope)
        }
        console.log("--------------------------------------")
    }

    console.log(attestationsFinal)

            // }
    // for (const supported in supportedAt) {
    // Object.entries(supportedAt).forEach(([key, supportedAttestation]) => {
    //     supportedAttestation = availableAttestations.credential_configurations_supported[supported]
    //     claims = supportedAttestation.claims
    //     console.log(claims)
    //     localClaims = []
    //     for (const claim of claims) {
    //         localClaims.push(claim[0][0])
    //     }
    //
    //     attestationsFinal.push(new Attestation({
    //         localName: "",
    //         scope: supportedAttestation.scope,
    //         claims: localClaims
    //     }))
    //     console.log(supportedAttestation.scope)
    // }
    //
    //
    console.log(config)
    for (const attestation of attestationsFinal) {
        console.log(attestation.scope)
        addScopes.push(attestation)
        // if ((attestation.scope == "eu.europa.ec.eudi.pid.1") && config.PID == true) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "org.iso.18013.5.1.mDL" && config.mDL) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.iban.1" && config.IBAN) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.loyalty.1" && config.Loyalty) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "org.iso.23220.photoid.1" && config.PhotoId) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.1" && config.AgeOver18) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.hiid.1" && config.HealthID) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "org.iso.18013.5.1.reservation" && config.Reservation) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.tax.1" && config.TaxNumber) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.por.1" && config.PowerOfRepresentation) {
        //     addScopes.push(attestation)
        // }else if (attestation.scope == "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint" && config.PseudonymDeferred) {
        //     addScopes.push(attestation)
        // }
    }

    console.log(addScopes)
    return addScopes
    //
}


// for (const attestation of attestationsFinal) {
//     if (attestation.scope === "eu.europa.ec.eudi.pid.1" && config.PID) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "org.iso.18013.5.1.mDL" && config.mDL) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.iban.1" && config.IBAN) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.loyalty.1" && config.Loyalty) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "org.iso.23220.photoid.1" && config.PhotoId) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.pseudonym.age_over_18.1" && config.AgeOver18) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.hiid.1" && config.HealthID) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "org.iso.18013.5.1.reservation" && config.Reservation) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.tax.1" && config.TaxNumber) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.por.1" && config.PowerOfRepresentation) {
//         addScopes.push(attestation)
//     }else if (attestation.scope === "eu.europa.ec.eudi.pseudonym.age_over_18.deferred_endpoint" && config.PseudonymDeferred) {
//         addScopes.push(attestation)
//     }
// }


function generateRequest() {
    request = requestTemplate
    request.presentation_definition.id = crypto.randomUUID()
    request.nonce = crypto.randomUUID()
    i = 0
    for (const attestation of addScopes) {
        filds = []
        for (const claim of attestation.claims) {
            filds.push({
                "path": ["$['"+attestation.scope+"']['"+claim+"']"],
                "intent_to_retain": false
            })
        }

        request.presentation_definition.input_descriptors.push({
            "id": attestation.scope,
            "name": "Person Identification Data (PID)",
            "purpose": "",
            "format": {
                "mso_mdoc": {
                    "alg": [
                        "ES256",
                        "ES384",
                        "ES512"
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

    console.log(JSON.stringify(request))
}



