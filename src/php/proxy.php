<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Get URL parameter
$url = "https://verifier_backend.dev.eudiw.dev/ui/presentations";
$response = file_get_contents($url);

// Output the API response
echo $response;
?>

