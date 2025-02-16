import { Decoder } from "../extern/decode.js";

export class MdocDecoder {
    run(attestation, nonce = ""){
        return this.mapVpTokenToAttestations(attestation, nonce);
    }

    decode(attestation, _nonce) {
        const buffer = this.decodeBase64OrHex(attestation);
        const decodedData = this.decodeCborData(buffer);

        if (!decodedData || !decodedData.get("documents")) {
            return Promise.reject("Invalid attestation data");
        }

        if (decodedData.get("documents").length === 1) {
            return Promise.resolve(this.extractAttestationSingle(decodedData.get("documents")[0]));
        } else {
            const attestations = decodedData.get("documents").map(doc => this.extractAttestationSingle(doc));
            return Promise.resolve({
                kind: "enveloped",
                attestations: attestations
            });
        }
    }

    extractAttestationSingle(document) {
        const namespaces = document.get("issuerSigned").get("nameSpaces");
        const attributes = [];

        namespaces.forEach((namespace, it) => {
            namespace.forEach(element => {
                const decodedElement = this.decodeCborData(element.value);

                attributes.push({
                    key: `${it}:${decodedElement.get("elementIdentifier")}`,
                    value: decodedElement.get("elementValue")
                });
            });
        });

        return {
            kind: "single",
            format: "MSO_MDOC",
            name: document["docType"],
            attributes: attributes,
            metadata: []
        };
    }

    decodeBase64OrHex(input) {
        const base64Regex = /^[A-Za-z0-9-_]+$/;
        if (base64Regex.test(input)) {
            const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
            const byteArray = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
            return byteArray
        }
        const byteArray = new Uint8Array(input.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        return byteArray
    }

    decodeCborData(data) {
        try {
            return new Decoder().mapDecode(data);
        } catch (error) {
            return null;
        }
    }

    mapVpTokenToAttestations(responce, nonce) {
        let decodings = [];

        const presentationSubmission = responce.presentation_submission;
        const vpToken = responce.vp_token;
        const formatsPerPath = this.deductVpTokenItemsFormats(presentationSubmission.descriptor_map);
        decodings = Object.entries(formatsPerPath).map(async entry =>{
            return await this.mapAttestation(entry[0], entry[1], vpToken, nonce);
        });

        return Promise.all(decodings);
    }

    async mapAttestation(path, format, vpToken, nonce) {
        const sharedAttestation = this.locateInVpToken(path, vpToken);
        if (!sharedAttestation) {
            return Promise.resolve({
                kind: "error",
                format: format,
                reason: `Could not match path ${path} to vp_token array`
            });
        } else {
            return await this.decodeAttestation(sharedAttestation, format, nonce);
        }
    }

    async decodeAttestation(attestation, format, nonce) {
        return await this.decode(attestation, nonce).catch(error => {
            return {
                kind: "error",
                format: format,
                reason: error.message
            };
        });
    }

    deductVpTokenItemsFormats(descriptorMaps) {
        const vpTokenFormatsByPath = {};
        descriptorMaps.forEach(descriptor => {
            if (!vpTokenFormatsByPath[descriptor.path]) {
                vpTokenFormatsByPath[descriptor.path] = descriptor.format;
            } else if (vpTokenFormatsByPath[descriptor.path] !== descriptor.format) {
                console.error(`INVALID_PRESENTATION_SUBMISSION: Descriptor maps of different formats mapped to same path (${descriptor.path})`);
            }
        });
        return vpTokenFormatsByPath;
    }

    locateInVpToken(path, vpToken) {
        if (path === "$") {
            return vpToken[0];
        } else {
            try {
                const arrayAsJson = JSON.parse(JSON.stringify(vpToken));
                return JSONPath({ path: path, json: arrayAsJson })[0];
            } catch (error) {
                console.error(`Error parsing JSON path ${path}: ${error.message}`);
                return null;
            }
        }
    }
}
