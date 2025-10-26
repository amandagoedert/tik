<?php
header('Content-Type: application/json');

require_once __DIR__ . '/tribopay_log.php';

const TRIBOPAY_ENDPOINT = 'https://api.tribopay.com.br/api/public/v1/transactions';

// Configuração CORS mais permissiva para desenvolvimento
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:8888',
    'http://localhost:8888',
    'https://tikt-ten.vercel.app'
];

if (in_array($origin, $allowedOrigins) || $origin === '') {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin');
header('Access-Control-Max-Age: 86400');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, array $payload): void {
    http_response_code($status);

    $options = JSON_UNESCAPED_UNICODE;
    if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
        $options |= JSON_INVALID_UTF8_SUBSTITUTE;
    }

    $json = json_encode($payload, $options);
    if ($json === false) {
        $errorMessage = json_last_error_msg();
        logGateway([
            'etapa' => 'json_encode_erro',
            'status' => $status,
            'erro' => $errorMessage,
            'payload_keys' => array_keys($payload),
        ]);

        $fallbackPayload = [
            'error' => true,
            'message' => 'Erro interno ao gerar resposta JSON.',
            'details' => $errorMessage,
        ];

        $fallback = json_encode($fallbackPayload, $options);

        echo $fallback === false ? '{"error":true,"message":"Erro inesperado ao gerar resposta."}' : $fallback;
        exit;
    }

    echo $json;
    exit;
}

function sanitizeString(?string $value): string {
    if ($value === null) {
        return '';
    }
    $value = trim($value);
    return preg_replace('/[^\p{L}\p{N}\s@._-]/u', '', $value);
}

function onlyDigits(?string $value): string {
    return preg_replace('/\D/', '', $value ?? '');
}

function toCents($value): int {
    // Sempre converte para centavos, assumindo que o valor de entrada está em reais
    if (is_int($value) || is_float($value)) {
        $cents = (int) round($value * 100);
        logGateway(['etapa' => 'toCents_debug', 'input' => $value, 'type' => gettype($value), 'output' => $cents]);
        return $cents;
    }
    
    // Para strings, trata vírgula como separador decimal brasileiro
    $valueStr = (string) $value;
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    $valueStr = str_replace('.', '', $valueStr); // Remove pontos de milhares
    $valueStr = str_replace(',', '.', $valueStr); // Vírgula vira ponto decimal
    $floatValue = (float) $valueStr;
    $cents = (int) round($floatValue * 100);
    
    logGateway(['etapa' => 'toCents_debug', 'input' => $value, 'string_processed' => $valueStr, 'float' => $floatValue, 'output' => $cents]);
    return $cents;
}

function getQuantity(array $produto): int {
    $quantity = $produto['quantidade'] ?? $produto['quantity'] ?? $produto['qty'] ?? 1;
    $quantity = (int) $quantity;
    return $quantity > 0 ? $quantity : 1;
}

function extractFirstAvailable(array $source, array $paths) {
    foreach ($paths as $path) {
        $value = $source;
        $found = true;
        foreach ($path as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                $found = false;
                break;
            }
            $value = $value[$segment];
        }
        if ($found && $value !== null && $value !== '') {
            return $value;
        }
    }
    return null;
}

$rawBody = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? null;

logGateway([
    'etapa' => 'raw_request',
    'length' => is_string($rawBody) ? strlen($rawBody) : 0,
    'content_type' => $contentType,
]);

$data = json_decode($rawBody, true);

logGateway(['etapa' => 'input', 'payload' => $data]);

if (!is_array($data)) {
    respond(400, ['error' => true, 'message' => 'Payload inválido. Envie um JSON válido.']);
}

$configPath = __DIR__ . '/tribopay_config.php';
if (!file_exists($configPath)) {
    respond(500, ['error' => true, 'message' => 'Arquivo de configuração tribopay_config.php não encontrado.']);
}

$config = require $configPath;
if (!is_array($config)) {
    respond(500, ['error' => true, 'message' => 'Configuração TriboPay inválida.']);
}

$apiToken = trim((string) ($config['api_token'] ?? ''));
if ($apiToken === '' || stripos($apiToken, 'SEU_API_TOKEN') !== false) {
    respond(500, ['error' => true, 'message' => 'Configure o campo api_token em tribopay_config.php.']);
}

$errors = [];
if (empty($data['debtor_name'])) $errors[] = 'Nome obrigatório.';
if (empty($data['email'])) $errors[] = 'E-mail obrigatório.';
if (empty($data['debtor_document_number'])) $errors[] = 'CPF ou CNPJ obrigatório.';
if (empty($data['phone'])) $errors[] = 'Telefone obrigatório.';
if (empty($data['amount'])) $errors[] = 'Valor obrigatório.';

$produtos = $data['produtos'] ?? [];
if (!is_array($produtos) || empty($produtos)) {
    $errors[] = 'Produtos obrigatórios.';
}

if (!empty($errors)) {
    logGateway(['etapa' => 'validacao', 'erros' => $errors]);
    respond(400, ['error' => true, 'message' => implode(' ', $errors)]);
}

$amount = toCents($data['amount']);
logGateway(['etapa' => 'amount_validation', 'original_amount' => $data['amount'], 'converted_amount' => $amount, 'min_required' => 500]);

if ($amount <= 0) {
    respond(400, ['error' => true, 'message' => 'Valor da transação inválido.']);
}

// Verificar se atende valor mínimo do TriboPay (R$ 5,00 = 500 centavos)
if ($amount < 500) {
    respond(400, ['error' => true, 'message' => "Valor mínimo de R$ 5,00. Valor informado: R$ " . number_format($amount/100, 2, ',', '.')]);
}

$document = onlyDigits($data['debtor_document_number']);
if ($document === '') {
    respond(400, ['error' => true, 'message' => 'Documento inválido.']);
}

$phone = onlyDigits($data['phone']);
if ($phone === '') {
    respond(400, ['error' => true, 'message' => 'Telefone inválido.']);
}

$address = [
    'street_name' => sanitizeString($data['address_street'] ?? ''),
    'number' => sanitizeString($data['address_number'] ?? ''),
    'complement' => sanitizeString($data['address_complement'] ?? ''),
    'neighborhood' => sanitizeString($data['address_neighborhood'] ?? ''),
    'city' => sanitizeString($data['address_city'] ?? ''),
    'state' => strtoupper(substr(sanitizeString($data['address_state'] ?? ''), 0, 2)),
    'zip_code' => onlyDigits($data['address_zipcode'] ?? ''),
];

$customer = [
    'name' => sanitizeString($data['debtor_name']),
    'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
    'phone_number' => $phone,
    'document' => $document,
];

$addressFilled = array_filter($address, fn($value) => $value !== '');
if (!empty($addressFilled)) {
    $customer = array_merge($customer, $addressFilled);
}

$productsConfig = is_array($config['products'] ?? null) ? $config['products'] : [];
$defaultOfferHash = trim((string) ($config['default_offer_hash'] ?? ''));
if ($defaultOfferHash !== '' && stripos($defaultOfferHash, 'HASH') !== false) {
    $defaultOfferHash = '';
}
$defaultProductHash = trim((string) ($config['default_product_hash'] ?? ''));
if ($defaultProductHash !== '' && stripos($defaultProductHash, 'HASH') !== false) {
    $defaultProductHash = '';
}

$cart = [];
$offerHash = trim((string) ($data['offer_hash'] ?? ''));
if ($offerHash !== '' && stripos($offerHash, 'HASH') !== false) {
    $offerHash = '';
}

$cartErrors = [];
foreach ($produtos as $produto) {
    if (!is_array($produto)) {
        $cartErrors[] = 'Produto inválido informado.';
        continue;
    }

    $productId = $produto['id'] ?? $produto['product_id'] ?? null;
    $productConfig = $productId && isset($productsConfig[$productId]) ? $productsConfig[$productId] : null;

    $title = sanitizeString($produto['nome'] ?? $produto['title'] ?? $productConfig['title'] ?? 'Produto');
    $quantity = getQuantity($produto);
    $originalPrice = $produto['preco'] ?? $produto['price'] ?? 0;
    $price = toCents($originalPrice);
    
    logGateway(['etapa' => 'cart_item_debug', 'title' => $title, 'original_price' => $originalPrice, 'price_cents' => $price, 'quantity' => $quantity]);

    if ($price <= 0) {
        $cartErrors[] = "Preço inválido para o item {$title}.";
        continue;
    }

    $productHash = $produto['product_hash'] ?? $productConfig['product_hash'] ?? null;
    if (is_string($productHash) && stripos($productHash, 'HASH') !== false) {
        $productHash = null;
    }

    if (!$productHash && $defaultProductHash) {
        $productHash = $defaultProductHash;
    }

    if (!$productHash) {
        $cartErrors[] = "product_hash não configurado para o item {$title}.";
        continue;
    }

    $itemOfferHash = $produto['offer_hash'] ?? $productConfig['offer_hash'] ?? null;
    if (is_string($itemOfferHash) && stripos($itemOfferHash, 'HASH') !== false) {
        $itemOfferHash = null;
    }

    if (!$offerHash && $itemOfferHash) {
        $offerHash = $itemOfferHash;
    }

    $cartItem = [
        'product_hash' => $productHash,
        'title' => $title,
        'price' => $price,  // Preço em centavos conforme documentação
        'quantity' => $quantity,
        'operation_type' => (int) ($produto['operation_type'] ?? $productConfig['operation_type'] ?? $config['default_operation_type'] ?? 1),
        'tangible' => (bool) ($produto['tangible'] ?? $productConfig['tangible'] ?? $config['default_tangible'] ?? false),
    ];

    $cover = $produto['cover'] ?? $produto['image'] ?? $productConfig['cover'] ?? null;
    if (is_string($cover) && $cover !== '') {
        $cartItem['cover'] = $cover;
    }

    $cart[] = $cartItem;
}

if (!empty($cartErrors)) {
    logGateway(['etapa' => 'erro_carrinho', 'erros' => $cartErrors]);
    respond(400, ['error' => true, 'message' => implode(' ', $cartErrors)]);
}

if (!$offerHash) {
    $offerHash = $defaultOfferHash;
}

if (!$offerHash) {
    respond(400, ['error' => true, 'message' => 'offer_hash não configurado. Atualize tribopay_config.php ou informe no payload.']);
}

$expireInDays = isset($data['expire_in_days']) ? (int) $data['expire_in_days'] : 1;
if ($expireInDays <= 0) {
    $expireInDays = 1;
}

$postbackUrl = $config['postback_url'] ?? null;
if (!$postbackUrl) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/checkout/api.php'), '/\\');
    $postbackUrl = rtrim($scheme . '://' . $host . $basePath, '/') . '/webhook.php';
}

$paymentMethod = $data['payment_method'] ?? 'pix';
$payload = [
    'api_token' => $apiToken,  // TriboPay requer api_token no payload
    'amount' => $amount,  // Valor em centavos conforme documentação
    'offer_hash' => $offerHash,
    'payment_method' => $paymentMethod,
    'customer' => $customer,
    'cart' => $cart,
    'expire_in_days' => $expireInDays,
    'transaction_origin' => $data['transaction_origin'] ?? 'api',
    'installments' => 1,  // Obrigatório mesmo para PIX
];

if ($paymentMethod === 'credit_card' && isset($data['card']) && is_array($data['card'])) {
    $payload['card'] = $data['card'];
    $payload['installments'] = (int) ($data['installments'] ?? 1);
}

$tracking = $data['tracking'] ?? null;
if (is_array($tracking) && !empty($tracking)) {
    $payload['tracking'] = $tracking;
}

if ($postbackUrl) {
    $payload['postback_url'] = $postbackUrl;
}

if (!empty($data['pedido_ref'])) {
    $payload['transaction_reference'] = sanitizeString($data['pedido_ref']);
}

logGateway(['etapa' => 'payload', 'payload' => $payload]);

$endpoint = TRIBOPAY_ENDPOINT;

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $endpoint,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: ' . 'Bearer ' . $apiToken,
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT => 60,
]);

$response = curl_exec($curl);
$curlError = curl_error($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
logGateway([
    'etapa' => 'curl_debug',
    'endpoint' => $endpoint,
    'http_code' => $httpCode,
    'curl_error' => $curlError,
    'response_preview' => is_string($response) ? substr($response, 0, 5000) : null,
]);
curl_close($curl);

logGateway([
    'etapa' => 'tribopay_response_raw',
    'status' => $httpCode,
    'response' => $response,
    'erro' => $curlError,
]);

if ($curlError) {
    respond(500, ['error' => true, 'message' => 'Erro de comunicação com a TriboPay: ' . $curlError]);
}

$decodedResponse = json_decode($response, true);
if (!is_array($decodedResponse)) {
    respond(500, ['error' => true, 'message' => 'Resposta inválida da TriboPay.']);
}

if ($httpCode >= 400) {
    $message = $decodedResponse['message'] ?? $decodedResponse['error'] ?? 'Erro ao criar transação na TriboPay.';
    respond($httpCode, ['error' => true, 'message' => $message, 'details' => $decodedResponse]);
}

$transactionHash = extractFirstAvailable($decodedResponse, [
    ['hash'],
    ['data', 'hash'],
    ['transaction', 'hash'],
]);

$status = extractFirstAvailable($decodedResponse, [
    ['status'],
    ['data', 'status'],
    ['transaction', 'status'],
]);

$pixPayload = extractFirstAvailable($decodedResponse, [
    ['pix', 'qrcode'],
    ['pix', 'qr_code'],
    ['pix', 'payload'],
    ['data', 'pix', 'qrcode'],
    ['data', 'pix', 'payload'],
    ['pix_qrcode'],
    ['qrcode'],
]);

$pixImage = extractFirstAvailable($decodedResponse, [
    ['pix', 'qr_code_image_url'],
    ['pix', 'qrcode_image_url'],
    ['pix', 'qr_code_image'],
    ['pix', 'image'],
    ['data', 'pix', 'qr_code_image_url'],
    ['data', 'pix', 'qrcode_image_url'],
    ['qr_code_image_url'],
]);

$pixCopyPaste = extractFirstAvailable($decodedResponse, [
    ['pix', 'copy_paste'],
    ['pix', 'copy_and_paste'],
    ['pix', 'copyPaste'],
    ['pix', 'emv'],
    ['data', 'pix', 'copy_paste'],
    ['data', 'pix', 'copy_and_paste'],
    ['data', 'pix', 'emv'],
]);

$finalResponse = $decodedResponse;
$finalResponse['error'] = false;
if ($transactionHash) {
    $finalResponse['hash'] = $transactionHash;
}
if ($status) {
    $finalResponse['status'] = $status;
}
if ($pixPayload) {
    $finalResponse['qrcode'] = $pixPayload;
}
if ($pixImage) {
    $finalResponse['qr_code_image_url'] = $pixImage;
}
if ($pixCopyPaste) {
    $finalResponse['pix_copy_paste'] = $pixCopyPaste;
}

respond(201, $finalResponse);
// Tratamento global de erros para garantir sempre resposta JSON
set_error_handler(function($severity, $message, $file, $line) {
    error_log("PHP Error: $message in $file on line $line");
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Erro interno do servidor.',
            'debug' => [
                'error' => $message,
                'file' => basename($file),
                'line' => $line
            ]
        ]);
    }
    exit;
});

set_exception_handler(function($exception) {
    error_log("PHP Exception: " . $exception->getMessage());
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Erro interno do servidor.',
            'debug' => [
                'exception' => $exception->getMessage(),
                'file' => basename($exception->getFile()),
                'line' => $exception->getLine()
            ]
        ]);
    }
    exit;
});
