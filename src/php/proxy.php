<?php
header("Access-Control-Allow-Origin: *");                            // Allow all origins (change '*' to a specific domain for security)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");          // Allow specific request methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow headers

$path = $_SERVER['REQUEST_URI'];

$allowed_paths = ["/ui", "/wallet", "/utilities"];
$backend_url = "https://verifier-backend.eudiw.dev";

$valid = false;
foreach ($allowed_paths as $allowed) {
    if (strpos($path, $allowed) === 0) {
        $valid = true;
        break;
    }
}

if (!$valid) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden path"]);
    exit;
}

$target_url = $backend_url . $path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $target_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // NOTE: Not recommended for production

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http_code);
echo $response;
?>
