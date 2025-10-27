// Redirecionamento para Verifica Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para a verificação principal
    const { default: verificaAPI } = await import('../api/verifica.js');
    return verificaAPI(req, res);
}