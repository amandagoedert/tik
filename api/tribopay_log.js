// Sistema de logs para Node.js - equivalente ao tribopay_log.php
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'checkout/gateway.log');

export function logGateway(data) {
    try {
        const logEntry = {
            datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            data: data
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        // Criar diretório se não existir
        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Escrever no arquivo de log
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
        console.error('Erro ao escrever log:', error);
    }
}

export default logGateway;