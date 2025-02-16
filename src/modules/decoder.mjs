import { Decoder } from "../extern/decode.js";

export class MdocDecoder {

    decode(attestation, _nonce) {
        const buffer = this.decodeBase64OrHex(attestation);
        console.log("Buffer: ", buffer);
        const decodedData = this.decodeCborData(buffer);
        console.log("Data: ", decodedData);
        if (!decodedData || !decodedData.documents) {
            return Promise.reject("Invalid attestation data");
        }

        if (decodedData.documents.length === 1) {
            return Promise.resolve(this.extractAttestationSingle(decodedData.documents[0]));
        } else {
            const attestations = decodedData.documents.map(doc => this.extractAttestationSingle(doc));
            return Promise.resolve({
                kind: "enveloped",
                attestations: attestations
            });
        }
    }

    extractAttestationSingle(document) {
        console.log("Document: ", document);
        const namespaces = document.issuerSigned.nameSpaces;
        const attributes = [];

        Object.keys(namespaces).forEach(it => {
            const namespace = namespaces[it];
            namespace.forEach(element => {
                const decodedElement = this.decodeCborData(element);
                
                attributes.push({
                    key: `${it}:${decodedElement}`,
                    value: decodedElement
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
            console.error("Failed to decode CBOR:", error);
            return null;
        }
    }
}
