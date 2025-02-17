/**
 * Standardized HTTP Request class for handling API requests.
 */
export class Request {
    /**
     * Creates a new Request instance.
     * @constructor
     * @param {string} baseUrl - The base URL for API requests.
     * @param {Object} [defaultHeaders={}] - Default headers to include in requests.
     */
    constructor(baseUrl, defaultHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
    }) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = defaultHeaders;
    }

    /**
     * Makes an HTTP request.
     * @function send
     * @param {string} endpoint - The API endpoint (relative to base URL).
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.).
     * @param {Object} [body=null] - The request body for POST/PUT requests.
     * @param {Object} [headers={}] - Additional headers.
     * @returns {Promise<Object>} - The JSON response.
     */
    async send(endpoint, method, body = null, headers = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        const options = {
            method,
            headers: { ...this.defaultHeaders, ...headers },
            body: body ? JSON.stringify(body) : null,
        };

        if (method === 'GET' || method === 'HEAD') {
            delete options.body;
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }

    /**
     * Makes a GET request.
     * @function get
     * @param {string} endpoint - The API endpoint.
     * @param {Object} [headers={}] - Additional headers.
     * @returns {Promise<Object>} - The JSON response.
     */
    get(endpoint = "", headers = {}) {
        return this.send(endpoint, 'GET', null, headers);
    }

    /**
     * Makes a POST request.
     * @function post
     * @param {string} endpoint - The API endpoint.
     * @param {Object} body - The request body.
     * @param {Object} [headers={}] - Additional headers.
     * @returns {Promise<Object>} - The JSON response.
     */
    post(endpoint = "", body = {}, headers = {}) {
        return this.send(endpoint, 'POST', body, headers);
    }

    /**
     * Makes a PUT request.
     * @function put
     * @param {string} endpoint - The API endpoint.
     * @param {Object} body - The request body.
     * @param {Object} [headers={}] - Additional headers.
     * @returns {Promise<Object>} - The JSON response.
     */
    put(endpoint = "", body, headers = {}) {
        return this.send(endpoint, 'PUT', body, headers);
    }

    /**
     * Makes a DELETE request.
     * @function delete
     * @param {string} endpoint - The API endpoint.
     * @param {Object} [headers={}] - Additional headers.
     * @returns {Promise<Object>} - The JSON response.
     */
    delete(endpoint = "", headers = {}) {
        return this.send(endpoint, 'DELETE', null, headers);
    }
}
