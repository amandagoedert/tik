<?php
// Registro genérico das chamadas do gateway de pagamento em formato JSON por linha.
$logFile = __DIR__ . '/gateway.log';

function logGateway($data) {
    global $logFile;
    $entry = [
        'datetime' => date('Y-m-d H:i:s'),
        'data' => $data
    ];
    file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
}

// Mantém compatibilidade com chamadas antigas.
if (!function_exists('logMonetrix')) {
    function logMonetrix($data) {
        logGateway($data);
    }
}
?>
