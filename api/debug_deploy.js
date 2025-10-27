// Debug específico para deploy no Vercel - Node.js version
import fs from 'fs';
import path from 'path';
import config from './tribopay_config.js';

export default async function handler(req, res) {
    // Headers CORS
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    try {
        // Teste específico para método POST
        const methodTest = {
            current_method: req.method || 'unknown',
            post_allowed: true,
            can_handle_post: req.method === 'POST' ? 'YES' : 'Not tested (use POST request)',
            server_software: 'Vercel Serverless Functions'
        };

        const debug = {
            timestamp: new Date().toISOString(),
            method_test: methodTest,
            node_version: process.version,
            environment: {
                HTTP_HOST: req.headers.host || 'unknown',
                REQUEST_URL: req.url || 'unknown',
                HTTP_ORIGIN: req.headers.origin || 'unknown',
                CONTENT_TYPE: req.headers['content-type'] || 'unknown',
                USER_AGENT: req.headers['user-agent'] || 'unknown',
                VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
                NODE_ENV: process.env.NODE_ENV || 'unknown'
            },
            files_exist: {}
        };

        // Verificar se os arquivos Node.js existem
        const filesToCheck = [
            'api/api.js',
            'api/tribopay_config.js',
            'api/tribopay_log.js',
            'api/verifica.js',
            'api/webhook.js',
            'package.json',
            'vercel.json'
        ];

        for (const file of filesToCheck) {
            const fullPath = path.join(process.cwd(), file);
            debug.files_exist[file] = fs.existsSync(fullPath);
        }

        // Testar configuração do TriboPay
        try {
            debug.config = {
                has_api_token: !!(config.api_token && config.api_token !== 'SEU_TOKEN_TRIBOPAY_AQUI'),
                api_token_length: config.api_token ? config.api_token.length : 0,
                has_default_offer_hash: !!(config.default_offer_hash && config.default_offer_hash !== 'SEU_OFFER_HASH_AQUI'),
                has_default_product_hash: !!(config.default_product_hash && config.default_product_hash !== 'SEU_PRODUCT_HASH_AQUI'),
                api_url: config.api_url,
                environment: config.environment || 'production'
            };
        } catch (error) {
            debug.config_error = error.message;
        }

        // Testar conectividade com a API do TriboPay
        debug.tribopay_test = {};
        try {
            const response = await fetch('https://api.tribopay.com.br/api/public/v1/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            debug.tribopay_test = {
                http_code: response.status,
                status_text: response.statusText,
                accessible: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            debug.tribopay_test.error = error.message;
        }

        // Testar se consegue criar um arquivo de log
        try {
            const testLogFile = path.join(process.cwd(), 'checkout/test_log.txt');
            const testContent = `Test log: ${new Date().toISOString()}\n`;
            
            // Garantir que o diretório existe
            const logDir = path.dirname(testLogFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            fs.writeFileSync(testLogFile, testContent);
            debug.log_test = {
                can_write: true,
                bytes_written: testContent.length,
                log_directory_exists: fs.existsSync(logDir)
            };
            
            // Limpar arquivo de teste
            if (fs.existsSync(testLogFile)) {
                fs.unlinkSync(testLogFile);
            }
        } catch (error) {
            debug.log_test = { error: error.message };
        }

        // Informações de sistema
        debug.system_info = {
            platform: process.platform,
            arch: process.arch,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime(),
            cwd: process.cwd(),
            pid: process.pid
        };

        // Se for uma requisição POST, testar o payload
        if (req.method === 'POST') {
            let body = '';
            
            try {
                // Para Vercel, o body já vem parsed se for JSON
                if (req.body) {
                    debug.post_data = {
                        body_type: typeof req.body,
                        content_type: req.headers['content-type'] || 'unknown',
                        has_data: !!req.body
                    };
                    
                    if (typeof req.body === 'object') {
                        debug.post_data.keys = Object.keys(req.body);
                        debug.post_data.json_valid = true;
                    }
                } else {
                    debug.post_data = {
                        no_body: true,
                        content_type: req.headers['content-type'] || 'unknown'
                    };
                }
            } catch (error) {
                debug.post_data = { error: error.message };
            }
        }

        // Teste de variáveis de ambiente
        debug.env_test = {
            has_vercel_env: !!process.env.VERCEL,
            vercel_url: process.env.VERCEL_URL || 'unknown',
            vercel_region: process.env.VERCEL_REGION || 'unknown',
            vercel_env: process.env.VERCEL_ENV || 'unknown'
        };

        // Teste de self-API call
        if (req.headers.host) {
            try {
                const baseUrl = req.headers.host.includes('localhost') 
                    ? `http://${req.headers.host}`
                    : `https://${req.headers.host}`;
                
                const testResponse = await fetch(`${baseUrl}/api/test.js`, {
                    method: 'GET',
                    timeout: 5000
                });
                
                debug.self_api_test = {
                    can_call_self: testResponse.ok,
                    status: testResponse.status,
                    base_url: baseUrl
                };
            } catch (error) {
                debug.self_api_test = { error: error.message };
            }
        }

        res.status(200).json(debug);

    } catch (error) {
        res.status(500).json({
            error: 'Debug failed',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
}