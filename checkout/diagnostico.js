// Redirecionamento para Diagnóstico Node.js - Checkout compatibility layer
export default async function handler(req, res) {
    // Importar e redirecionar para o diagnóstico principal
    const { default: diagnosticoAPI } = await import('../api/diagnostico.js');
    return diagnosticoAPI(req, res);
}