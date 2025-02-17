<?php
require_once 'proxy.php';

// Set the backend URL where most requests will be proxied
$BACKEND_URL = "https://verifier-backend.eudiw.dev";

// Define the Proxy object and load the proxy configuration
$proxy = new Proxy();
$proxy->load("./proxy.json");

// Define allowed origins for CORS headers
$allowed_origins = [
    $BACKEND_URL,
    "https://issuer.eudiw.dev/.well-known/openid-credential-issuer"
];

// Check if the origin of the request is allowed
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    // Allow the origin in the CORS header if it's in the allowed list
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
} else {
    // Default fallback for the CORS header
    header("Access-Control-Allow-Origin: " . $BACKEND_URL);
}

// Allow specific HTTP methods and headers for CORS
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS requests (required for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // Send no content response
    exit; // Exit early for OPTIONS request
}

// Clean the request URI to match the proxy configuration
$path = str_replace("/php/redirect.php", "", $_SERVER['REQUEST_URI']);
$target = $proxy->get($path);

// Validate the target URL
if ($target === null || !filter_var($target, FILTER_VALIDATE_URL)) {
    http_response_code(400); // Bad request if the target is invalid
    echo json_encode(["error" => "Invalid target URL"]);
    exit;
}

// Check if the target URL points to a private or reserved IP (prevent SSRF)
$parsedUrl = parse_url($target);
$hostname = $parsedUrl['host'] ?? '';

if ($hostname) {
    // Resolve the hostname to an IP address
    $ip = gethostbyname($hostname);
    // Validate that the IP is not in a private or reserved range
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        http_response_code(403); // Forbidden if the IP is private or reserved
        echo json_encode(["error" => "Forbidden: Target URL points to a private or reserved IP"]);
        exit;
    }
}

// Initialize cURL for the request to the target URL
$ch = curl_init($target);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow any redirects
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Set a timeout for the request
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json" // Set the request content type to JSON
]);

// Forward POST request data if applicable
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents("php://input"); // Get the raw POST data
    curl_setopt($ch, CURLOPT_POST, true); // Indicate a POST request
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); // Attach the POST data to the request
}

// Execute the cURL request
$response = curl_exec($ch);

// Handle any cURL errors
if ($response === false) {
    http_response_code(500); // Internal server error if the request fails
    header("Content-Type: application/json"); // Always return JSON for errors
    echo json_encode(["error" => "cURL Error: " . htmlspecialchars(curl_error($ch), ENT_QUOTES, 'UTF-8')]);
} else {
    // Get the content type of the response from the backend
    $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    // Set the same content type in the response header
    if ($content_type) {
        header("Content-Type: " . $content_type);
    } else {
        // Default to binary stream if content type is unknown
        header("Content-Type: application/octet-stream");
    }

    // If the response is JSON, validate it before echoing
    if (stripos($content_type, "application/json") !== false) {
        json_decode($response); // Decode the JSON response
        if (json_last_error() === JSON_ERROR_NONE) {
            echo $response; // Return the valid JSON response
        } else {
            echo json_encode(["error" => "Invalid JSON response from server"]); // Handle invalid JSON
        }
    } else {
        // If the response is not JSON, escape it to prevent XSS risks
        echo htmlspecialchars($response, ENT_QUOTES, 'UTF-8');
    }
}

// Close the cURL session
curl_close($ch);
?>
