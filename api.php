<?php
// Прокси для Venus AI: хранит ключ на сервере и обходит CORS
$KEY  = 'sk-drake-AOd9SZp3bhwoOI8a3zED2wIYj2WgG9rDM8LpQuJof80';
$BASE = 'https://api.drakezakuru.com/v1/';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$p = $_GET['p'] ?? '';
if (!in_array($p, ['chat/completions', 'models'], true)) { http_response_code(400); exit('bad path'); }

@ini_set('zlib.output_compression', '0');
@ini_set('output_buffering', '0');
while (ob_get_level()) ob_end_flush();

$ch = curl_init($BASE . $p);
$headers = ['Authorization: Bearer ' . $KEY, 'Content-Type: application/json'];
curl_setopt_array($ch, [
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_RETURNTRANSFER => false,
  CURLOPT_TIMEOUT => 300,
  CURLOPT_HEADERFUNCTION => function ($c, $h) {
    if (stripos($h, 'content-type:') === 0) header(trim($h));
    return strlen($h);
  },
  CURLOPT_WRITEFUNCTION => function ($c, $d) { echo $d; flush(); return strlen($d); },
]);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}
header('X-Accel-Buffering: no');
curl_exec($ch);
if (curl_errno($ch)) { http_response_code(502); echo json_encode(['error' => curl_error($ch)]); }
curl_close($ch);
