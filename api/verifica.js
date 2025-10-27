// Verificação de status de pagamento - Node.js version
import { logGateway } from './tribopay_log.js';
import config from './tribopay_config.js';

// Função para registrar logs de verificação
function logPaymentCheck(message) {
    logGateway({
        etapa: 'verificacao_status',
        mensagem: message,
    });
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        // Pegar ID da transação (GET ou POST)
        const transactionId = req.query.id || req.body?.id;
        
        if (!transactionId) {
            throw new Error('ID da transação não informado');
        }
        
        logPaymentCheck(`Verificando pagamento para transação: ${transactionId}`);
        
        if (!config.api_token) {
            throw new Error('Token da API não configurado');
        }
        
        // URL da API TriboPay para consultar transação (usando GET com query parameter)
        const apiUrl = `https://api.tribopay.com.br/api/public/v1/transactions/status?transaction_hash=${encodeURIComponent(transactionId)}`;

        logGateway({
            etapa: 'verificacao_request',
            endpoint: apiUrl,
            method: 'GET',
            transaction_hash: transactionId,
        });

        // Fazer requisição para TriboPay
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${config.api_token}`,
                'User-Agent': 'VictoriasSecret-Store/1.0',
            }
        });

        const responseText = await response.text();

        logGateway({
            etapa: 'verificacao_resposta_raw',
            status: response.status,
            erro: '',
            response_preview: responseText.substring(0, 3000)
        });
        
        if (!response.ok) {
            logPaymentCheck(`Erro HTTP ${response.status} na consulta: ${responseText}`);
            throw new Error(`Erro na API (HTTP ${response.status})`);
        }
        
        let apiData;
        try {
            apiData = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Resposta inválida da API');
        }
        
        logPaymentCheck(`Resposta da API: ${JSON.stringify(apiData)}`);
        
        // Verificar status do pagamento
        let status = 'pendente'; // status padrão
        
        if (apiData.status) {
            switch (apiData.status.toLowerCase()) {
                case 'paid':
                case 'approved':
                case 'completed':
                    status = 'pago';
                    break;
                case 'pending':
                case 'waiting':
                    status = 'pendente';
                    break;
                case 'cancelled':
                case 'rejected':
                case 'failed':
                    status = 'cancelado';
                    break;
            }
        }
        
        logPaymentCheck(`Status final determinado: ${status}`);
        
        // Retornar status
        res.status(200).json({
            success: true,
            status: status,
            transaction_id: transactionId,
            api_response: apiData
        });
        
    } catch (error) {
        logPaymentCheck(`Erro na verificação: ${error.message}`);
        
        res.status(500).json({
            success: false,
            status: 'erro',
            message: error.message
        });
    }
}