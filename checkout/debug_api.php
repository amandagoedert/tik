<?php
// Teste direto da API TriboPay

// Simular dados POST
$_POST = [];
$testPayload = [
    'debtor_name' => 'João Silva',
    'email' => 'joao@email.com',
    'debtor_document_number' => '12345678901',
    'phone' => '11999999999',
    'amount' => 100,
    'produtos' => [
        [
            'nome' => 'Produto Teste',
            'preco' => 100,
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

// Simular input JSON
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode($testPayload);

// Capturar função file_get_contents para simular input
function mock_file_get_contents($filename) {
    if ($filename === 'php://input') {
        return json_encode($GLOBALS['testPayload']);
    }
    return file_get_contents($filename);
}

// Definir payload global para mock
$GLOBALS['testPayload'] = $testPayload;

echo "=== TESTE DIRETO DA API TRIBOPAY ===\n\n";
echo "Payload de teste:\n";
echo json_encode($testPayload, JSON_PRETTY_PRINT) . "\n\n";

echo "Executando API...\n";

// Capturar output
ob_start();

// Simular entrada
$mockInput = json_encode($testPayload);
file_put_contents('php://temp/input', $mockInput);

// Headers para não quebrar
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_SERVER['REQUEST_METHOD'] = 'POST';

try {
    // Incluir o arquivo de API diretamente
    $originalInput = file_get_contents('php://input');
    
    // Mock da função file_get_contents para esta sessão
    eval('
    function file_get_contents($filename, $use_include_path = false, $context = null, $offset = 0, $maxlen = null) {
        if ($filename === "php://input") {
            return json_encode($GLOBALS["testPayload"]);
        }
        return call_user_func_array("file_get_contents", func_get_args());
    }
    ');
    
    include 'api.php';
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}

$output = ob_get_clean();

echo "Resposta da API:\n";
echo $output . "\n";

// Verificar logs
if (file_exists('gateway.log')) {
    echo "\nÚltimas entradas do log:\n";
    $logLines = file('gateway.log');
    $lastLines = array_slice($logLines, -5);
    foreach ($lastLines as $line) {
        $logEntry = json_decode($line, true);
        if ($logEntry) {
            echo "[{$logEntry['datetime']}] " . json_encode($logEntry['data']) . "\n";
        }
    }
}
?>