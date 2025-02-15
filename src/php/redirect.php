<?php
// NOTE: proxy settings taken from:
// https://github.com/eu-digital-identity-wallet/eudi-web-verifier/blob/main/src/proxy.conf.json

require_once 'proxy.php';

$BACKEND_URL = "https://verifier-backend.eudiw.dev";

// Define the Proxy
$proxy = new Proxy();
$proxy->set(new Record("/ui", $BACKEND_URL, true, true));
$proxy->set(new Record("/issuers", "https://issuer.eudiw.dev/.well-known/openid-credential-issuer", false));

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
if ($target === null) {
    echo json_encode(["error" => "Proxy Error: No records found for '" . $path . "'"]); 
    exit;
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
    echo json_encode(["error" => "cURL Error: " . curl_error($ch)]);
} else {
    echo $response;
}

curl_close($ch);
?>
