import { MdocDecoder } from './decoder.mjs'

export async function mapVpTokenToAttestations(responce, nonce) {
    let decodings = [];

    // if (isPrExWalletResponse(concludedTransaction.walletResponse)) {
        let presentationSubmission = responce.presentation_submission;
        let vpToken = responce.vp_token;
        let formatsPerPath = deductVpTokenItemsFormats(presentationSubmission.descriptor_map);
        console.log(formatsPerPath)
        decodings = Object.entries(formatsPerPath).map(async entry =>{
            return await mapAttestation(entry[0], entry[1], vpToken, nonce);
        });
    // }
  // else {
  //       let dcqlQuery = concludedTransaction.presentationQuery;
  //       let vpToken = concludedTransaction.walletResponse.vp_token;
  //
  //       dcqlQuery.credentials.forEach((credential, index) => {
  //           decodings.push(decodeAttestation(vpToken[credential.id], dcqlQuery.credentials[index].format, concludedTransaction.nonce));
  //       });
  //   }
    return Promise.all(decodings);
}

async function mapAttestation(path, format, vpToken, nonce) {
    let sharedAttestation = locateInVpToken(path, vpToken);
    if (!sharedAttestation) {
        console.log(`Could not match path ${path} to vp_token array`);
        return Promise.resolve({
            kind: "error",
            format: format,
            reason: `Could not match path ${path} to vp_token array`
        });
    } else {
        return await decodeAttestation(sharedAttestation, format, nonce);
    }
}

async function decodeAttestation(attestation, format, nonce) {
    const decoder = new MdocDecoder()
    // console.log("att ",attestation)
    // console.log("decoder decoded ", decoder.decode(attestation, nonce))
    // decoder.decode(attestation, nonce)
    return await decoder.decode(attestation, nonce).catch(error => {
        console.error(`Error decoding document in ${format}: ${error.message}`);
        return {
            kind: "error",
            format: format,
            reason: error.message
        };
    });
}

function deductVpTokenItemsFormats(descriptorMaps) {
    let vpTokenFormatsByPath = {};
    descriptorMaps.forEach(descriptor => {
        if (!vpTokenFormatsByPath[descriptor.path]) {
            vpTokenFormatsByPath[descriptor.path] = descriptor.format;
        } else if (vpTokenFormatsByPath[descriptor.path] !== descriptor.format) {
            console.error(`INVALID_PRESENTATION_SUBMISSION: Descriptor maps of different formats mapped to same path (${descriptor.path})`);
        }
    });
    return vpTokenFormatsByPath;
}

function locateInVpToken(path, vpToken) {
    if (path === "$") {
        return vpToken[0];
    } else {
        try {
            let arrayAsJson = JSON.parse(JSON.stringify(vpToken));
            return JSONPath({ path: path, json: arrayAsJson })[0];
        } catch (error) {
            console.error(`Error parsing JSON path ${path}: ${error.message}`);
            return null;
        }
    }
}

function isPrExWalletResponse(response) {
    return response && Array.isArray(response.vp_token);
}
