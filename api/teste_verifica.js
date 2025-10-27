// Teste do arquivo verifica.js - Node.js version
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste Verifica - Node.js</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            pre { background: #f0f0f0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; overflow-x: auto; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        </style>
    </head>
    <body>
        <h2>🧪 Teste do arquivo verifica.js</h2>
    `;

    try {
        // ID de teste - pode vir da query string ou usar padrão
        const testId = req.query.id || 'qbauompjph'; // ID de teste dos logs
        
        html += `<p><strong>Testando com ID:</strong> ${testId}</p>`;

        // Fazer chamada para o verifica.js
        const baseUrl = req.headers.host?.includes('localhost') 
            ? `http://${req.headers.host}`
            : `https://${req.headers.host}`;
        
        const verificaUrl = `${baseUrl}/api/verifica.js?id=${encodeURIComponent(testId)}`;
        
        html += `<p><strong>URL testada:</strong> ${verificaUrl}</p>`;

        try {
            const response = await fetch(verificaUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            const responseText = await response.text();
            
            html += '<h3>Resultado:</h3>';
            html += `<p><strong>Status HTTP:</strong> ${response.status} ${response.statusText}</p>`;
            html += '<pre>' + responseText + '</pre>';

            // Tentar parsear como JSON
            try {
                const data = JSON.parse(responseText);
                html += '<h4>Análise da Resposta:</h4>';
                html += '<ul>';
                
                if (data.error) {
                    html += `<li class="error">❌ Erro: ${data.message}</li>`;
                } else {
                    html += `<li class="success">✅ Sucesso na consulta</li>`;
                    if (data.status) {
                        html += `<li>Status: ${data.status}</li>`;
                    }
                    if (data.transaction_id) {
                        html += `<li>Transaction ID: ${data.transaction_id}</li>`;
                    }
                    if (data.payment_status) {
                        html += `<li>Payment Status: ${data.payment_status}</li>`;
                    }
                }
                
                html += '</ul>';
            } catch (parseError) {
                html += '<p class="error">⚠️ Resposta não é JSON válido</p>';
            }

        } catch (fetchError) {
            html += '<h3>Erro na Requisição:</h3>';
            html += `<pre class="error">❌ ${fetchError.message}</pre>`;
        }

        // Instruções de uso
        html += '<hr>';
        html += '<h3>Como usar este teste:</h3>';
        html += '<ul>';
        html += '<li>Use um ID de transação real: <code>?id=seu_transaction_id</code></li>';
        html += '<li>Ou teste com diferentes IDs para verificar respostas</li>';
        html += '<li>Verifique se o status da transação está sendo consultado corretamente</li>';
        html += '</ul>';

        // Exemplo de URLs
        html += '<h3>Exemplos de teste:</h3>';
        html += '<ul>';
        html += `<li><a href="/api/teste_verifica.js?id=qbauompjph">Teste com ID padrão</a></li>`;
        html += `<li><a href="/api/teste_verifica.js?id=teste123">Teste com ID inválido</a></li>`;
        html += `<li><a href="/api/verifica.js?id=${testId}">Chamar verifica.js diretamente</a></li>`;
        html += '</ul>';

    } catch (error) {
        html += `<div style="color: red;">`;
        html += `<h3>❌ Erro durante teste:</h3>`;
        html += `<pre>${error.message}\n${error.stack}</pre>`;
        html += `</div>`;
    }

    html += `
        <hr>
        <p style="text-align: center; color: #666;">
            Teste executado em ${new Date().toLocaleString('pt-BR')}<br>
            Runtime: Node.js ${process.version}
        </p>
    </body>
    </html>
    `;

    res.status(200).send(html);
}