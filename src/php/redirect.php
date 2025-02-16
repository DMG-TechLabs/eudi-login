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
header("Access-Control-Allow-Origin: *");
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
    header("Content-Type: application/json"); // Ensure JSON response
    echo json_encode(["error" => "cURL Error: " . htmlspecialchars(curl_error($ch), ENT_QUOTES, 'UTF-8')]);
} else {
    // Sanitize the output and ensure it's JSON
    header("Content-Type: application/json");

    json_decode($response);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo $response;
    } else {
        echo json_encode(["error" => "Invalid JSON response from server"]);
    }
}

curl_close($ch);
?>
