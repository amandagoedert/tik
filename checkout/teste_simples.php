<?php
// Teste simples da API
$config = require_once 'tribopay_config.php';

echo "=== TESTE SIMPLES TRIBOPAY ===\n\n";

// Constantes da TriboPay
define('TRIBOPAY_TOKEN', $config['api_token']);
define('TRIBOPAY_BASE_URL', 'https://api.tribopay.com.br/api/public/v1');

// Dados de teste no formato correto da TriboPay
$payload = [
    'api_token' => TRIBOPAY_TOKEN,
    'offer_hash' => $config['default_offer_hash'],
    'installments' => 1,
    'payment_method' => 'pix',
    'amount' => 1000, // R$ 10,00 em centavos
    'customer' => [
        'name' => 'João Silva',
        'email' => 'joao@email.com',
        'document_number' => '12345678901',
        'phone' => '11999999999',
        'address' => [
            'street' => 'Rua Teste',
            'number' => '123',
            'neighborhood' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zipcode' => '01234567'
        ]
    ],
    'cart' => [
        [
            'product_hash' => $config['default_product_hash'],
            'quantity' => 1,
            'amount' => 1000 // R$ 10,00 em centavos
        ]
    ]
];

echo "Payload:\n";
echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

// Headers
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . TRIBOPAY_TOKEN
];

// Fazer requisição
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, TRIBOPAY_BASE_URL . '/transactions');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Curl Error: " . ($error ?: 'Nenhum') . "\n\n";

echo "Resposta da API:\n";
if ($response) {
    $data = json_decode($response, true);
    if ($data) {
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        
        // Verificar campos PIX
        echo "\n=== ANÁLISE DOS CAMPOS PIX ===\n";
        echo "pix.qr_code_base64: " . (isset($data['pix']['qr_code_base64']) ? "✅ Presente" : "❌ Ausente") . "\n";
        echo "pix.pix_qr_code: " . (isset($data['pix']['pix_qr_code']) ? "✅ Presente" : "❌ Ausente") . "\n";
        echo "pix.pix_url: " . (isset($data['pix']['pix_url']) ? "✅ Presente" : "❌ Ausente") . "\n";
        echo "qr_code_image_url: " . (isset($data['qr_code_image_url']) ? "✅ Presente" : "❌ Ausente") . "\n";
        echo "pix_copy_paste: " . (isset($data['pix_copy_paste']) ? "✅ Presente" : "❌ Ausente") . "\n";
        
        // Listar todos os campos
        echo "\nTodos os campos da resposta:\n";
        function listarCampos($array, $prefix = '') {
            foreach ($array as $key => $value) {
                if (is_array($value)) {
                    echo "$prefix$key: [array]\n";
                    listarCampos($value, "$prefix  ");
                } else {
                    $tipo = is_string($value) ? 'string' : gettype($value);
                    echo "$prefix$key: ($tipo) " . (is_string($value) ? substr($value, 0, 100) : $value) . "\n";
                }
            }
        }
        listarCampos($data);
        
    } else {
        echo "Resposta não é JSON válido:\n$response\n";
    }
} else {
    echo "Resposta vazia\n";
}
?>