// Arquivo de teste simples - Node.js version
// Este arquivo pode ser usado para testes básicos da API

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    
    const testInfo = {
        status: 'success',
        message: 'API de teste funcionando',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        environment: {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch
        }
    };
    
    res.status(200).json(testInfo);
}