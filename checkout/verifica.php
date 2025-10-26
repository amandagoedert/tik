<?php
// Arquivo para verificar status de pagamento TriboPay

require_once __DIR__ . '/tribopay_log.php';

// Permitir requisições AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Função para registrar logs
function logPaymentCheck($message) {
    logGateway([
        'etapa' => 'verificacao_status',
        'mensagem' => $message,
    ]);
}

try {
    // Pegar ID da transação
    $transactionId = $_GET['id'] ?? null;
    
    if (!$transactionId) {
        throw new Exception('ID da transação não informado');
    }
    
    logPaymentCheck("Verificando pagamento para transação: $transactionId");
    
    // Carregar configurações TriboPay
    $config = include 'tribopay_config.php';
    
    if (!$config['api_token']) {
        throw new Exception('Token da API não configurado');
    }
    
    // URL da API TriboPay para consultar transação (usando GET com query parameter)
    $apiUrl = "https://api.tribopay.com.br/api/public/v1/transactions/status?transaction_hash=" . urlencode($transactionId);

    logGateway([
        'etapa' => 'verificacao_request',
        'endpoint' => $apiUrl,
        'method' => 'GET',
        'transaction_hash' => $transactionId,
    ]);

    // Configurar cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Authorization: Bearer ' . $config['api_token'],
            'User-Agent: VictoriasSecret-Store/1.0',
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    logGateway([
        'etapa' => 'verificacao_resposta_raw',
        'status' => $httpCode,
        'erro' => $curlError,
        'response_preview' => is_string($response) ? substr($response, 0, 3000) : null,
    ]);
    
    if ($curlError) {
        throw new Exception("Erro cURL: $curlError");
    }
    
    if ($httpCode !== 200) {
        logPaymentCheck("Erro HTTP $httpCode na consulta: $response");
        throw new Exception("Erro na API (HTTP $httpCode)");
    }
    
    $apiData = json_decode($response, true);
    
    if (!$apiData) {
        throw new Exception('Resposta inválida da API');
    }
    
    logPaymentCheck("Resposta da API: " . json_encode($apiData));
    
    // Verificar status do pagamento
    $status = 'pendente'; // status padrão
    
    if (isset($apiData['status'])) {
        switch (strtolower($apiData['status'])) {
            case 'paid':
            case 'approved':
            case 'completed':
                $status = 'pago';
                break;
            case 'pending':
            case 'waiting':
                $status = 'pendente';
                break;
            case 'cancelled':
            case 'rejected':
            case 'failed':
                $status = 'cancelado';
                break;
        }
    }
    
    logPaymentCheck("Status final determinado: $status");
    
    // Retornar status
    echo json_encode([
        'success' => true,
        'status' => $status,
        'transaction_id' => $transactionId,
        'api_response' => $apiData
    ]);
    
} catch (Exception $e) {
    logPaymentCheck("Erro na verificação: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'status' => 'erro',
        'message' => $e->getMessage()
    ]);
}
