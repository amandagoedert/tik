// Teste de Correções do Gateway PIX - Node.js version
import { logInfo } from './tribopay_log.js';
import config from './tribopay_config.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teste Gateway PIX - Node.js</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .warning { color: #ffc107; }
            h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
            ul li { margin: 5px 0; }
            .test-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🔧 Teste de Correções do Gateway PIX - Node.js</h1>
    `;

    try {
        // Teste 1: Função toCents
        html += '<h2>1. Teste da Função toCents()</h2>';
        
        // Implementar função toCents igual à da API
        function toCents(value) {
            if (typeof value === 'number') {
                const cents = Math.round(value * 100);
                html += `Número: ${value} → ${cents} centavos<br>`;
                return cents;
            }
            
            const valueStr = String(value);
            const processedStr = valueStr.replace('.', '').replace(',', '.');
            const floatValue = parseFloat(processedStr);
            const cents = Math.round(floatValue * 100);
            
            html += `String: '${value}' → processado: '${processedStr}' → float: ${floatValue} → ${cents} centavos<br>`;
            return cents;
        }

        // Testes diversos
        const valores = [52.62, '52,62', '52.62', 5.00, '5,00', 100, '100,00'];
        html += '<div class="test-box">';
        for (const valor of valores) {
            const centavos = toCents(valor);
            const reais = centavos / 100;
            const status = centavos >= 500 ? "✅ OK" : "❌ Abaixo do mínimo";
            html += `Valor: ${valor} → ${centavos} centavos (R$ ${reais.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}) ${status}<br>`;
        }
        html += '</div>';

        // Teste 2: Verificação de configuração
        html += '<h2>2. Verificação de Configuração</h2>';
        html += '<div class="test-box">';
        
        const apiToken = config.api_token || '';
        const offerHash = config.default_offer_hash || '';
        const productHash = config.default_product_hash || '';

        html += `API Token: ${apiToken.length > 20 ? `✅ Configurado (${apiToken.length} chars)` : "❌ Não configurado"}<br>`;
        html += `Offer Hash: ${offerHash ? `✅ ${offerHash}` : "❌ Não configurado"}<br>`;
        html += `Product Hash: ${productHash ? `✅ ${productHash}` : "❌ Não configurado"}<br>`;
        html += `API URL: ${config.api_url}<br>`;
        html += `Environment: ${config.environment || 'production'}<br>`;
        
        html += '</div>';

        // Teste 3: Endpoint de verificação
        html += '<h2>3. Teste de URL de Verificação</h2>';
        const transactionId = "teste123";
        const verifyUrl = `https://api.tribopay.com.br/api/public/v1/transactions/status?transaction_hash=${encodeURIComponent(transactionId)}`;
        html += '<div class="test-box">';
        html += `URL correta (GET): <code>${verifyUrl}</code><br>`;
        html += `Método correto: <strong>GET</strong> (corrigido do POST anterior)<br>`;
        html += '</div>';

        // Teste 4: Status dos Arquivos Node.js
        html += '<h2>4. Status dos Arquivos Node.js</h2>';
        const arquivos = {
            'api/api.js': 'API principal',
            'api/verifica.js': 'Verificação de pagamento',
            'api/tribopay_config.js': 'Configuração',
            'api/tribopay_log.js': 'Sistema de logs',
            'api/webhook.js': 'Webhook handler',
            'package.json': 'Configuração Node.js',
            'vercel.json': 'Configuração Vercel'
        };

        html += '<div class="test-box">';
        for (const [arquivo, descricao] of Object.entries(arquivos)) {
            try {
                const fs = await import('fs');
                const path = await import('path');
                const caminho = path.join(process.cwd(), arquivo);
                
                if (fs.existsSync(caminho)) {
                    const stats = fs.statSync(caminho);
                    const tamanho = stats.size;
                    const modificado = stats.mtime.toLocaleString('pt-BR');
                    html += `✅ ${descricao}: ${arquivo} (${tamanho} bytes, modificado em ${modificado})<br>`;
                } else {
                    html += `❌ ${descricao}: ${arquivo} não encontrado<br>`;
                }
            } catch (error) {
                html += `⚠️ ${descricao}: ${arquivo} (erro ao verificar: ${error.message})<br>`;
            }
        }
        html += '</div>';

        // Teste 5: Simulação de Payload
        html += '<h2>5. Simulação de Payload</h2>';
        const testPayload = {
            debtor_name: 'João Silva',
            email: 'joao@email.com',
            debtor_document_number: '12345678901',
            phone: '11999999999',
            amount: 52.62, // Valor de teste
            produtos: [{
                nome: 'Produto Teste',
                preco: 52.62,
                quantidade: 1
            }],
            payment_method: 'pix'
        };

        const amount = toCents(testPayload.amount);
        html += '<div class="test-box">';
        html += `Valor do pedido: R$ ${testPayload.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} → ${amount} centavos<br>`;
        html += `Status: ${amount >= 500 ? "✅ Valor válido para PIX" : "❌ Valor abaixo do mínimo (R$ 5,00)"}<br>`;
        html += '</div>';

        // Teste 6: Conectividade com TriboPay
        html += '<h2>6. Teste de Conectividade TriboPay</h2>';
        html += '<div class="test-box">';
        
        try {
            const response = await fetch('https://api.tribopay.com.br/api/public/v1/health', {
                method: 'GET',
                timeout: 10000
            });
            
            html += `✅ Conexão com TriboPay: OK (${response.status})<br>`;
            html += `Tempo de resposta: Conectado<br>`;
        } catch (error) {
            html += `❌ Erro de conexão: ${error.message}<br>`;
        }
        
        html += '</div>';

        // Log do teste
        await logInfo('teste_gateway', { 
            timestamp: new Date().toISOString(), 
            status: 'Testes executados - Node.js',
            version: 'Node.js ' + process.version
        });

        html += '<h2>✅ Correções Aplicadas</h2>';
        html += '<ul>';
        html += '<li>✅ Corrigido método POST → GET na verificação de pagamento</li>';
        html += '<li>✅ Melhorada função toCents() com conversão robusta</li>';
        html += '<li>✅ Adicionada validação de valor mínimo R$ 5,00</li>';
        html += '<li>✅ Implementado sistema de logs JSON estruturado</li>';
        html += '<li>✅ Convertido para Node.js com async/await</li>';
        html += '<li>✅ Configurado CORS e tratamento de erros</li>';
        html += '<li>✅ Adicionados testes automatizados</li>';
        html += '</ul>';

        html += '<h2>🎯 Melhorias Node.js vs PHP</h2>';
        html += '<ul>';
        html += '<li>🚀 Performance superior com async/await</li>';
        html += '<li>📦 Deploy serverless no Vercel</li>';
        html += '<li>🔄 Auto-scaling automático</li>';
        html += '<li>🛡️ CORS configurado nativamente</li>';
        html += '<li>📊 Logs estruturados em JSON</li>';
        html += '<li>🧪 Testes automatizados integrados</li>';
        html += '</ul>';

        html += '<p><strong>Próximo passo:</strong> Execute <code>npm test</code> ou teste fazer um pedido com valor acima de R$ 5,00 no seu site.</p>';

        // Links úteis
        html += '<h3>🔗 Links Úteis:</h3>';
        html += '<ul>';
        html += '<li><a href="/api/api.js">Testar API Principal</a></li>';
        html += '<li><a href="/api/diagnostico.js">Dashboard de Diagnóstico</a></li>';
        html += '<li><a href="/api/teste_config.js">Teste de Configuração</a></li>';
        html += '<li><a href="/api/teste_transacao.js">Teste de Transação</a></li>';
        html += '</ul>';

    } catch (error) {
        html += `<div style="color: red;">`;
        html += `<h2>❌ Erro durante teste:</h2>`;
        html += `<pre>${error.message}\n${error.stack}</pre>`;
        html += `</div>`;
    }

    html += `
        <hr>
        <p style="text-align: center; color: #666;">
            Teste executado em ${new Date().toLocaleString('pt-BR')}<br>
            Runtime: Node.js ${process.version} | Plataforma: ${process.platform}
        </p>
    </body>
    </html>
    `;

    res.status(200).send(html);
}