<?php
/*
 |--------------------------------------------------------------------------
 | DIAGNÓSTICO COMPLETO TRIBOPAY
 |--------------------------------------------------------------------------
 | Execute este arquivo para diagnosticar todos os possíveis problemas
 */

echo "<h1>Diagnóstico TriboPay</h1>";

// 1. Verificar arquivos necessários
echo "<h2>1. Verificação de Arquivos</h2>";
$arquivos = [
    'api.php',
    'tribopay_config.php',
    'tribopay_log.php',
    'verifica.php',
    'webhook.php'
];

foreach ($arquivos as $arquivo) {
    if (file_exists($arquivo)) {
        echo "<p style='color:green'>✅ $arquivo - OK</p>";
    } else {
        echo "<p style='color:red'>❌ $arquivo - FALTANDO</p>";
    }
}

// 2. Verificar configuração
echo "<h2>2. Verificação de Configuração</h2>";
try {
    $config = include 'tribopay_config.php';
    
    if (isset($config['api_token']) && !empty($config['api_token'])) {
        echo "<p style='color:green'>✅ API Token configurado</p>";
    } else {
        echo "<p style='color:red'>❌ API Token não configurado</p>";
    }
    
    if (isset($config['default_offer_hash']) && !empty($config['default_offer_hash'])) {
        echo "<p style='color:green'>✅ Offer Hash configurado</p>";
    } else {
        echo "<p style='color:red'>❌ Offer Hash não configurado</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erro ao carregar configuração: " . $e->getMessage() . "</p>";
}

// 3. Teste de conectividade
echo "<h2>3. Teste de Conectividade com TriboPay</h2>";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.tribopay.com.br/api/public/v1/transactions',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CUSTOMREQUEST => 'OPTIONS',
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "<p style='color:red'>❌ Erro de conexão: $error</p>";
} else {
    echo "<p style='color:green'>✅ Conexão com TriboPay OK (HTTP $httpCode)</p>";
}

// 4. Teste da API local
echo "<h2>4. Teste da API Local</h2>";

$testData = [
    'debtor_name' => 'Teste',
    'email' => 'teste@email.com',
    'debtor_document_number' => '12345678901',
    'phone' => '11999999999',
    'amount' => 50,
    'produtos' => [
        [
            'nome' => 'Produto Teste',
            'preco' => 50,
            'quantidade' => 1
        ]
    ],
    'address_street' => 'Rua Teste',
    'address_number' => '123',
    'address_neighborhood' => 'Centro',
    'address_city' => 'São Paulo',
    'address_state' => 'SP',
    'address_zipcode' => '01234567',
    'payment_method' => 'pix'
];

// Simular requisição POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Capturar saída da API
ob_start();
$oldInput = file_get_contents('php://input');

// Mock da entrada
$mockInput = json_encode($testData);
file_put_contents('php://memory', $mockInput);

try {
    // Definir função mock para file_get_contents
    function mockFileGetContents($filename) use ($testData) {
        if ($filename === 'php://input') {
            return json_encode($testData);
        }
        return file_get_contents($filename);
    }
    
    // Não podemos fazer mock do file_get_contents diretamente
    // Vamos simular o comportamento
    echo "<p style='color:blue'>ℹ️ Para teste completo da API, use: <code>curl -X POST -H 'Content-Type: application/json' -d '...</code></p>";
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erro ao testar API: " . $e->getMessage() . "</p>";
}

$output = ob_get_clean();

// 5. Informações do sistema
echo "<h2>5. Informações do Sistema</h2>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>cURL Enabled:</strong> " . (extension_loaded('curl') ? 'Sim' : 'Não') . "</p>";
echo "<p><strong>JSON Enabled:</strong> " . (extension_loaded('json') ? 'Sim' : 'Não') . "</p>";
echo "<p><strong>Timezone:</strong> " . date_default_timezone_get() . "</p>";
echo "<p><strong>Current Time:</strong> " . date('Y-m-d H:i:s') . "</p>";

// 6. Últimos logs
echo "<h2>6. Últimos Logs</h2>";
if (file_exists('gateway.log')) {
    $logLines = file('gateway.log');
    $lastLines = array_slice($logLines, -10);
    echo "<pre>";
    foreach ($lastLines as $line) {
        $logEntry = json_decode($line, true);
        if ($logEntry) {
            echo "[{$logEntry['datetime']}] " . json_encode($logEntry['data'], JSON_PRETTY_PRINT) . "\n\n";
        }
    }
    echo "</pre>";
} else {
    echo "<p>Nenhum log encontrado</p>";
}

echo "<hr>";
echo "<h2>Comandos para Teste Manual</h2>";
echo "<p><strong>Testar API via cURL:</strong></p>";
echo "<pre>curl -X POST -H 'Content-Type: application/json' -d '{\"debtor_name\":\"Teste\",\"email\":\"teste@email.com\",\"debtor_document_number\":\"12345678901\",\"phone\":\"11999999999\",\"amount\":50,\"produtos\":[{\"nome\":\"Produto Teste\",\"preco\":50,\"quantidade\":1}],\"address_street\":\"Rua Teste\",\"address_number\":\"123\",\"address_neighborhood\":\"Centro\",\"address_city\":\"São Paulo\",\"address_state\":\"SP\",\"address_zipcode\":\"01234567\",\"payment_method\":\"pix\"}' http://localhost:8888/api.php</pre>";

echo "<p><strong>Testar no deploy:</strong></p>";
echo "<pre>curl -X POST -H 'Content-Type: application/json' -d '{...}' https://tikt-ten.vercel.app/checkout/api.php</pre>";
?>