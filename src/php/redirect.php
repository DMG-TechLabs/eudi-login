<?php
// NOTE: proxy settings taken from:
// https://github.com/eu-digital-identity-wallet/eudi-web-verifier/blob/main/src/proxy.conf.json

require_once 'proxy.php';

$BACKEND_URL = "https://verifier-backend.eudiw.dev";

// Define the Proxy
$proxy = new Proxy();
$proxy->set(new Record("/ui", $BACKEND_URL, true, true));
$proxy->set(new Record("/issuers", "https://issuer.eudiw.dev/.well-known/openid-credential-issuer", false));
$proxy->set(new Record("/utilities", $BACKEND_URL, true, true));

// Allow CORS
$allowed_origins = [
    $BACKEND_URL,
    "https://issuer.eudiw.dev/.well-known/openid-credential-issuer"
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
} else {
    header("Access-Control-Allow-Origin: " . $BACKEND_URL); // Default fallback
}
// header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = str_replace("/php/redirect.php", "", $_SERVER['REQUEST_URI']);
$target = $proxy->get($path);

if ($target === null || !filter_var($target, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid target URL"]);
    exit;
}

// Check for internal IP addresses (Prevents SSRF to private networks)
$parsedUrl = parse_url($target);
$hostname = $parsedUrl['host'] ?? '';

if ($hostname) {
    $ip = gethostbyname($hostname);
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden: Target URL points to a private or reserved IP"]);
        exit;
    }
}

// Initialize cURL
$ch = curl_init($target);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Add timeout
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);

// Forward request body if applicable
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents("php://input");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
}

$response = curl_exec($ch);

// Handle errors
if ($response === false) {
    http_response_code(500);
    header("Content-Type: application/json"); // Always return JSON for errors
    echo json_encode(["error" => "cURL Error: " . htmlspecialchars(curl_error($ch), ENT_QUOTES, 'UTF-8')]);
} else {
    // Get the content type from the backend response
    $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    // Set the same content type in the response
    if ($content_type) {
        header("Content-Type: " . $content_type);
    } else {
        header("Content-Type: application/octet-stream"); // Fallback for unknown types
    }

    // If the response is JSON, validate it before echoing
    if (stripos($content_type, "application/json") !== false) {
        json_decode($response);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo $response; // Valid JSON
        } else {
            echo json_encode(["error" => "Invalid JSON response from server"]);
        }
    } else {
        // If the response is not JSON, escape it to prevent XSS risks
        echo htmlspecialchars($response, ENT_QUOTES, 'UTF-8');
    }
}

curl_close($ch);
?>
