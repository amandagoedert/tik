<?php
// Registro genérico das chamadas do gateway de pagamento TriboPay em formato JSON por linha.
$logFile = __DIR__ . '/gateway.log';

function logGateway($data) {
    global $logFile;
    $entry = [
        'datetime' => date('Y-m-d H:i:s'),
        'data' => $data
    ];
    file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
}

if (!function_exists('logTriboPay')) {
    function logTriboPay($data) {
        logGateway($data);
    }
}
?>
