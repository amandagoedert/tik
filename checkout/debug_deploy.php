<?php
// Debug específico para deploy na Vercel
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Teste específico para método POST
$methodTest = [
    'current_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'post_allowed' => true,
    'can_handle_post' => $_SERVER['REQUEST_METHOD'] === 'POST' ? 'YES' : 'Not tested (use POST request)',
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
];

$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method_test' => $methodTest,
    'php_version' => PHP_VERSION,
    'environment' => [
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown',
        'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'unknown',
        'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
    ],
    'files_exist' => [
        'api.php' => file_exists(__DIR__ . '/api.php'),
        'tribopay_config.php' => file_exists(__DIR__ . '/tribopay_config.php'),
        'tribopay_log.php' => file_exists(__DIR__ . '/tribopay_log.php'),
        '.htaccess' => file_exists(__DIR__ . '/.htaccess')
    ]
];

// Testar configuração do TriboPay
if (file_exists(__DIR__ . '/tribopay_config.php')) {
    try {
        $config = require __DIR__ . '/tribopay_config.php';
        $debug['config'] = [
            'has_api_token' => !empty($config['api_token']),
            'api_token_length' => strlen($config['api_token'] ?? ''),
            'has_default_offer_hash' => !empty($config['default_offer_hash']),
            'has_default_product_hash' => !empty($config['default_product_hash'])
        ];
    } catch (Exception $e) {
        $debug['config_error'] = $e->getMessage();
    }
} else {
    $debug['config_error'] = 'Arquivo tribopay_config.php não encontrado';
}

// Testar conectividade com a API do TriboPay
$debug['tribopay_test'] = [];
try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.tribopay.com.br/api/public/v1/transactions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'HEAD');
    curl_setopt($ch, CURLOPT_NOBODY, true);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $debug['tribopay_test'] = [
        'http_code' => $httpCode,
        'curl_error' => $error ?: null,
        'accessible' => $httpCode > 0
    ];
} catch (Exception $e) {
    $debug['tribopay_test']['error'] = $e->getMessage();
}

// Testar se consegue criar um arquivo de log
try {
    $testLogFile = __DIR__ . '/test_log.txt';
    $testContent = 'Test log: ' . date('Y-m-d H:i:s') . "\n";
    $writeResult = file_put_contents($testLogFile, $testContent, FILE_APPEND | LOCK_EX);
    $debug['log_test'] = [
        'can_write' => $writeResult !== false,
        'bytes_written' => $writeResult ?: 0
    ];
    
    // Limpar arquivo de teste
    if (file_exists($testLogFile)) {
        unlink($testLogFile);
    }
} catch (Exception $e) {
    $debug['log_test']['error'] = $e->getMessage();
}

// Se for uma requisição POST, testar o payload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $debug['post_data'] = [
        'raw_input_length' => strlen($input),
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown'
    ];
    
    if (!empty($input)) {
        $decoded = json_decode($input, true);
        $debug['post_data']['json_valid'] = json_last_error() === JSON_ERROR_NONE;
        if ($decoded) {
            $debug['post_data']['keys'] = array_keys($decoded);
        }
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>