// Teste de Transação TriboPay - Node.js version
import config from './tribopay_config.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste de Transação TriboPay - Node.js</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .info { color: #17a2b8; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .result-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        </style>
    </head>
    <body>
        <h1>🧪 Teste de Transação TriboPay - Node.js</h1>
        <p><em>Versão Node.js convertida do PHP</em></p>
    `;

    try {
        // Dados de teste
        const testData = {
            debtor_name: 'João Silva',
            email: 'joao@email.com',
            debtor_document_number: '12345678901',
            phone: '11999887766',
            amount: 99.90,
            produtos: [{
                nome: 'Produto Teste',
                preco: 99.90,
                quantidade: 1,
                imagem: 'teste.jpg'
            }],
            address_street: 'Rua Teste',
            address_number: '123',
            address_complement: '',
            address_neighborhood: 'Centro',
            address_city: 'São Paulo',
            address_state: 'SP',
            address_zipcode: '01234567',
            payment_method: 'pix'
        };

        html += '<h2>Dados de Teste:</h2>';
        html += `<pre>${JSON.stringify(testData, null, 2)}</pre>`;

        html += '<h2>Enviando para API...</h2>';

        // Fazer requisição para api.js
        try {
            const baseUrl = req.headers.host?.includes('localhost') 
                ? `http://${req.headers.host}`
                : `https://${req.headers.host}`;
            
            const apiUrl = `${baseUrl}/api/api.js`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData),
                timeout: 30000
            });

            const responseText = await response.text();
            
            html += '<h3>Resultado:</h3>';
            html += `<div class="result-box">`;
            html += `<p><strong>URL testada:</strong> ${apiUrl}</p>`;
            html += `<p><strong>Código HTTP:</strong> ${response.status}</p>`;
            html += `<p><strong>Status:</strong> ${response.statusText}</p>`;
            html += `</div>`;

            html += '<p><strong>Resposta:</strong></p>';
            html += `<pre>${responseText}</pre>`;
            
            try {
                const data = JSON.parse(responseText);
                
                html += '<h3>Análise:</h3>';
                html += `<div class="result-box">`;
                
                if (data.error) {
                    html += `<p class="error">❌ Erro: ${data.message}</p>`;
                    if (data.details) {
                        html += `<p><strong>Detalhes:</strong> ${JSON.stringify(data.details)}</p>`;
                    }
                } else {
                    html += '<p class="success">✅ Sucesso! Transação criada.</p>';
                    
                    if (data.qr_code_image_url) {
                        html += `<p class="info">🎯 QR Code disponível: <a href="${data.qr_code_image_url}" target="_blank">Visualizar</a></p>`;
                    }
                    
                    if (data.pix_copy_paste) {
                        html += '<p class="info">📋 PIX Copia e Cola disponível</p>';
                        html += `<pre style="font-size: 12px; word-break: break-all;">${data.pix_copy_paste}</pre>`;
                    }
                    
                    if (data.transaction_id) {
                        html += `<p class="info">🆔 ID da Transação: ${data.transaction_id}</p>`;
                    }

                    if (data.transaction_status) {
                        html += `<p class="info">📊 Status: ${data.transaction_status}</p>`;
                    }
                }
                
                html += `</div>`;
                
            } catch (parseError) {
                html += '<div class="result-box">';
                html += '<p class="error">❌ Erro ao analisar resposta JSON</p>';
                html += `<p>Resposta bruta recebida (primeiros 500 caracteres):</p>`;
                html += `<pre>${responseText.substring(0, 500)}</pre>`;
                html += '</div>';
            }
            
        } catch (fetchError) {
            html += '<div class="result-box" style="border-left-color: #dc3545;">';
            html += `<p class="error">❌ Erro na requisição: ${fetchError.message}</p>`;
            html += `<p><strong>Tipo do erro:</strong> ${fetchError.name}</p>`;
            html += '</div>';
            
            // Sugestões de solução
            html += '<h3>Possíveis soluções:</h3>';
            html += '<ul>';
            html += '<li>Verifique se o servidor está rodando</li>';
            html += '<li>Confirme se o endpoint /api/api.js está configurado</li>';
            html += '<li>Verifique a configuração no arquivo tribopay_config.js</li>';
            html += '<li>Teste com o comando: <code>npm test</code></li>';
            html += '</ul>';
        }

        // Comandos alternativos
        html += '<h2>Comandos Alternativos para Teste</h2>';
        
        html += '<div class="result-box">';
        html += '<p><strong>Testar com cURL:</strong></p>';
        html += '<pre>curl -X POST -H "Content-Type: application/json" \\\n' +
               `  -d '${JSON.stringify(testData)}' \\\n` +
               '  http://localhost:8000/api/api.js</pre>';
        html += '</div>';

        html += '<div class="result-box">';
        html += '<p><strong>Testar com npm:</strong></p>';
        html += '<pre>npm test</pre>';
        html += '</div>';

        html += '<div class="result-box">';
        html += '<p><strong>Verificar logs:</strong></p>';
        html += '<pre>tail -f checkout/gateway.log</pre>';
        html += '</div>';

    } catch (error) {
        html += `<div class="result-box" style="border-left-color: #dc3545;">`;
        html += `<p class="error">❌ Erro durante teste: ${error.message}</p>`;
        html += `<pre>${error.stack}</pre>`;
        html += `</div>`;
    }

    html += '<hr>';
    html += '<p><a href="/api/teste_config.js">← Voltar para teste de configuração</a></p>';

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