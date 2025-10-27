// Diagnóstico TriboPay - Node.js version
import fs from 'fs';
import path from 'path';
import config from './tribopay_config.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Diagnóstico TriboPay - Node.js</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .info { color: #17a2b8; }
            .warning { color: #ffc107; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .status-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        </style>
    </head>
    <body>
        <h1>🔍 Diagnóstico TriboPay - Node.js</h1>
        <p><em>Versão Node.js convertida do PHP</em></p>
    `;

    try {
        // 1. Verificação de Arquivos
        html += '<h2>1. Verificação de Arquivos Node.js</h2>';
        const arquivos = [
            'api/api.js',
            'api/tribopay_config.js', 
            'api/tribopay_log.js',
            'api/verifica.js',
            'api/webhook.js'
        ];

        for (const arquivo of arquivos) {
            const fullPath = path.join(process.cwd(), arquivo);
            if (fs.existsSync(fullPath)) {
                html += `<p class="success">✅ ${arquivo} - OK</p>`;
            } else {
                html += `<p class="error">❌ ${arquivo} - FALTANDO</p>`;
            }
        }

        // 2. Verificação de Configuração
        html += '<h2>2. Verificação de Configuração</h2>';
        
        if (config.api_token) {
            html += '<p class="success">✅ API Token configurado</p>';
        } else {
            html += '<p class="error">❌ API Token não configurado</p>';
        }

        if (config.default_offer_hash) {
            html += '<p class="success">✅ Offer Hash configurado</p>';
        } else {
            html += '<p class="error">❌ Offer Hash não configurado</p>';
        }

        if (config.default_product_hash) {
            html += '<p class="success">✅ Product Hash configurado</p>';
        } else {
            html += '<p class="error">❌ Product Hash não configurado</p>';
        }

        // 3. Teste de Conectividade
        html += '<h2>3. Teste de Conectividade com TriboPay</h2>';
        
        try {
            const response = await fetch('https://api.tribopay.com.br/api/public/v1/transactions', {
                method: 'OPTIONS',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            html += `<p class="success">✅ Conexão com TriboPay OK (HTTP ${response.status})</p>`;
        } catch (error) {
            html += `<p class="error">❌ Erro de conexão: ${error.message}</p>`;
        }

        // 4. Informações do Sistema
        html += '<h2>4. Informações do Sistema</h2>';
        html += `<div class="status-box">`;
        html += `<p><strong>Runtime:</strong> Node.js ${process.version}</p>`;
        html += `<p><strong>Platform:</strong> ${process.platform} ${process.arch}</p>`;
        html += `<p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>`;
        html += `<p><strong>Working Directory:</strong> ${process.cwd()}</p>`;
        html += `<p><strong>Current Time:</strong> ${new Date().toISOString()}</p>`;
        html += `<p><strong>Memory Usage:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>`;
        html += `</div>`;

        // 5. Últimos Logs  
        html += '<h2>5. Últimos Logs</h2>';
        const logFile = path.join(process.cwd(), 'checkout/gateway.log');
        
        if (fs.existsSync(logFile)) {
            try {
                const logContent = fs.readFileSync(logFile, 'utf8');
                const lines = logContent.trim().split('\n');
                const lastLines = lines.slice(-10);
                
                html += '<pre>';
                for (const line of lastLines) {
                    try {
                        const logEntry = JSON.parse(line);
                        html += `[${logEntry.datetime}] ${JSON.stringify(logEntry.data, null, 2)}\n\n`;
                    } catch (e) {
                        html += `${line}\n`;
                    }
                }
                html += '</pre>';
            } catch (error) {
                html += `<p class="error">Erro ao ler logs: ${error.message}</p>`;
            }
        } else {
            html += '<p class="info">ℹ️ Nenhum log encontrado ainda</p>';
        }

        // 6. Teste da API
        html += '<h2>6. Teste Rápido da API</h2>';
        
        const testData = {
            debtor_name: 'Teste Diagnóstico',
            email: 'teste@diagnostico.com',
            debtor_document_number: '12345678901',
            phone: '11999999999',
            amount: 50.00,
            produtos: [{
                nome: 'Produto Teste Diagnóstico',
                preco: 50.00,
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

        html += '<div class="status-box">';
        html += '<p><strong>Dados de teste preparados:</strong></p>';
        html += `<pre>${JSON.stringify(testData, null, 2)}</pre>`;
        html += '<p class="info">💡 Execute um POST para /api/api.js com estes dados para testar</p>';
        html += '</div>';

        // 7. Comandos para Teste
        html += '<h2>7. Comandos para Teste Manual</h2>';
        
        html += '<div class="status-box">';
        html += '<p><strong>Testar API localmente:</strong></p>';
        html += '<pre>curl -X POST -H "Content-Type: application/json" \\\n' +
               '  -d \'{"debtor_name":"Teste","email":"teste@email.com","debtor_document_number":"12345678901","phone":"11999999999","amount":50,"produtos":[{"nome":"Produto Teste","preco":50,"quantidade":1}],"address_street":"Rua Teste","address_number":"123","address_neighborhood":"Centro","address_city":"São Paulo","address_state":"SP","address_zipcode":"01234567","payment_method":"pix"}\' \\\n' +
               '  http://localhost:8000/api/api.js</pre>';
        html += '</div>';

        html += '<div class="status-box">';
        html += '<p><strong>Testar no Vercel (após deploy):</strong></p>';
        html += '<pre>curl -X POST -H "Content-Type: application/json" \\\n' +
               '  -d \'{"debtor_name":"Teste","email":"teste@email.com","debtor_document_number":"12345678901","phone":"11999999999","amount":50,"produtos":[{"nome":"Produto Teste","preco":50,"quantidade":1}],"address_street":"Rua Teste","address_number":"123","address_neighborhood":"Centro","address_city":"São Paulo","address_state":"SP","address_zipcode":"01234567","payment_method":"pix"}\' \\\n' +
               '  https://tikt-ten.vercel.app/api/api.js</pre>';
        html += '</div>';

        html += '<div class="status-box">';
        html += '<p><strong>Testar com Node.js:</strong></p>';
        html += '<pre>npm test</pre>';
        html += '</div>';

        // 8. Configuração Vercel
        html += '<h2>8. Configuração Vercel</h2>';
        const vercelConfig = path.join(process.cwd(), 'vercel.json');
        
        if (fs.existsSync(vercelConfig)) {
            const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
            html += '<p class="success">✅ vercel.json encontrado</p>';
            html += `<pre>${JSON.stringify(config, null, 2)}</pre>`;
        } else {
            html += '<p class="error">❌ vercel.json não encontrado</p>';
        }

    } catch (error) {
        html += `<div class="status-box" style="border-left-color: #dc3545;">`;
        html += `<p class="error">❌ Erro durante diagnóstico: ${error.message}</p>`;
        html += `<pre>${error.stack}</pre>`;
        html += `</div>`;
    }
    
    html += `
        <hr>
        <p style="text-align: center; color: #6c757d;">
            <em>Diagnóstico executado em ${new Date().toLocaleString('pt-BR')}</em><br>
            <strong>Status:</strong> Node.js Runtime ✅
        </p>
    </body>
    </html>
    `;

    res.status(200).send(html);
}