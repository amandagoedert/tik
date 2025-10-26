<?php
header('Content-Type: application/json');

$rawBody = file_get_contents('php://input');
$decoded = json_decode($rawBody, true);

$logFile = __DIR__ . '/tribopay_postback.log';
$logEntry = [
    'datetime' => date('Y-m-d H:i:s'),
    'payload' => $decoded,
];
file_put_contents($logFile, json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);

// Ajuste esta área para atualizar o pedido na base de dados conforme o status recebido.
// Exemplos de campos mais comuns enviados pela TriboPay:
// - hash (identificador único da transação)
// - status (pending, paid, canceled, refunded)
$hash = $decoded['hash'] ?? ($decoded['data']['hash'] ?? null);
$status = $decoded['status'] ?? ($decoded['data']['status'] ?? null);
if ($hash && $status) {
    // updateOrderStatus($hash, $status);
}

http_response_code(200);
echo json_encode(['received' => true]);
