export class Decoder {
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
                console.log("Element", JSON.stringify(element));
                console.log("Decoded Element: ", JSON.stringify(decodedElement));
                console.log("Value: ", decodedElement);
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
            return byteArray.buffer;
        }
        const byteArray = new Uint8Array(input.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        return byteArray.buffer;
    }

    decodeCborData(data) {
        try {
            const buffer = data instanceof ArrayBuffer ? data : data.buffer;
            return CBOR.decode(buffer);
        } catch (error) {
            console.error("Failed to decode CBOR:", error);
            return null;
        }
    }
}
