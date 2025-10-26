<?php
/*
 |--------------------------------------------------------------------------
 | TESTE DE CONFIGURAÇÃO TRIBOPAY
 |--------------------------------------------------------------------------
 | Execute este arquivo para verificar se sua configuração está correta
 */

echo "<h1>Teste de Configuração TriboPay</h1>";

// Verificar se o arquivo de configuração existe
$configFile = 'tribopay_config.php';
if (!file_exists($configFile)) {
    echo "<p style='color:red'>❌ Arquivo tribopay_config.php não encontrado!</p>";
    echo "<p>Copie o arquivo tribopay_config_exemplo.php para tribopay_config.php e preencha com seus dados reais.</p>";
    exit;
}

// Carregar configuração
$config = include $configFile;

echo "<h2>Verificando configurações...</h2>";

// Verificar token
echo "<h3>Token da API:</h3>";
if (!isset($config['api_token']) || empty($config['api_token']) || $config['api_token'] === 'SEU_TOKEN_TRIBOPAY_AQUI') {
    echo "<p style='color:red'>❌ Token não configurado!</p>";
    echo "<p>Você precisa substituir 'SEU_TOKEN_TRIBOPAY_AQUI' pelo seu token real da TriboPay.</p>";
} else {
    echo "<p style='color:green'>✅ Token configurado: " . substr($config['api_token'], 0, 10) . "...</p>";
}

// Verificar offer hash
echo "<h3>Offer Hash:</h3>";
if (!isset($config['default_offer_hash']) || empty($config['default_offer_hash']) || $config['default_offer_hash'] === 'SEU_OFFER_HASH_AQUI') {
    echo "<p style='color:red'>❌ Offer Hash não configurado!</p>";
    echo "<p>Você precisa substituir 'SEU_OFFER_HASH_AQUI' pelo hash real da sua oferta na TriboPay.</p>";
} else {
    echo "<p style='color:green'>✅ Offer Hash configurado: " . $config['default_offer_hash'] . "</p>";
}

// Verificar product hash
echo "<h3>Product Hash:</h3>";
if (!isset($config['default_product_hash']) || empty($config['default_product_hash']) || $config['default_product_hash'] === 'SEU_PRODUCT_HASH_AQUI') {
    echo "<p style='color:red'>❌ Product Hash não configurado!</p>";
    echo "<p>Você precisa substituir 'SEU_PRODUCT_HASH_AQUI' pelo hash real do seu produto na TriboPay.</p>";
} else {
    echo "<p style='color:green'>✅ Product Hash configurado: " . $config['default_product_hash'] . "</p>";
}

// Verificar postback URL
echo "<h3>Postback URL:</h3>";
if (!isset($config['postback_url']) || empty($config['postback_url'])) {
    echo "<p style='color:orange'>⚠️ Postback URL não configurada (opcional)</p>";
} else {
    echo "<p style='color:green'>✅ Postback URL configurada: " . $config['postback_url'] . "</p>";
}

// Teste de conectividade
echo "<h2>Teste de Conectividade</h2>";
echo "<p>Testando conexão com a API da TriboPay...</p>";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.tribopay.com.br/api/public/v1/health',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "<p style='color:red'>❌ Erro de conexão: $error</p>";
} elseif ($httpCode === 200) {
    echo "<p style='color:green'>✅ Conexão com a API funcionando!</p>";
} else {
    echo "<p style='color:orange'>⚠️ API respondeu com código HTTP: $httpCode</p>";
}

echo "<hr>";
echo "<h2>Próximos passos:</h2>";
echo "<ol>";
echo "<li>Se há ❌ acima, corrija as configurações no arquivo tribopay_config.php</li>";
echo "<li>Acesse o painel da TriboPay e obtenha suas credenciais reais</li>";
echo "<li>Cadastre seus produtos no painel da TriboPay</li>";
echo "<li>Teste uma transação real usando o formulário de checkout</li>";
echo "</ol>";

echo "<p><strong>Documentação TriboPay:</strong> <a href='https://docs.tribopay.com.br' target='_blank'>https://docs.tribopay.com.br</a></p>";
?>