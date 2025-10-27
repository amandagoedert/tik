// Teste de Configuração TriboPay - Node.js version
import config from './tribopay_config.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste de Configuração TriboPay - Node.js</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .warning { color: #ffc107; }
            h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h3 { margin-top: 20px; }
            .config-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
            ol li { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>🔧 Teste de Configuração TriboPay - Node.js</h1>
        <p><em>Versão Node.js convertida do PHP</em></p>
    `;

    try {
        html += '<h2>Verificando configurações...</h2>';

        // Verificar token
        html += '<h3>Token da API:</h3>';
        if (!config.api_token || config.api_token === 'SEU_TOKEN_TRIBOPAY_AQUI') {
            html += '<p class="error">❌ Token não configurado!</p>';
            html += '<p>Você precisa substituir "SEU_TOKEN_TRIBOPAY_AQUI" pelo seu token real da TriboPay no arquivo tribopay_config.js.</p>';
        } else {
            html += `<p class="success">✅ Token configurado: ${config.api_token.substring(0, 10)}...</p>`;
        }

        // Verificar offer hash
        html += '<h3>Offer Hash:</h3>';
        if (!config.default_offer_hash || config.default_offer_hash === 'SEU_OFFER_HASH_AQUI') {
            html += '<p class="error">❌ Offer Hash não configurado!</p>';
            html += '<p>Você precisa substituir "SEU_OFFER_HASH_AQUI" pelo hash real da sua oferta na TriboPay.</p>';
        } else {
            html += `<p class="success">✅ Offer Hash configurado: ${config.default_offer_hash}</p>`;
        }

        // Verificar product hash
        html += '<h3>Product Hash:</h3>';
        if (!config.default_product_hash || config.default_product_hash === 'SEU_PRODUCT_HASH_AQUI') {
            html += '<p class="error">❌ Product Hash não configurado!</p>';
            html += '<p>Você precisa substituir "SEU_PRODUCT_HASH_AQUI" pelo hash real do seu produto na TriboPay.</p>';
        } else {
            html += `<p class="success">✅ Product Hash configurado: ${config.default_product_hash}</p>`;
        }

        // Verificar postback URL
        html += '<h3>Postback URL:</h3>';
        if (!config.postback_url) {
            html += '<p class="warning">⚠️ Postback URL não configurada (opcional)</p>';
        } else {
            html += `<p class="success">✅ Postback URL configurada: ${config.postback_url}</p>`;
        }

        // Teste de conectividade
        html += '<h2>Teste de Conectividade</h2>';
        html += '<p>Testando conexão com a API da TriboPay...</p>';

        try {
            const response = await fetch('https://api.tribopay.com.br/api/public/v1/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (response.ok) {
                html += '<p class="success">✅ Conexão com a API funcionando!</p>';
            } else {
                html += `<p class="warning">⚠️ API respondeu com código HTTP: ${response.status}</p>`;
            }
        } catch (error) {
            html += `<p class="error">❌ Erro de conexão: ${error.message}</p>`;
        }

        // Informações de configuração atual
        html += '<h2>Configuração Atual</h2>';
        html += '<div class="config-box">';
        html += `<p><strong>API URL:</strong> ${config.api_url}</p>`;
        html += `<p><strong>Environment:</strong> ${config.environment || 'production'}</p>`;
        html += `<p><strong>Debug:</strong> ${config.debug ? 'Ativado' : 'Desativado'}</p>`;
        html += '</div>';

        // Próximos passos
        html += '<hr>';
        html += '<h2>Próximos passos:</h2>';
        html += '<ol>';
        html += '<li>Se há ❌ acima, corrija as configurações no arquivo <code>api/tribopay_config.js</code></li>';
        html += '<li>Acesse o painel da TriboPay e obtenha suas credenciais reais</li>';
        html += '<li>Cadastre seus produtos no painel da TriboPay</li>';
        html += '<li>Teste uma transação real usando o endpoint <code>/api/api.js</code></li>';
        html += '<li>Configure o webhook no painel da TriboPay apontando para <code>/api/webhook.js</code></li>';
        html += '</ol>';

        // Comandos úteis
        html += '<h2>Comandos Úteis para Teste</h2>';
        html += '<div class="config-box">';
        html += '<p><strong>Testar API localmente:</strong></p>';
        html += '<pre>npm test</pre>';
        html += '<p><strong>Verificar logs:</strong></p>';
        html += '<pre>tail -f checkout/gateway.log</pre>';
        html += '<p><strong>Acessar diagnóstico completo:</strong></p>';
        html += '<pre>GET /api/diagnostico.js</pre>';
        html += '</div>';

        html += '<p><strong>Documentação TriboPay:</strong> <a href="https://docs.tribopay.com.br" target="_blank">https://docs.tribopay.com.br</a></p>';

    } catch (error) {
        html += `<div class="config-box" style="border-left: 4px solid #dc3545;">`;
        html += `<p class="error">❌ Erro durante verificação: ${error.message}</p>`;
        html += `<pre>${error.stack}</pre>`;
        html += `</div>`;
    }

    html += `
        <hr>
        <p style="text-align: center; color: #6c757d;">
            <em>Teste executado em ${new Date().toLocaleString('pt-BR')}</em><br>
            <strong>Runtime:</strong> Node.js ${process.version}
        </p>
    </body>
    </html>
    `;

    res.status(200).send(html);
}