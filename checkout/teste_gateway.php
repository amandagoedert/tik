<?php
require_once __DIR__ . '/tribopay_log.php';

echo "<h1>🔧 Teste de Correções do Gateway PIX</h1>";

// Teste 1: Função toCents
echo "<h2>1. Teste da Função toCents()</h2>";

function toCents($value): int {
    if (is_int($value) || is_float($value)) {
        $cents = (int) round($value * 100);
        echo "Número: $value → $cents centavos<br>";
        return $cents;
    }
    
    $valueStr = (string) $value;
    $valueStr = str_replace('.', '', $valueStr);
    $valueStr = str_replace(',', '.', $valueStr);
    $floatValue = (float) $valueStr;
    $cents = (int) round($floatValue * 100);
    
    echo "String: '$value' → processado: '$valueStr' → float: $floatValue → $cents centavos<br>";
    return $cents;
}

// Testes diversos
$valores = [52.62, '52,62', '52.62', 5.00, '5,00', 100, '100,00'];
foreach ($valores as $valor) {
    $centavos = toCents($valor);
    $reais = $centavos / 100;
    $status = $centavos >= 500 ? "✅ OK" : "❌ Abaixo do mínimo";
    echo "Valor: $valor → $centavos centavos (R$ " . number_format($reais, 2, ',', '.') . ") $status<br>";
}

// Teste 2: Verificação de configuração
echo "<h2>2. Verificação de Configuração</h2>";

$config = include 'tribopay_config.php';
$apiToken = $config['api_token'] ?? '';
$offerHash = $config['default_offer_hash'] ?? '';
$productHash = $config['default_product_hash'] ?? '';

echo "API Token: " . (strlen($apiToken) > 20 ? "✅ Configurado (" . strlen($apiToken) . " chars)" : "❌ Não configurado") . "<br>";
echo "Offer Hash: " . ($offerHash ? "✅ $offerHash" : "❌ Não configurado") . "<br>";
echo "Product Hash: " . ($productHash ? "✅ $productHash" : "❌ Não configurado") . "<br>";

// Teste 3: Endpoint de verificação
echo "<h2>3. Teste de URL de Verificação</h2>";
$transactionId = "teste123";
$verifyUrl = "https://api.tribopay.com.br/api/public/v1/transactions/status?transaction_hash=" . urlencode($transactionId);
echo "URL correta (GET): $verifyUrl<br>";

echo "<h2>4. Status dos Arquivos</h2>";
$arquivos = [
    'api.php' => 'API principal',
    'verifica.php' => 'Verificação de pagamento',
    'tribopay_config.php' => 'Configuração',
    'gateway.log' => 'Log de debug'
];

foreach ($arquivos as $arquivo => $descricao) {
    $caminho = __DIR__ . '/' . $arquivo;
    if (file_exists($caminho)) {
        $tamanho = filesize($caminho);
        $modificado = date('d/m/Y H:i:s', filemtime($caminho));
        echo "✅ $descricao: $arquivo ($tamanho bytes, modificado em $modificado)<br>";
    } else {
        echo "❌ $descricao: $arquivo não encontrado<br>";
    }
}

echo "<h2>5. Simulação de Payload</h2>";
$testPayload = [
    'debtor_name' => 'João Silva',
    'email' => 'joao@email.com',
    'debtor_document_number' => '12345678901',
    'phone' => '11999999999',
    'amount' => 52.62, // Valor de teste
    'produtos' => [
        [
            'nome' => 'Produto Teste',
            'preco' => 52.62,
            'quantidade' => 1
        ]
    ],
    'payment_method' => 'pix'
];

$amount = toCents($testPayload['amount']);
echo "Valor do pedido: R$ " . number_format($testPayload['amount'], 2, ',', '.') . " → $amount centavos<br>";
echo "Status: " . ($amount >= 500 ? "✅ Valor válido para PIX" : "❌ Valor abaixo do mínimo (R$ 5,00)") . "<br>";

logGateway(['etapa' => 'teste_gateway', 'timestamp' => date('Y-m-d H:i:s'), 'status' => 'Testes executados']);

echo "<h2>✅ Correções Aplicadas</h2>";
echo "<ul>";
echo "<li>✅ Corrigido método POST → GET na verificação de pagamento</li>";
echo "<li>✅ Melhorada função toCents() com debug detalhado</li>";
echo "<li>✅ Adicionada validação de valor mínimo R$ 5,00</li>";
echo "<li>✅ Melhoradas mensagens de erro no front-end</li>";
echo "<li>✅ Adicionados logs detalhados para debug</li>";
echo "</ul>";

echo "<p><strong>Próximo passo:</strong> Teste fazer um pedido com valor acima de R$ 5,00 no seu site.</p>";
?>