// Debug da API TriboPay - Node.js version
import config from './tribopay_config.js';
import { logInfo, logError } from './tribopay_log.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Debug API TriboPay - Node.js</title>
        <style>
            body { font-family: monospace; max-width: 1200px; margin: 0 auto; padding: 20px; background: #1e1e1e; color: #fff; }
            .success { color: #4caf50; }
            .error { color: #f44336; }
            .info { color: #2196f3; }
            .warning { color: #ff9800; }
            pre { background: #2d2d2d; padding: 15px; border-radius: 5px; overflow-x: auto; border-left: 4px solid #4caf50; }
            .error-box { background: #2d2d2d; border-left: 4px solid #f44336; }
            .info-box { background: #2d2d2d; border-left: 4px solid #2196f3; }
            h2 { border-bottom: 2px solid #4caf50; padding-bottom: 10px; }
        </style>
    </head>
    <body>
        <h1>🔍 Debug API TriboPay - Node.js</h1>
        <p><em>Teste direto da API com dados simulados</em></p>
    `;

    try {
        // Dados de teste
        const testPayload = {
            debtor_name: 'João Silva',
            email: 'joao@email.com',
            debtor_document_number: '12345678901',
            phone: '11999999999',
            amount: 100,
            produtos: [{
                nome: 'Produto Teste',
                preco: 100,
                quantidade: 1
            }],
            address_street: 'Rua Teste',
            address_number: '123',
            address_neighborhood: 'Centro',
            address_city: 'São Paulo',
            address_state: 'SP',
            address_zipcode: '01234567',
            payment_method: 'pix'
        };

        html += '<h2>Payload de Teste:</h2>';
        html += `<pre>${JSON.stringify(testPayload, null, 2)}</pre>`;

        html += '<h2>Executando API...</h2>';
        
        // Log do início do debug
        await logInfo('Debug API iniciado', { payload: testPayload });

        // Fazer chamada para a própria API
        const baseUrl = req.headers.host?.includes('localhost') 
            ? `http://${req.headers.host}`
            : `https://${req.headers.host}`;
        
        const apiUrl = `${baseUrl}/api/api.js`;
        
        html += `<p class="info">🔗 Testando URL: ${apiUrl}</p>`;

        const startTime = Date.now();
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'TriboPay-Debug/1.0'
                },
                body: JSON.stringify(testPayload),
                timeout: 30000
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const responseText = await response.text();
            
            html += '<h2>Resposta da API:</h2>';
            html += `<div class="info-box">`;
            html += `<pre>Status: ${response.status} ${response.statusText}
Tempo de resposta: ${responseTime}ms
Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}</pre>`;
            html += `</div>`;

            html += '<h3>Corpo da Resposta:</h3>';
            html += `<pre>${responseText}</pre>`;

            // Tentar parsear JSON
            try {
                const data = JSON.parse(responseText);
                
                html += '<h3>Análise da Resposta:</h3>';
                html += '<div class="info-box">';
                html += '<pre>';
                
                if (data.error) {
                    html += `❌ ERRO: ${data.message}\n`;
                    if (data.details) {
                        html += `Detalhes: ${JSON.stringify(data.details, null, 2)}\n`;
                    }
                    await logError('Debug API - Erro', { error: data });
                } else {
                    html += '✅ SUCESSO!\n';
                    html += `Transaction ID: ${data.transaction_id || 'N/A'}\n`;
                    html += `Status: ${data.transaction_status || data.payment_status || 'N/A'}\n`;
                    html += `Amount: R$ ${(data.amount / 100).toFixed(2)}\n`;
                    
                    if (data.pix_url || data.qr_code) {
                        html += `PIX Code: ${(data.pix_url || data.qr_code).substring(0, 50)}...\n`;
                    }
                    
                    await logInfo('Debug API - Sucesso', { 
                        transaction_id: data.transaction_id,
                        status: data.payment_status,
                        amount: data.amount
                    });
                }
                
                html += '</pre>';
                html += '</div>';
                
            } catch (parseError) {
                html += '<div class="error-box">';
                html += `<pre>❌ Erro ao parsear JSON: ${parseError.message}</pre>`;
                html += '</div>';
            }

        } catch (fetchError) {
            html += '<div class="error-box">';
            html += `<pre>❌ Erro na requisição: ${fetchError.message}
Tipo: ${fetchError.name}
Stack: ${fetchError.stack}</pre>`;
            html += '</div>';
            
            await logError('Debug API - Erro de requisição', { 
                error: fetchError.message,
                url: apiUrl 
            });
        }

        // Informações de debug do sistema
        html += '<h2>Informações de Debug do Sistema:</h2>';
        html += '<div class="info-box">';
        html += '<pre>';
        html += `Node.js: ${process.version}\n`;
        html += `Platform: ${process.platform} ${process.arch}\n`;
        html += `Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\n`;
        html += `Uptime: ${Math.round(process.uptime())}s\n`;
        html += `Environment: ${process.env.NODE_ENV || 'development'}\n`;
        html += `CWD: ${process.cwd()}\n`;
        html += '</pre>';
        html += '</div>';

        // Configuração atual
        html += '<h2>Configuração Atual:</h2>';
        html += '<div class="info-box">';
        html += '<pre>';
        html += `API URL: ${config.api_url}\n`;
        html += `Token: ${config.api_token ? config.api_token.substring(0, 10) + '...' : 'NÃO CONFIGURADO'}\n`;
        html += `Offer Hash: ${config.default_offer_hash || 'NÃO CONFIGURADO'}\n`;
        html += `Product Hash: ${config.default_product_hash || 'NÃO CONFIGURADO'}\n`;
        html += `Debug: ${config.debug ? 'ATIVO' : 'INATIVO'}\n`;
        html += '</pre>';
        html += '</div>';

        // Headers da requisição atual
        html += '<h2>Headers da Requisição Debug:</h2>';
        html += '<div class="info-box">';
        html += `<pre>${JSON.stringify(req.headers, null, 2)}</pre>`;
        html += '</div>';

    } catch (error) {
        html += '<div class="error-box">';
        html += `<pre>❌ Erro durante debug: ${error.message}
Stack: ${error.stack}</pre>`;
        html += '</div>';
        
        await logError('Debug API - Erro geral', { error: error.message });
    }

    html += `
        <hr>
        <h2>Comandos Úteis:</h2>
        <div class="info-box">
            <pre>npm test                    # Testar via script
curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify({ amount: 50, payment_method: 'pix' })}' ${req.headers.host}/api/api.js
tail -f checkout/gateway.log # Ver logs em tempo real</pre>
        </div>
        
        <hr>
        <p style="text-align: center; color: #666;">
            Debug executado em ${new Date().toLocaleString('pt-BR')}<br>
            Runtime: Node.js ${process.version}
        </p>
    </body>
    </html>
    `;

    res.status(200).send(html);
}