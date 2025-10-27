// Webhook TriboPay - Node.js version
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Configurar headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tratar OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        // Receber payload
        const payload = req.body;
        
        // Log do webhook
        const logFile = path.join(process.cwd(), 'checkout/tribopay_postback.log');
        const logEntry = {
            datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            payload: payload,
            method: req.method,
            headers: req.headers
        };

        // Criar diretório se não existir
        const logDir = path.dirname(logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Escrever log
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

        // Processar webhook
        const hash = payload?.hash || payload?.data?.hash;
        const status = payload?.status || payload?.data?.status;
        
        if (hash && status) {
            // TODO: Implementar atualização do status do pedido
            // await updateOrderStatus(hash, status);
            console.log(`Webhook recebido: ${hash} - ${status}`);
        }

        // Resposta de sucesso
        res.status(200).json({ 
            received: true, 
            hash,
            status,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).json({ 
            received: false, 
            error: error.message 
        });
    }
}