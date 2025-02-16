import { Decoder } from "../extern/decode.js";

/**
 * Class for decoding Mobile Document (MDoc) attestations.
 */
export class MdocDecoder {
    /**
     * Runs the attestation decoding process.
     * @param {any} attestation - The attestation data.
     * @param {string} [nonce=""] - Optional nonce for verification.
     * @returns {Promise<any>} - A promise resolving to the decoded attestation data.
     */
    run(attestation, nonce = "") {
        return this.mapVpTokenToAttestations(attestation, nonce);
    }

    /**
     * Decodes an attestation.
     * @param {string} attestation - Base64 or hex-encoded attestation data.
     * @param {string} _nonce - Nonce for verification.
     * @returns {Promise<object>} - A promise resolving to the decoded attestation object.
     */
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

    /**
     * Extracts a single attestation from a document.
     * @param {Map} document - The document containing the attestation.
     * @returns {object} - The extracted attestation.
     */
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

    /**
     * Decodes a base64 or hex string into a Uint8Array.
     * @param {string} input - The encoded string.
     * @returns {Uint8Array} - The decoded byte array.
     */
    decodeBase64OrHex(input) {
        const base64Regex = /^[A-Za-z0-9-_]+$/;
        if (base64Regex.test(input)) {
            const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
            return new Uint8Array(atob(base64).split("" ).map(c => c.charCodeAt(0)));
        }
        return new Uint8Array(input.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    }

    /**
     * Decodes CBOR data using an external decoder.
     * @param {Uint8Array} data - The CBOR-encoded data.
     * @returns {Map|null} - The decoded data or null if an error occurs.
     */
    decodeCborData(data) {
        try {
            return new Decoder().mapDecode(data);
        } catch (error) {
            return null;
        }
    }

    /**
     * Maps VP token response to attestation objects.
     * @param {any} response - The VP token response.
     * @param {string} nonce - Nonce for verification.
     * @returns {Promise<object[]>} - A promise resolving to an array of decoded attestations.
     */
    mapVpTokenToAttestations(response, nonce) {
        let decodings = [];

        const presentationSubmission = response.presentation_submission;
        const vpToken = response.vp_token;
        const formatsPerPath = this.deductVpTokenItemsFormats(presentationSubmission.descriptor_map);

        decodings = Object.entries(formatsPerPath).map(async entry => {
            return await this.mapAttestation(entry[0], entry[1], vpToken, nonce);
        });

        return Promise.all(decodings);
    }

    /**
     * Maps an attestation based on its path and format.
     * @param {string} path - JSONPath for locating the attestation.
     * @param {string} format - Format of the attestation.
     * @param {any} vpToken - The VP token containing attestations.
     * @param {string} nonce - Nonce for verification.
     * @returns {Promise<object>} - A promise resolving to the decoded attestation or an error object.
     */
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

    /**
     * Decodes an attestation.
     * @param {string} attestation - The attestation data.
     * @param {string} format - Attestation format.
     * @param {string} nonce - Nonce for verification.
     * @returns {Promise<object>} - A promise resolving to the decoded attestation or an error object.
     */
    async decodeAttestation(attestation, format, nonce) {
        return await this.decode(attestation, nonce).catch(error => {
            return {
                kind: "error",
                format: format,
                reason: error.message
            };
        });
    }

    /**
     * Deducts VP token item formats from descriptor maps.
     * @param {Array} descriptorMaps - Array of descriptor maps.
     * @returns {object} - A map of paths to formats.
     */
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

    /**
     * Locates an attestation in the VP token using JSONPath.
     * @param {string} path - JSONPath expression.
     * @param {any} vpToken - The VP token.
     * @returns {any} - The located attestation or null.
     */
    locateInVpToken(path, vpToken) {
        if (path === "$") {
            return vpToken[0];
        }
        try {
            const arrayAsJson = JSON.parse(JSON.stringify(vpToken));
            return JSONPath({ path: path, json: arrayAsJson })[0];
        } catch (error) {
            console.error(`Error parsing JSON path ${path}: ${error.message}`);
            return null;
        }
    }
}
