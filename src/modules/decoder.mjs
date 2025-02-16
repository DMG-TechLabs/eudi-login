import { Decoder } from "../extern/decode.js";

export class MdocDecoder {

    decode(attestation, _nonce) {
        const buffer = this.decodeBase64OrHex(attestation);
        console.log("Buffer: ", buffer);
        const decodedData = this.decodeCborData(buffer);
        console.log("Mdoc decoded Data: ", decodedData);

        if (!decodedData || !decodedData.get("documents")) {
            console.log("Rejected")
            return Promise.reject("Invalid attestation data");
        }

        if (decodedData.get("documents").length === 1) {
            console.log("document length 1")
            return Promise.resolve(this.extractAttestationSingle(decodedData.get("documents")[0]));
        } else {
            console.log("document length > 1")
            const attestations = decodedData.get("documents").map(doc => this.extractAttestationSingle(doc));
            return Promise.resolve({
                kind: "enveloped",
                attestations: attestations
            });
        }
    }

    extractAttestationSingle(document) {
        console.log("Document: ", document);
        const namespaces = document.get("issuerSigned").get("nameSpaces");
        const attributes = [];

        // console.log("Namespaces: ", namespaces)
        // Object.keys(namespaces).forEach(it => {

        namespaces.forEach((namespace, it) => {
            // console.log("Namespace: ", namespace);
            // console.log("Namespace it: ", it);
            // console.log("Namespace it: ", namespaces[it]);
            // const namespace = namespaces[it];
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
            console.error("Failed to decode CBOR:", error);
            return null;
        }
    }
}
