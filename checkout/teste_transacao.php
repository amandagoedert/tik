<?php
/*
 |--------------------------------------------------------------------------
 | TESTE DE TRANSAÇÃO TRIBOPAY
 |--------------------------------------------------------------------------
 | Teste simulado para verificar se a API está respondendo corretamente
 */

echo "<h1>Teste de Transação TriboPay</h1>";

// Dados de teste
$testData = [
    'debtor_name' => 'João Silva',
    'email' => 'joao@email.com',
    'debtor_document_number' => '12345678901',
    'phone' => '11999887766',
    'amount' => 99.90,
    'produtos' => [
        [
            'nome' => 'Produto Teste',
            'preco' => 99.90,
            'quantidade' => 1,
            'imagem' => 'teste.jpg'
        ]
    ],
    'address_street' => 'Rua Teste',
    'address_number' => '123',
    'address_complement' => '',
    'address_neighborhood' => 'Centro',
    'address_city' => 'São Paulo',
    'address_state' => 'SP',
    'address_zipcode' => '01234567',
    'payment_method' => 'pix'
];

echo "<h2>Dados de Teste:</h2>";
echo "<pre>" . json_encode($testData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";

echo "<h2>Enviando para API...</h2>";

// Fazer requisição para api.php
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'http://localhost/api.php',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($testData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'
    ],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<h3>Resultado:</h3>";
echo "<p><strong>Código HTTP:</strong> $httpCode</p>";

if ($error) {
    echo "<p style='color:red'><strong>Erro cURL:</strong> $error</p>";
} else {
    echo "<p><strong>Resposta:</strong></p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    
    $data = json_decode($response, true);
    if ($data) {
        echo "<h3>Análise:</h3>";
        if (isset($data['error']) && $data['error']) {
            echo "<p style='color:red'>❌ Erro: " . $data['message'] . "</p>";
        } else {
            echo "<p style='color:green'>✅ Sucesso! Transação criada.</p>";
            if (isset($data['qr_code_image_url'])) {
                echo "<p>QR Code disponível: " . $data['qr_code_image_url'] . "</p>";
            }
            if (isset($data['pix_copy_paste'])) {
                echo "<p>PIX Copia e Cola disponível</p>";
            }
        }
    }
}

echo "<hr>";
echo "<p><a href='teste_config.php'>← Voltar para teste de configuração</a></p>";
?>