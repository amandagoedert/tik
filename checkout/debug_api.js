// Redirecionamento para Debug API Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o debug da API principal
    const { default: debugApiAPI } = await import('../api/debug_api.js');
    return debugApiAPI(req, res);
}