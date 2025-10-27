// API TriboPay - Node.js version
import { logGateway } from './tribopay_log.js';

const TRIBOPAY_ENDPOINT = 'https://api.tribopay.com.br/api/public/v1/transactions';

// Configuração CORS
const ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost:5500', 
    'http://127.0.0.1:8888',
    'http://localhost:8888',
    'http://localhost:8000',
    'https://tikt-ten.vercel.app'
];

function setCorsHeaders(req, res) {
    const origin = req.headers.origin || '';
    
    if (ALLOWED_ORIGINS.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
}

function respond(res, status, payload) {
    res.status(status).json(payload);
}

function respondError(res, status, message, details = null) {
    logGateway({
        etapa: 'erro_resposta',
        status,
        message,
        details
    });
    
    respond(res, status, {
        success: false,
        error: true,
        message,
        details
    });
}

// Função para converter valor para centavos (equivalente ao PHP)
function toCents(value) {
    logGateway({
        etapa: 'toCents_debug',
        input: value,
        type: typeof value
    });

    // Se já é número, converter para centavos
    if (typeof value === 'number') {
        const result = Math.round(value * 100);
        logGateway({
            etapa: 'toCents_debug',
            input: value,
            type: 'number',
            output: result
        });
        return result;
    }

    // Se é string, limpar e converter
    if (typeof value === 'string') {
        // Remover tudo exceto números, vírgula e ponto
        let cleaned = value.replace(/[^\d,.]/g, '');
        
        // Se tem vírgula, assumir formato brasileiro (12,34)
        if (cleaned.includes(',')) {
            // Se tem ponto E vírgula, assumir ponto como milhares e vírgula como decimal
            if (cleaned.includes('.') && cleaned.includes(',')) {
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                // Só vírgula, converter para ponto
                cleaned = cleaned.replace(',', '.');
            }
        }
        
        const floatValue = parseFloat(cleaned);
        const result = Math.round(floatValue * 100);
        
        logGateway({
            etapa: 'toCents_debug',
            input: value,
            type: 'string',
            cleaned,
            floatValue,
            output: result
        });
        
        return result;
    }

    // Fallback
    const result = Math.round(parseFloat(value || 0) * 100);
    logGateway({
        etapa: 'toCents_debug',
        input: value,
        type: 'fallback',
        output: result
    });
    
    return result;
}

// Função principal da API
export default async function handler(req, res) {
    // Configurar CORS
    setCorsHeaders(req, res);
    
    // Tratar OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    // Apenas POST é permitido para esta API
    if (req.method !== 'POST') {
        return respondError(res, 405, 'Método não permitido. Use POST.');
    }

    try {
        // Log da requisição
        logGateway({
            etapa: 'raw_request',
            length: JSON.stringify(req.body).length,
            content_type: req.headers['content-type']
        });

        // Validar entrada
        const payload = req.body;
        if (!payload) {
            return respondError(res, 400, 'Payload não informado');
        }

        logGateway({
            etapa: 'input',
            payload
        });

        // Validações básicas
        const requiredFields = ['debtor_name', 'email', 'debtor_document_number', 'phone', 'amount', 'payment_method'];
        for (const field of requiredFields) {
            if (!payload[field]) {
                return respondError(res, 400, `Campo obrigatório: ${field}`);
            }
        }

        // Converter e validar valor
        const amountCents = toCents(payload.amount);
        
        // Validação do valor mínimo (R$ 5,00 = 500 centavos)
        if (amountCents < 500) {
            return respondError(res, 400, 'O valor da compra precisa ser no mínimo R$ 5,00 (exigência da TriboPay)');
        }

        // Carregar configuração
        const config = await import('./tribopay_config.js').then(m => m.default);
        
        if (!config.api_token) {
            return respondError(res, 500, 'Configuração da API não encontrada');
        }

        // Montar payload para TriboPay
        const tribopayPayload = {
            api_token: config.api_token,
            amount: amountCents,
            offer_hash: config.default_offer_hash,
            payment_method: payload.payment_method,
            customer: {
                name: payload.debtor_name,
                email: payload.email,
                phone_number: payload.phone,
                document: payload.debtor_document_number,
                street_name: payload.address_street || '',
                number: payload.address_number || '',
                neighborhood: payload.address_neighborhood || '',
                city: payload.address_city || '',
                state: payload.address_state || '',
                zip_code: payload.address_zipcode || ''
            },
            cart: [],
            expire_in_days: 1,
            transaction_origin: 'api',
            installments: 1,
            postback_url: config.postback_url
        };

        // Processar produtos
        if (payload.produtos && Array.isArray(payload.produtos)) {
            for (const produto of payload.produtos) {
                tribopayPayload.cart.push({
                    product_hash: config.default_product_hash,
                    title: produto.nome || 'Produto',
                    price: toCents(produto.preco || payload.amount),
                    quantity: produto.quantidade || 1,
                    operation_type: config.default_operation_type || 1,
                    tangible: config.default_tangible || true,
                    ...(produto.image && { cover: produto.image })
                });
            }
        } else {
            // Produto padrão
            tribopayPayload.cart.push({
                product_hash: config.default_product_hash,
                title: 'Produto',
                price: amountCents,
                quantity: 1,
                operation_type: config.default_operation_type || 1,
                tangible: config.default_tangible || true
            });
        }

        logGateway({
            etapa: 'payload',
            payload: tribopayPayload
        });

        // Fazer requisição para TriboPay
        const response = await fetch(TRIBOPAY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'VictoriasSecret-Store/1.0'
            },
            body: JSON.stringify(tribopayPayload)
        });

        const responseText = await response.text();
        
        logGateway({
            etapa: 'curl_debug',
            endpoint: TRIBOPAY_ENDPOINT,
            http_code: response.status,
            curl_error: '',
            response_preview: responseText.substring(0, 1000)
        });

        logGateway({
            etapa: 'tribopay_response_raw',
            status: response.status,
            response: responseText,
            erro: ''
        });

        if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Usar mensagem padrão se não conseguir parsear
            }
            return respondError(res, response.status, errorMessage);
        }

        // Parsear resposta
        let tribopayData;
        try {
            tribopayData = JSON.parse(responseText);
        } catch (e) {
            return respondError(res, 500, 'Resposta inválida da TriboPay');
        }

        // Verificar se a resposta tem PIX
        if (!tribopayData.pix || !tribopayData.pix.pix_url) {
            return respondError(res, 500, 'PIX não foi gerado pela TriboPay');
        }

        // Resposta de sucesso
        respond(res, 201, {
            ...tribopayData,
            success: true,
            error: false,
            transaction_id: tribopayData.hash,
            pix_url: tribopayData.pix.pix_url,
            qr_code: tribopayData.pix.pix_qr_code
        });

    } catch (error) {
        logGateway({
            etapa: 'erro_geral',
            message: error.message,
            stack: error.stack
        });
        
        return respondError(res, 500, 'Erro interno do servidor', error.message);
    }
}