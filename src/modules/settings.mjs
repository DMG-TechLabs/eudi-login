/**
 * The ip or domain of the login service
 * @constant {string}
*/
export const HOST = "http://"+window.location.hostname+":8080";

/**
 * Backend proxy endpoint URL.
 * @constant {string}
 */
export const PROXY = HOST + "/php/redirect.php";

/**
 * Presentations API endpoint.
 * @constant {string}
 */
export const PRESENTATIONS_ENDPOINT = "ui/presentations";

/**
 * Endpoint for fetching attestations.
 * @constant {string}
 */
export const ATTESTATIONS_ENDPOINT = PROXY + "/issuers"

